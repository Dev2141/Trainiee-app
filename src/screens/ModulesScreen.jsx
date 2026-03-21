import React, { useState } from 'react';
import { mockModules, availableModules } from '../mockData';
import ModuleCard from '../components/ModuleCard';
import DownloadQualitySelector from '../components/DownloadQualitySelector';
import { Download, CheckCircle, Clock, BookOpen, Layers } from '../components/Icons';

export default function ModulesScreen({ showToast, onOpenModule }) {
    const [modules, setModules] = useState(mockModules);
    const [showQualityPicker, setShowQualityPicker] = useState(null); // module obj or null
    const [downloadingId, setDownloadingId] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    const downloadedModules = modules.filter(m => m.isDownloaded);
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

    function handleNewDownload(quality) {
        const mod = showQualityPicker;
        setShowQualityPicker(null);
        setDownloadingId(mod.id);
        setDownloadProgress(0);

        let p = 0;
        const interval = setInterval(() => {
            p += Math.random() * 15 + 5;
            if (p >= 100) {
                p = 100;
                clearInterval(interval);
                setDownloadProgress(100);
                setTimeout(() => {
                    setDownloadingId(null);
                    setDownloadProgress(0);
                    setModules(prev => [...prev, {
                        id: mod.id,
                        moduleId: mod.moduleId,
                        title: mod.title,
                        quality,
                        sizeMB: quality === 'hq' ? mod.hqSizeMB : mod.dsSizeMB,
                        isCompleted: false,
                        isDownloaded: true,
                        lastAccessedAt: new Date(),
                        archivedAt: null,
                        hqSizeBytes: mod.hqSizeMB * 1024 * 1024,
                        dsSizeBytes: mod.dsSizeMB * 1024 * 1024,
                    }]);
                    showToast?.('Module downloaded to library', 'success');
                }, 500);
            }
            setDownloadProgress(Math.min(100, Math.round(p)));
        }, 250);
    }

    const notDownloaded = availableModules.filter(
        am => !modules.find(m => m.moduleId === am.moduleId)
    );

    return (
        <div className="screen-content">
            <div className="screen-title">Learning Center</div>
            <div className="screen-subtitle">
                Access your training materials offline anytime.
            </div>

            {/* Available for Download */}
            {notDownloaded.length > 0 && (
                <>
                    <div className="section-header">
                        <span className="section-label">Server Library</span>
                        <span className="section-count">{notDownloaded.length} Available</span>
                    </div>

                    {notDownloaded.map(mod => (
                        <div key={mod.id} className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                <div style={{ flex: 1, marginRight: 12 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                                        {mod.category}
                                    </div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>
                                        {mod.title}
                                    </div>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <span className="badge badge-duration">
                                            <Clock /> {mod.duration}
                                        </span>
                                        <span className="badge badge-new">
                                            NEW
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {downloadingId === mod.id ? (
                                <div className="dl-progress downloading" style={{ marginTop: 10 }}>
                                    <div className="dl-progress-track">
                                        <div className="dl-progress-fill" style={{ width: `${downloadProgress}%` }} />
                                    </div>
                                    <span className="dl-progress-text">{downloadProgress}%</span>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, borderTop: '1px solid var(--border-light)', paddingTop: 12 }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>STORAGE REQD</span>
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)' }}>~{mod.dsSizeMB} - {mod.hqSizeMB} MB</span>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={() => setShowQualityPicker(mod)}
                                    >
                                        <Download /> Download
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </>
            )}

            {/* Downloaded */}
            {downloadedModules.length > 0 && (
                <>
                    <div className="section-header" style={{ marginTop: 24 }}>
                        <span className="section-label">Offline Access</span>
                        <span className="section-count">{downloadedModules.length} Modules</span>
                    </div>
                    {downloadedModules.map(mod => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onOpen={onOpenModule}
                            showToast={showToast}
                        />
                    ))}
                </>
            )}

            {/* Archived */}
            {archivedModules.length > 0 && (
                <>
                    <div className="section-header" style={{ marginTop: 24 }}>
                        <span className="section-label">Cloud Archive</span>
                        <span className="section-count">{archivedModules.length} Items</span>
                    </div>
                    {archivedModules.map(mod => (
                        <ModuleCard
                            key={mod.id}
                            module={mod}
                            onArchive={handleArchive}
                            onRestore={handleRestore}
                            onOpen={onOpenModule}
                            showToast={showToast}
                        />
                    ))}
                </>
            )}

            {showQualityPicker && (
                <DownloadQualitySelector
                    visible
                    moduleName={showQualityPicker.title}
                    hqSizeBytes={showQualityPicker.hqSizeMB * 1024 * 1024}
                    dsSizeBytes={showQualityPicker.dsSizeMB * 1024 * 1024}
                    onSelect={handleNewDownload}
                    onCancel={() => setShowQualityPicker(null)}
                />
            )}
        </div>
    );
}
