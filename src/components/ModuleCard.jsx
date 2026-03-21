import React, { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import DownloadQualitySelector from './DownloadQualitySelector';
import { Archive as ArchiveIcon, CloudDownload, CheckCircle, Clock } from './Icons';

export default function ModuleCard({ module, onArchive, onRestore, onOpen, showToast }) {
    const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
    const [showQualityPicker, setShowQualityPicker] = useState(false);
    const [restoreState, setRestoreState] = useState('idle');
    const [progress, setProgress] = useState(0);
    const [archiving, setArchiving] = useState(false);

    const isDownloaded = module.isDownloaded;
    const isArchived = !!module.archivedAt && !isDownloaded;

    function handleArchiveConfirm() {
        setShowArchiveConfirm(false);
        setArchiving(true);
        setTimeout(() => {
            setArchiving(false);
            onArchive?.(module.id);
            showToast?.('Module archived successfully', 'success');
        }, 800);
    }

    function handleQualitySelect(quality) {
        setShowQualityPicker(false);
        setRestoreState('auth');

        setTimeout(() => {
            setRestoreState('downloading');
            let p = 0;
            const interval = setInterval(() => {
                p += Math.random() * 20 + 5;
                if (p >= 100) {
                    p = 100;
                    clearInterval(interval);
                    setProgress(100);
                    setRestoreState('done');
                    setTimeout(() => {
                        setRestoreState('idle');
                        setProgress(0);
                        onRestore?.(module.id, quality);
                        showToast?.('Content ready for offline use', 'success');
                    }, 800);
                }
                setProgress(Math.min(100, Math.round(p)));
            }, 250);
        }, 1000);
    }

    function formatDate(date) {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }

    return (
        <>
            <div
                className={`card ${isArchived ? 'archived-card' : ''} card-clickable`}
                onClick={() => isDownloaded && onOpen?.(module)}
            >
                <div className={`card-accent-bar ${module.isCompleted ? 'completed' : isArchived ? 'archived' : 'in-progress'}`} />

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1, marginRight: 12 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 4 }}>
                            Module {module.moduleId}
                        </div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 8 }}>
                            {module.title}
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {module.isCompleted && (
                                <span className="badge badge-pass">
                                    <CheckCircle /> Completed
                                </span>
                            )}
                            {isDownloaded && (
                                <span className={`badge ${module.quality === 'hq' ? 'badge-hq' : 'badge-ds'}`}>
                                    {module.quality.toUpperCase()}
                                </span>
                            )}
                            {isArchived && (
                                <span className="badge" style={{ backgroundColor: 'var(--border-light)', color: 'var(--text-secondary)' }}>
                                    Archived
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>
                        {isArchived ? (
                            <>
                                <ArchiveIcon style={{ width: 14, height: 14 }} />
                                <span>Removed {formatDate(module.archivedAt)}</span>
                            </>
                        ) : isDownloaded ? (
                            <>
                                <Clock style={{ width: 14, height: 14 }} />
                                <span>Accessed {formatDate(module.lastAccessedAt)}</span>
                            </>
                        ) : null}
                    </div>

                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {isDownloaded ? `${module.sizeMB} MB` : ''}
                    </div>
                </div>

                {/* Action Row */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
                    {restoreState === 'auth' && (
                        <div className="auth-spinner">
                            <div className="spinner" />
                            <span className="auth-text">Securing session…</span>
                        </div>
                    )}
                    {restoreState === 'downloading' && (
                        <div className="dl-progress downloading">
                            <div className="dl-progress-track">
                                <div className="dl-progress-fill" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="dl-progress-text">{progress}%</span>
                        </div>
                    )}
                    {restoreState === 'done' && (
                        <span style={{ color: 'var(--green)', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <CheckCircle style={{ width: 16, height: 16 }} /> Content Restored
                        </span>
                    )}
                    {restoreState === 'idle' && isArchived && (
                        <button
                            className="btn btn-restore btn-sm"
                            onClick={(e) => { e.stopPropagation(); setShowQualityPicker(true); }}
                        >
                            <CloudDownload /> Cloud Fetch
                        </button>
                    )}
                    {restoreState === 'idle' && isDownloaded && (
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => { e.stopPropagation(); setShowArchiveConfirm(true); }}
                                disabled={archiving}
                            >
                                <ArchiveIcon /> {archiving ? '...' : 'Archive'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showArchiveConfirm && (
                <ConfirmDialog
                    title="Confirm Archive"
                    message="Large media files will be removed to save space. Your progress remains safe."
                    confirmText="Archive Now"
                    danger
                    onConfirm={handleArchiveConfirm}
                    onCancel={() => setShowArchiveConfirm(false)}
                />
            )}

            <DownloadQualitySelector
                visible={showQualityPicker}
                moduleName={module.title}
                hqSizeBytes={module.hqSizeBytes}
                dsSizeBytes={module.dsSizeBytes}
                onSelect={handleQualitySelect}
                onCancel={() => setShowQualityPicker(false)}
            />
        </>
    );
}
