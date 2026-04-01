import React, { useState, useEffect } from 'react';
import { syncQueueStore, downloadedModulesStore } from '../db/localVault';
import { offlineAssessmentService } from '../services/offlineAssessmentService';
import { Wifi, WifiOff, Download, AlertTriangle, CheckCircle } from '../components/Icons';

/**
 * Offline Access Dashboard
 * Shows cached modules, sync queue status, and network connectivity
 */

export default function OfflineAccessDashboard() {
    const [cachedModules, setCachedModules] = useState([]);
    const [queueStats, setQueueStats] = useState({
        total: 0,
        pending: 0,
        syncing: 0,
        failed: 0,
    });
    const [networkStatus, setNetworkStatus] = useState({
        connected: true,
        connectionType: 'unknown',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadOfflineData();
        const interval = setInterval(loadOfflineData, 5000); // Refresh every 5s
        return () => clearInterval(interval);
    }, []);

    async function loadOfflineData() {
        try {
            const [modules, stats, netStatus] = await Promise.all([
                downloadedModulesStore.getCachedModules(),
                syncQueueStore.getQueueStats(),
                offlineAssessmentService.getNetworkStatus(),
            ]);

            setCachedModules(modules);
            setQueueStats(stats);
            setNetworkStatus(netStatus);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load offline data:', error);
        }
    }

    const getConnectionTypeDisplay = (type) => {
        const types = {
            wifi: '🌐 WiFi',
            cellular: '📱 Cellular',
            'none': '❌ Offline',
            'unknown': '❓ Unknown',
        };
        return types[type] || type;
    };

    if (loading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading offline data...
            </div>
        );
    }

    return (
        <div style={{ padding: '16px 20px' }}>
            {/* Network Status Card */}
            <div
                className="card"
                style={{
                    marginBottom: 16,
                    background: networkStatus.connected
                        ? 'var(--green-light)'
                        : 'var(--red-light)',
                    border: `1px solid ${networkStatus.connected ? 'var(--border)' : 'var(--red-border)'}`,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                        style={{
                            width: 48,
                            height: 48,
                            borderRadius: 'var(--radius-md)',
                            background: networkStatus.connected ? 'var(--green)' : 'var(--red)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                        }}
                    >
                        {networkStatus.connected ? (
                            <Wifi style={{ width: 24, height: 24, color: '#fff' }} />
                        ) : (
                            <WifiOff style={{ width: 24, height: 24, color: '#fff' }} />
                        )}
                    </div>
                    <div>
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: networkStatus.connected ? 'var(--green)' : 'var(--red)',
                                textTransform: 'uppercase',
                            }}
                        >
                            {networkStatus.connected ? 'Online' : 'Offline'}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {getConnectionTypeDisplay(networkStatus.connectionType)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sync Queue Status */}
            {queueStats.total > 0 && (
                <div
                    className="card"
                    style={{
                        marginBottom: 16,
                        background: 'var(--amber-light)',
                        border: '1px solid var(--amber-border)',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <AlertTriangle style={{ width: 24, height: 24, color: 'var(--amber)', marginTop: 2, flexShrink: 0 }} />
                        <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                {queueStats.total} Assessment{queueStats.total !== 1 ? 's' : ''} Pending Sync
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                {queueStats.pending} pending • {queueStats.syncing} syncing • {queueStats.failed} failed
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                                Assessments will sync automatically when your connection is restored.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cached Modules */}
            <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                    Available Offline ({cachedModules.length})
                </div>

                {cachedModules.length === 0 ? (
                    <div
                        className="card"
                        style={{
                            textAlign: 'center',
                            padding: '24px 16px',
                            background: 'var(--bg-elevated)',
                        }}
                    >
                        <Download style={{ width: 32, height: 32, color: 'var(--text-muted)', margin: '0 auto 12px', display: 'block' }} />
                        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                            No modules downloaded yet
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                            Download modules from the Library to access them offline
                        </div>
                    </div>
                ) : (
                    cachedModules.map((module) => (
                        <div
                            key={module.id}
                            className="card"
                            style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                marginBottom: 8,
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                                    {module.title}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                                    {module.size_mb} MB • Quality: {module.quality.toUpperCase()}
                                </div>
                                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                                    Last accessed:{' '}
                                    {new Date(module.last_accessed_at).toLocaleDateString()}
                                </div>
                            </div>
                            <CheckCircle
                                style={{
                                    width: 24,
                                    height: 24,
                                    color: 'var(--green)',
                                    marginTop: 2,
                                    flexShrink: 0,
                                }}
                            />
                        </div>
                    ))
                )}
            </div>

            {/* Info Box */}
            <div
                style={{
                    padding: 12,
                    background: 'var(--blue-light)',
                    border: '1px solid var(--blue-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 12,
                    color: 'var(--blue-800)',
                    lineHeight: 1.6,
                }}
            >
                <strong>📖 Offline Mode:</strong> Cached modules are fully available offline. You can take
                assessments, and results will be automatically synced when your connection is restored.
            </div>
        </div>
    );
}
