import { Network } from '@capacitor/network';
import { LocalNotifications } from '@capacitor/local-notifications';
import apiService from '../api/apiService';
import { syncQueueStore } from '../db/localVault';

/**
 * Resilient Sync Engine
 * Handles automatic syncing of offline results when connection is restored
 */

let networkListener = null;
let isSyncing = false;
let syncCallback = null;
let networkStatusCallback = null;

export const syncService = {
    /**
     * Initialize the sync engine
     * Registers network status listener
     */
    async init(onSyncStatusChange = null, onNetworkStatusChange = null) {
        syncCallback = onSyncStatusChange;
        networkStatusCallback = onNetworkStatusChange;

        // Get initial network status
        const status = await Network.getStatus();
        console.log('Initial network status:', status.connected ? 'Online' : 'Offline');

        // Register network status listener
        networkListener = await Network.addListener('networkStatusChange', async (status) => {
            console.log('Network status changed:', status.connected ? 'Online' : 'Offline');

            /**
             * Step 3: Network Toast Notifications
             * Event 1: Network Lost (Disconnect)
             */
            if (!status.connected) {
                console.log('📴 OFFLINE - Entering offline mode');
                if (networkStatusCallback) {
                    networkStatusCallback('offline', 'Network Lost: Entering Offline Mode - All work will be saved locally.');
                }
            } else {
                /**
                 * Event 2: Network Restored (Reconnect)
                 * Check if there are pending items in sync queue
                 */
                const queueStats = await syncQueueStore.getQueueStats();
                if (queueStats.pending > 0) {
                    console.log(`📡 ONLINE - ${queueStats.pending} items waiting to sync`);
                    if (networkStatusCallback) {
                        networkStatusCallback(
                            'reconnect',
                            `Network Restored: Syncing ${queueStats.pending} pending assessment${queueStats.pending !== 1 ? 's' : ''}...`
                        );
                    }
                } else {
                    console.log('📡 ONLINE - No items to sync');
                }

                // Connection restored - trigger sync
                await this.syncOfflineResults();
            }
        });

        // Check queue on init
        await this.checkAndSyncQueue();
    },

    /**
     * Manually trigger sync
     */
    async checkAndSyncQueue() {
        const queue = await syncQueueStore.getQueue();
        if (queue.length > 0 && !(await Network.getStatus()).connected) {
            console.log('Offline - Cannot sync. Items in queue:', queue.length);
            return;
        }
        await this.syncOfflineResults();
    },

    /**
     * Main sync logic - syncs all pending items in queue
     */
    async syncOfflineResults() {
        if (isSyncing) {
            console.log('Sync already in progress...');
            return;
        }

        isSyncing = true;
        if (syncCallback) syncCallback('syncing');

        try {
            const queueItems = await syncQueueStore.getQueue();

            if (queueItems.length === 0) {
                console.log('No items to sync');
                if (syncCallback) syncCallback('idle');
                isSyncing = false;
                return;
            }

            console.log(`Syncing ${queueItems.length} offline results...`);

            let successCount = 0;
            let failedCount = 0;

            for (const item of queueItems) {
                try {
                    // Mark as syncing
                    await syncQueueStore.updateStatus(item.id, 'syncing');

                    // Prepare payload
                    const payload = {
                        attempts: [
                            {
                                test_id: item.test_id,
                                trainee_id: item.trainee_id,
                                score: item.score,
                                total_marks: item.total_marks,
                                percentage: item.percentage,
                                passed: item.passed,
                                offline_timestamp: item.offline_timestamp,
                            },
                        ],
                    };

                    // Send to backend
                    const response = await apiService.syncOfflineResults(payload.attempts);

                    if (response.status === 200) {
                        // Success - remove from queue
                        await syncQueueStore.removeFromQueue(item.id);
                        successCount++;
                        console.log(`✓ Synced offline result ${item.test_id}`);
                    } else {
                        throw new Error('Sync response not OK');
                    }
                } catch (error) {
                    failedCount++;
                    console.error(`✗ Failed to sync item ${item.id}:`, error);
                    await syncQueueStore.updateStatus(item.id, 'failed', error.message);
                }
            }

            console.log(
                `Sync complete: ${successCount} succeeded, ${failedCount} failed`
            );

            /**
             * Event 3: Sync Complete
             * Show success toast when all results synced
             */
            if (successCount > 0 && failedCount === 0) {
                if (networkStatusCallback) {
                    networkStatusCallback(
                        'synced',
                        'Sync Complete: Your records are now safe on the server.'
                    );
                }
            }

            if (syncCallback) {
                syncCallback('idle', {
                    successCount,
                    failedCount,
                    totalItems: queueItems.length,
                });
            }
        } catch (error) {
            console.error('Sync engine error:', error);
            if (syncCallback) syncCallback('error', error.message);
        } finally {
            isSyncing = false;
        }
    },

    /**
     * Get current sync status
     */
    async getSyncStatus() {
        return {
            isSyncing,
            queueStats: await syncQueueStore.getQueueStats(),
            isOnline: (await Network.getStatus()).connected,
        };
    },

    /**
     * Cleanup - remove network listener
     */
    destroy() {
        if (networkListener) {
            networkListener.remove();
            networkListener = null;
        }
    },
};

