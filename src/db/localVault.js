import Dexie from 'dexie';

/**
 * Eagle LMS Local Vault - Encrypted Local Database
 * Stores downloaded modules and sync queue for offline-first capability
 */

export const db = new Dexie('EagleLocalVault');

// Define database schema
db.version(1).stores({
    // Downloaded modules metadata
    downloaded_modules: '++id, title, last_accessed_at, is_locally_cached',

    // Queue for syncing offline test results
    sync_queue: '++id, test_id, offline_timestamp',
});

/**
 * Downloaded Modules Store
 * Tracks which modules are available offline and their last access time
 */
export const downloadedModulesStore = {
    async addModule(moduleData) {
        return await db.downloaded_modules.add({
            title: moduleData.title,
            module_id: moduleData.module_id,
            description: moduleData.description,
            training_type: moduleData.training_type,
            quality: moduleData.quality || 'hq',
            size_mb: moduleData.size_mb || 0,
            high_res_bytes: moduleData.high_res_bytes || 0,
            data_saver_bytes: moduleData.data_saver_bytes || 0,
            last_accessed_at: new Date(),
            is_locally_cached: true,
            downloaded_at: new Date(),
            archived_at: null,
        });
    },

    async getModule(id) {
        return await db.downloaded_modules.get(id);
    },

    async getAllModules() {
        return await db.downloaded_modules.toArray();
    },

    async getCachedModules() {
        return await db.downloaded_modules.where('is_locally_cached').equals(true).toArray();
    },

    async getArchivedModules() {
        return await db.downloaded_modules.where('is_locally_cached').equals(false).toArray();
    },

    async updateLastAccessed(id) {
        const now = new Date();
        return await db.downloaded_modules.update(id, {
            last_accessed_at: now,
        });
    },

    async archiveModule(id) {
        return await db.downloaded_modules.update(id, {
            is_locally_cached: false,
            archived_at: new Date(),
        });
    },

    async restoreModule(id) {
        return await db.downloaded_modules.update(id, {
            is_locally_cached: true,
            archived_at: null,
            last_accessed_at: new Date(),
        });
    },

    async deleteModule(id) {
        return await db.downloaded_modules.delete(id);
    },

    async deleteAllCached() {
        return await db.downloaded_modules.clear();
    },

    /**
     * Get modules inactive for more than specified days
     */
    async getInactiveModules(dayThreshold = 30) {
        const now = new Date();
        const thresholdMs = dayThreshold * 24 * 60 * 60 * 1000;
        const allModules = await db.downloaded_modules.toArray();

        return allModules.filter(module => {
            const daysSinceAccess = now.getTime() - new Date(module.last_accessed_at).getTime();
            return daysSinceAccess >= thresholdMs;
        });
    },
};

/**
 * Sync Queue Store
 * Queues offline test results for syncing when connection is restored
 */
export const syncQueueStore = {
    async addToQueue(testData) {
        return await db.sync_queue.add({
            test_id: testData.test_id,
            trainee_id: testData.trainee_id,
            score: testData.score,
            total_marks: testData.total_marks,
            percentage: testData.percentage,
            passed: testData.passed,
            payload: JSON.stringify(testData),
            offline_timestamp: new Date(),
            status: 'pending', // pending, syncing, failed
            retry_count: 0,
            last_error: null,
        });
    },

    async getQueue() {
        return await db.sync_queue.where('status').equals('pending').toArray();
    },

    async getAllQueueItems() {
        return await db.sync_queue.toArray();
    },

    async getQueueItem(id) {
        return await db.sync_queue.get(id);
    },

    async updateStatus(id, status, error = null) {
        const updates = { status };
        if (error) {
            updates.last_error = error;
            updates.retry_count = (await db.sync_queue.get(id)).retry_count + 1;
        }
        return await db.sync_queue.update(id, updates);
    },

    async removeFromQueue(id) {
        return await db.sync_queue.delete(id);
    },

    async clearQueue() {
        return await db.sync_queue.clear();
    },

    async getQueueStats() {
        const all = await db.sync_queue.toArray();
        return {
            total: all.length,
            pending: all.filter(item => item.status === 'pending').length,
            syncing: all.filter(item => item.status === 'syncing').length,
            failed: all.filter(item => item.status === 'failed').length,
        };
    },
};

export default db;
