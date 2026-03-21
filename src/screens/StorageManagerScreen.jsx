import React, { useState } from 'react';
import { mockModules, mockStorageStats } from '../mockData';
import StorageBar from '../components/StorageBar';
import ModuleCard from '../components/ModuleCard';
import { ArrowLeft, HardDrive, Info } from '../components/Icons';

export default function StorageManagerScreen({ onBack, showToast }) {
    const [modules, setModules] = useState(mockModules);

    const activeModules = modules.filter(m => m.isDownloaded);
    const archivedModules = modules.filter(m => !m.isDownloaded);

    function handleArchive(id) {
        setModules(prev => prev.map(m =>
            m.id === id
                ? { ...m, isDownloaded: false, archivedAt: new Date(), sizeMB: 0 }
                : m
        ));
    }

    function handleRestore(id, quality) {
        setModules(prev => prev.map(m =>
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
        ));
    }

    // Recalculate storage stats based on current state
    const totalUsedMB = modules
        .filter(m => m.isDownloaded)
        .reduce((sum, m) => sum + m.sizeMB, 0);
    const currentStats = {
        ...mockStorageStats,
        totalUsedMB,
        usagePercent: Math.round((totalUsedMB / (mockStorageStats.deviceTotalGB * 1024)) * 100),
    };

    return (
        <div className="screen-content">
            {/* Header with Back */}
            <div className="header-bar">
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft />
                </button>
                <span className="header-title">Storage Optimizer</span>
            </div>

            <div style={{ display: 'flex', gap: 10, padding: '12px', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: 20 }}>
                <Info style={{ width: 18, height: 18, color: 'var(--accent)', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Archived content removes local media files but preserves your completion records and certificates.
                </div>
            </div>

            {/* Storage Bar */}
            <div className="card" style={{ marginBottom: 24 }}>
                <StorageBar stats={currentStats} showBreakdown={false} />
            </div>

            {/* Downloaded Section */}
            {activeModules.length > 0 && (
                <>
                    <div className="section-header">
                        <span className="section-label">Active Downloads</span>
                        <span className="section-count">{activeModules.length}</span>
                    </div>
                    {activeModules.map(mod => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            showToast={showToast}
                        />
                    ))}
                </>
            )}

            {/* Archived Section */}
            {archivedModules.length > 0 && (
                <>
                    <div className="section-header" style={{ marginTop: 24 }}>
                        <span className="section-label">Cloud Archive</span>
                        <span className="section-count">{archivedModules.length}</span>
                    </div>
                    {archivedModules.map(mod => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            showToast={showToast}
                        />
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
