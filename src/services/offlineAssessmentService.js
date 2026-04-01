import { Network } from '@capacitor/network';
import { syncQueueStore, downloadedModulesStore } from '../db/localVault';

/**
 * Offline-First Assessment Service
 * Handles assessment submissions when offline and queues them for sync
 */

export const offlineAssessmentService = {
    /**
     * Check if device is currently online
     */
    async isOnline() {
        const status = await Network.getStatus();
        return status.connected;
    },

    /**
     * Submit assessment - saves offline or sends to server
     */
    async submitAssessment(testData) {
        const online = await this.isOnline();

        if (online) {
            // Online - submit to server immediately
            return await this.submitToServer(testData);
        } else {
            // Offline - queue for later sync
            return await this.queueForOfflineSync(testData);
        }
    },

    /**
     * Submit assessment to backend server
     */
    async submitToServer(testData) {
        try {
            const apiService = (await import('../api/apiService')).default;

            const response = await apiService.syncOfflineResults([
                {
                    test_id: testData.test_id,
                    trainee_id: testData.trainee_id,
                    score: testData.score,
                    total_marks: testData.total_marks,
                    percentage: testData.percentage,
                    passed: testData.passed,
                    offline_timestamp: new Date(),
                },
            ]);

            return {
                success: true,
                synced: true,
                message: 'Assessment submitted successfully',
                data: response,
            };
        } catch (error) {
            return {
                success: false,
                synced: false,
                error: error.message,
                message: 'Failed to submit assessment',
            };
        }
    },

    /**
     * Queue assessment for offline sync
     */
    async queueForOfflineSync(testData) {
        try {
            const result = await syncQueueStore.addToQueue({
                test_id: testData.test_id,
                trainee_id: testData.trainee_id,
                score: testData.score,
                total_marks: testData.total_marks,
                percentage: testData.percentage,
                passed: testData.passed,
                offline_timestamp: new Date(),
            });

            return {
                success: true,
                synced: false,
                queued: true,
                queueId: result,
                message: 'Assessment saved offline - will sync when connection restored',
            };
        } catch (error) {
            return {
                success: false,
                synced: false,
                queued: false,
                error: error.message,
                message: 'Failed to save assessment offline',
            };
        }
    },

    /**
     * Get all pending offline assessments
     */
    async getPendingAssessments() {
        return await syncQueueStore.getQueue();
    },

    /**
     * Update module's last accessed time
     */
    async recordModuleAccess(moduleId) {
        try {
            const module = await downloadedModulesStore.getModule(moduleId);
            if (module) {
                await downloadedModulesStore.updateLastAccessed(moduleId);
            }
        } catch (error) {
            console.warn('Could not update module access time:', error);
        }
    },

    /**
     * Check if module is available offline
     */
    async isModuleOfflineAvailable(moduleId) {
        try {
            const module = await downloadedModulesStore.getModule(moduleId);
            return module && module.is_locally_cached;
        } catch (error) {
            return false;
        }
    },

    /**
     * Get all offline-available modules
     */
    async getOfflineModules() {
        return await downloadedModulesStore.getCachedModules();
    },

    /**
     * Get network status with details
     */
    async getNetworkStatus() {
        const status = await Network.getStatus();
        return {
            connected: status.connected,
            connectionType: status.connectionType,
            timestamp: new Date(),
        };
    },
};

/**
 * Assessment Helper Hook Pattern
 * Usage in component:
 *
 * const handleSubmit = async () => {
 *   const result = await offlineAssessmentService.submitAssessment({
 *     test_id: '123',
 *     trainee_id: '456',
 *     score: 85,
 *     total_marks: 100,
 *     percentage: 85,
 *     passed: true,
 *   });
 *
 *   if (result.synced) {
 *     showToast('✓ Assessment submitted', 'success');
 *   } else if (result.queued) {
 *     showToast('✓ Saved offline - syncing later', 'warning');
 *   } else {
 *     showToast('✗ Error: ' + result.message, 'error');
 *   }
 * };
 */

export default offlineAssessmentService;
