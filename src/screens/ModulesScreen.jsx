import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import { downloadedModulesStore } from '../db/localVault';
import ModuleCard from '../components/ModuleCard';
import DownloadQualitySelector from '../components/DownloadQualitySelector';
import { Download, CheckCircle, Clock, BookOpen, Layers } from '../components/Icons';

export default function ModulesScreen({ showToast, onOpenModule }) {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showQualityPicker, setShowQualityPicker] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);

    // Fetch modules from backend on mount
    useEffect(() => {
        loadModules();
    }, []);

    async function loadModules() {
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
                category: m.training_type === 'self_paced' ? 'Self-Paced' : m.training_type === 'virtual' ? 'Virtual' : 'Classroom',
                // Use real duration from backend — e.g. "20h", "30h"
                duration: m.duration_hours ? `${m.duration_hours}h` : 'N/A',
            }));

            setModules(transformedModules);
            setError('');
        } catch (err) {
            setError('Failed to load modules. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

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
                setTimeout(async () => {
                    /**
                     * Step 4: Data Saver Logic Hookup
                     * Save to local vault with correct byte size based on quality
                     */
                    try {
                        const selectedBytes = quality === 'hq' ? mod.hqSizeBytes : mod.dsSizeBytes;
                        const selectedMB = Math.round(selectedBytes / (1024 * 1024));

                        // Save to Dexie.js local vault
                        await downloadedModulesStore.addModule({
                            title: mod.title,
                            module_id: mod.moduleId,
                            description: mod.description,
                            training_type: mod.training_type,
                            quality: quality,
                            size_mb: selectedMB,
                            high_res_bytes: mod.hqSizeBytes,
                            data_saver_bytes: mod.dsSizeBytes,
                        });

                        console.log(`📥 Saved to vault: ${mod.title} (${quality.toUpperCase()}, ${selectedMB}MB)`);

                        // Show quality-specific toast
                        if (quality === 'hq') {
                            showToast?.(`✓ Downloaded in High Quality (${selectedMB}MB)`, 'success');
                        } else {
                            showToast?.(`✓ Downloaded in Data Saver Mode (${selectedMB}MB) - Bandwidth Optimized`, 'success');
                        }
                    } catch (error) {
                        console.error('Failed to save to vault:', error);
                        showToast?.('Failed to save module', 'error');
                    }

                    setDownloadingId(null);
                    setDownloadProgress(0);
                    setModules(prev => prev.map(m =>
                        m.id === mod.id
                            ? {
                                ...m,
                                isDownloaded: true,
                                quality,
                                sizeMB: quality === 'hq'
                                    ? Math.round(m.hqSizeBytes / (1024 * 1024))
                                    : Math.round(m.dsSizeBytes / (1024 * 1024)),
                                lastAccessedAt: new Date(),
                                archivedAt: null,
                            }
                            : m
                    ));
                }, 500);
            }
            setDownloadProgress(Math.min(100, Math.round(p)));
        }, 250);
    }

    const downloadedModules = modules.filter(m => m.isDownloaded);
    const archivedModules = modules.filter(m => !m.isDownloaded && m.archivedAt);
    const availableModules = modules.filter(m => !m.isDownloaded && !m.archivedAt);

    if (loading) {
        return (
            <div className="screen-content">
                <div className="screen-title">Learning Center</div>
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    Loading modules...
                </div>
            </div>
        );
    }

    return (
        <div className="screen-content">
            <div className="screen-title">Learning Center</div>
            <div className="screen-subtitle">
                Access your training materials offline anytime.
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

            {/* Available for Download */}
            {availableModules.length > 0 && (
                <>
                    <div className="section-header">
                        <span className="section-label">Server Library</span>
                        <span className="section-count">{availableModules.length} Available</span>
                    </div>

                    {availableModules.map(mod => (
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
                                        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-secondary)' }}>
                                            ~{Math.round(mod.dsSizeBytes / (1024 * 1024))} - {Math.round(mod.hqSizeBytes / (1024 * 1024))} MB
                                        </span>
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
                    hqSizeBytes={showQualityPicker.hqSizeBytes}
                    dsSizeBytes={showQualityPicker.dsSizeBytes}
                    onSelect={handleNewDownload}
                    onCancel={() => setShowQualityPicker(null)}
                />
            )}
        </div>
    );
}