/**
 * Auto-Archive Service
 * Runs on app launch and archives modules inactive for 30+ days
 */
export const autoArchiveService = {
    /**
     * Check for inactive modules and archive them
     */
    async checkAndArchiveInactive() {
        const { downloadedModulesStore } = await import('../db/localVault');

        const inactiveModules = await downloadedModulesStore.getInactiveModules(30);

        console.log(`Found ${inactiveModules.length} inactive modules (>30 days)`);

        for (const module of inactiveModules) {
            await downloadedModulesStore.archiveModule(module.id);
            console.log(`✓ Archived module: ${module.title}`);
        }

        return inactiveModules.length;
    },

    /**
     * Check for modules approaching inactivity threshold
     * Send notifications at 25 and 28 days
     */
    async checkAndNotifyNearInactivity() {
        const { downloadedModulesStore } = await import('../db/localVault');
        const allModules = await downloadedModulesStore.getAllModules();
        const now = new Date();

        const MS_25_DAYS = 25 * 24 * 60 * 60 * 1000;
        const MS_28_DAYS = 28 * 24 * 60 * 60 * 1000;

        for (const module of allModules) {
            if (!module.is_locally_cached) continue;

            const timeSinceAccess = now.getTime() - new Date(module.last_accessed_at).getTime();

            if (timeSinceAccess >= MS_28_DAYS && timeSinceAccess < MS_28_DAYS + 60000) {
                // 28 days - final warning
                await this.sendNotification(
                    `${module.title} will be archived in 2 days`,
                    'Review your progress before archival'
                );
                console.log(`📢 28-day warning for: ${module.title}`);
            } else if (timeSinceAccess >= MS_25_DAYS && timeSinceAccess < MS_25_DAYS + 60000) {
                // 25 days - warning
                await this.sendNotification(
                    `${module.title} inactive for 25 days`,
                    'Will be archived in 5 days if not accessed'
                );
                console.log(`📢 25-day warning for: ${module.title}`);
            }
        }
    },

    /**
     * Send local notification (Capacitor)
     */
    async sendNotification(title, message) {
        try {
            await LocalNotifications.schedule({
                notifications: [
                    {
                        title,
                        body: message,
                        id: Math.floor(Math.random() * 100000),
                        schedule: { at: new Date(Date.now() + 1000) },
                        smallIcon: 'icon',
                        iconColor: '#2563EB',
                    },
                ],
            });
        } catch (error) {
            console.warn('Could not send notification:', error);
        }
    },

    /**
     * Run all archive checks (call on app launch)
     */
    async runMaintenanceCheck() {
        console.log('🔧 Running storage maintenance checks...');
        await this.checkAndArchiveInactive();
        await this.checkAndNotifyNearInactivity();
        console.log('✓ Maintenance check complete');
    },
};

export default syncService;
