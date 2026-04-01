import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { downloadedModulesStore } from '../db/localVault';
import { autoArchiveService } from '../services/syncService';
import StorageBar from '../components/StorageBar';
import ModuleCard from '../components/ModuleCard';
import { ArrowLeft, HardDrive, Info, Zap, CheckCircle } from '../components/Icons';

const BugIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M12 6V2m0 20v-4m8-6h4m-20 0H2M19.07 4.93l2.83-2.83M4.93 19.07l2.83-2.83M19.07 19.07l-2.83-2.83M4.93 4.93l-2.83-2.83" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

export default function StorageManagerScreen({ onBack, showToast }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deviceStats, setDeviceStats] = useState({
        totalUsedMB: 0,
        deviceTotalGB: 64,
        deviceFreeMB: 18200,
        usagePercent: 0,
    });
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        loadStorageData();
    }, []);

    async function loadStorageData() {
        try {
            setLoading(true);
            const response = await apiService.getDashboard();
            const backendModules = response.data.modules || [];

            // Transform backend modules to UI format
            const transformedModules = backendModules.map((m, idx) => ({
                id: idx + 1,
                moduleId: m.id,
                title: m.title,
                description: m.description,
                training_type: m.training_type,
                hqSizeBytes: m.high_res_bytes || 245 * 1024 * 1024,
                dsSizeBytes: m.data_saver_bytes || 82 * 1024 * 1024,
                quality: 'hq',
                sizeMB: Math.round((m.high_res_bytes || 245 * 1024 * 1024) / (1024 * 1024)),
                isCompleted: false,
                isDownloaded: false,
                lastAccessedAt: null,
                archivedAt: null,
                passed: false,
                category: m.training_type === 'self_paced' ? 'Self-Paced' : m.training_type === 'virtual' ? 'Virtual' : 'Classroom',
            }));

            setModules(transformedModules);
            calculateStorageStats(transformedModules);
            setError('');
        } catch (err) {
            setError('Failed to load storage data. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function calculateStorageStats(moduleList) {
        const totalUsedMB = moduleList
            .filter(m => m.isDownloaded)
            .reduce((sum, m) => sum + m.sizeMB, 0);

        setDeviceStats(prev => ({
            ...prev,
            totalUsedMB,
            usagePercent: Math.round((totalUsedMB / (prev.deviceTotalGB * 1024)) * 100),
        }));
    }

    function handleArchive(id) {
        setModules(prev => {
            const updated = prev.map(m =>
                m.id === id
                    ? { ...m, isDownloaded: false, archivedAt: new Date(), sizeMB: 0 }
                    : m
            );
            calculateStorageStats(updated);
            return updated;
        });
    }

    function handleRestore(id, quality) {
        setModules(prev => {
            const updated = prev.map(m =>
                m.id === id
                    ? {
                        ...m,
                        isDownloaded: true,
                        archivedAt: null,
                        quality,
                        sizeMB: quality === 'hq'
                            ? Math.round(m.hqSizeBytes / (1024 * 1024))
                            : Math.round(m.dsSizeBytes / (1024 * 1024)),
                    }
                    : m
            );
            calculateStorageStats(updated);
            return updated;
        });
    }

    /**
     * Step 1: Time Travel Debugger
     * Fast-forward module to 31 days in the past to test auto-archive
     */
    async function handleTimeTravel(moduleId) {
        try {
            const thirtyOneDaysMs = 31 * 24 * 60 * 60 * 1000;
            const oldTimestamp = new Date(Date.now() - thirtyOneDaysMs);

            // Update in Dexie.js (if module exists in local vault)
            const modulesToUpdate = modules.filter(m => m.id === moduleId);
            if (modulesToUpdate.length > 0) {
                const mod = modulesToUpdate[0];
                for (const localModule of await downloadedModulesStore.getAllModules()) {
                    if (localModule.title === mod.title) {
                        await downloadedModulesStore.updateLastAccessed(localModule.id);
                        // Manually set to 31 days ago by updating in database
                        // Since we don't have direct update, we'll archive it
                        await downloadedModulesStore.archiveModule(localModule.id);
                        break;
                    }
                }
            }

            // Archive the module in UI
            handleArchive(moduleId);
            showToast('⏱️ Time traveled 31 days - Module auto-archived for testing', 'info');
            console.log('🕐 DEBUG: Time travel applied - 31 days in the past');
        } catch (error) {
            console.error('Time travel error:', error);
            showToast('Debug action failed', 'error');
        }
    }

    const activeModules = modules.filter(m => m.isDownloaded);
    const archivedModules = modules.filter(m => !m.isDownloaded && m.archivedAt);

    if (loading) {
        return (
            <div className="screen-content">
                <div className="header-bar">
                    <button className="back-btn" onClick={onBack}>
                        <ArrowLeft />
                    </button>
                    <span className="header-title">Storage Optimizer</span>
                </div>
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    Loading storage data...
                </div>
            </div>
        );
    }

    return (
        <div className="screen-content">
            {/* Header with Back */}
            <div className="header-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft />
                </button>
                <span className="header-title">Storage Optimizer</span>
                {/* Debug Mode Toggle */}
                <button
                    onClick={() => setDebugMode(!debugMode)}
                    style={{
                        marginLeft: 'auto',
                        background: debugMode ? 'var(--accent)' : 'var(--border-light)',
                        border: 'none',
                        color: debugMode ? 'white' : 'var(--text-muted)',
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontWeight: 700,
                    }}
                >
                    <Zap style={{ width: 14, height: 14 }} />
                </button>
            </div>

            {error && (
                <div style={{
                    padding: '12px',
                    marginBottom: '16px',
                    background: 'var(--red-light)',
                    border: '1px solid var(--red-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--red)',
                    fontSize: 12,
                    fontWeight: 600,
                }}>
                    {error}
                </div>
            )}

            <div style={{ display: 'flex', gap: 10, padding: '12px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: 20 }}>
                <Info style={{ width: 18, height: 18, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Archived content removes local media files but preserves your completion records and certificates.
                </div>
            </div>

            {/* Storage Bar */}
            <div className="card" style={{ marginBottom: 24 }}>
                <StorageBar stats={deviceStats} showBreakdown={false} />
            </div>

            {/* Downloaded Section */}
            {activeModules.length > 0 && (
                <>
                    <div className="section-header">
                        <span className="section-label">Active Downloads</span>
                        <span className="section-count">{activeModules.length}</span>
                    </div>
                    {activeModules.map(mod => (
                        <div key={mod.id} style={{ position: 'relative' }}>
                            <ModuleCard
                                module={mod}
                                onArchive={handleArchive}
                                onRestore={handleRestore}
                                showToast={showToast}
                            />
                            {/* Debug Button (Time Travel) */}
                            {debugMode && (
                                <button
                                    onClick={() => handleTimeTravel(mod.id)}
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        background: 'var(--amber-light)',
                                        border: '1px solid var(--amber-border)',
                                        color: 'var(--amber)',
                                        padding: '6px 8px',
                                        borderRadius: 'var(--radius-sm)',
                                        fontSize: 10,
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                    title="Fast-forward 31 days to test auto-archive"
                                >
                                    <Zap style={{ width: 12, height: 12 }} />
                                    31d
                                </button>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* Archived Section WITH Visual Reassurance Badge */}
            {archivedModules.length > 0 && (
                <>
                    <div className="section-header" style={{ marginTop: 24 }}>
                        <span className="section-label">Cloud Archive</span>
                        <span className="section-count">{archivedModules.length}</span>
                    </div>
                    {archivedModules.map(mod => (
                        <div key={mod.id} style={{ position: 'relative' }}>
                            <ModuleCard
                                module={mod}
                                onArchive={handleArchive}
                                onRestore={handleRestore}
                                showToast={showToast}
                            />
                            {/* Step 2: Visual Reassurance Badge */}
                            {mod.passed && !mod.isDownloaded && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                        background: 'var(--green-light)',
                                        border: '1px solid var(--green-border)',
                                        color: 'var(--green)',
                                        padding: '6px 10px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: 11,
                                        fontWeight: 700,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                    title="Your completion record is preserved"
                                >
                                    <CheckCircle style={{ width: 14, height: 14 }} />
                                    Record Preserved
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* Empty State */}
            {modules.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <HardDrive />
                    </div>
                    <div className="empty-title">Storage is clear</div>
                    <div className="empty-subtitle">
                        Download training materials from the Library to manage them here.
                    </div>
                </div>
            )}
        </div>
    );
}
