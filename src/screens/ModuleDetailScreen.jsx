import React, { useState } from 'react';
import {
    ArrowLeft, Play, Pause, FileText, CheckCircle, Clock,
    Volume2, Shield, BookOpen, Award, Target, ChevronRight,
    AlertTriangle
} from '../components/Icons';

const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const DownloadIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CheckIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export default function ModuleDetailScreen({ module, onBack, showToast }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeTab, setActiveTab] = useState('content');

    // Build chapters from real module data — use actual number_of_chapters if available
    const totalChapters = module.number_of_chapters || 5;
    const completedCount = module.chapters_completed || 0;
    const progressPct = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

    // Generate chapters list from real data (titles from backend if provided, else generic)
    const backendChapters = module.chapters || [];
    const chapters = backendChapters.length > 0
        ? backendChapters.map((ch, i) => ({
            id: i + 1,
            title: ch.title,
            duration: ch.duration || '-',
            completed: ch.completed || false,
        }))
        : Array.from({ length: totalChapters }, (_, i) => ({
            id: i + 1,
            title: `Chapter ${i + 1}`,
            duration: '-',
            completed: i < completedCount,
        }));

    const categoryLabels = {
        self_paced: 'Self-Paced',
        virtual: 'Virtual Classroom',
        classroom: 'Classroom',
    };

    return (
        <div className="screen-content" style={{ padding: 0 }}>
            {/* Top Header */}
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
                <button className="back-btn" onClick={onBack}><ArrowLeft /></button>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Module {module.moduleId}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {module.title}
                    </div>
                </div>
            </div>

            {/* Video Player */}
            <div className="video-player" onClick={() => setIsPlaying(!isPlaying)}>
                <div className="video-player-bg" style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80')`,
                    backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.6,
                }} />
                <div className="video-play-btn">{isPlaying ? <Pause /> : <Play />}</div>
                <div className="video-duration">{module.duration || 'N/A'}</div>
                <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 10 }}>
                    <Volume2 style={{ width: 14, height: 14, color: '#fff' }} />
                    <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center' }}>
                        <div style={{ width: '40%', height: '100%', background: '#fff', borderRadius: 2 }} />
                    </div>
                </div>
            </div>

            {/* Progress Bar — shows real chapter progress */}
            <div style={{ padding: '14px 20px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Progress</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
                            {completedCount} of {totalChapters} Chapters
                        </div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{progressPct}%</div>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)', transition: 'width 0.6s ease' }} />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', borderBottom: '2px solid var(--border-light)', padding: '0 16px' }}>
                {[
                    { id: 'content', label: 'Content' },
                    { id: 'details', label: 'Details' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            flex: 1, padding: '12px 8px', border: 'none', background: 'none',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                            borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                            marginBottom: -2, transition: 'all 0.15s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={{ padding: '16px 20px' }}>

                {/* ── CONTENT TAB ── */}
                {activeTab === 'content' && (
                    <div>
                        {/* Overview */}
                        <div className="detail-section">
                            <div className="detail-section-title"><FileText />Overview</div>
                            <div className="detail-text">
                                {module.description || 'This module covers essential training content. Complete all chapters then take the end-of-module assessment.'}
                            </div>
                        </div>

                        {/* Quality & Size */}
                        <div className="detail-section">
                            <div className="detail-section-title"><BookOpen />Download Info</div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div style={{ flex: 1, background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Quality</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>
                                        {module.quality === 'hq' ? 'High Quality' : 'Data Saver'}
                                    </div>
                                </div>
                                <div style={{ flex: 1, background: 'var(--blue-50)', border: '1px solid var(--blue-100)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>Size</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>
                                        {module.sizeMB > 0 ? `${module.sizeMB} MB` : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Chapter List */}
                        <div className="detail-section">
                            <div className="detail-section-title"><BookOpen />Course Content</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {chapters.map(chapter => (
                                    <div key={chapter.id} className="chapter-item" style={{ cursor: 'default' }}>
                                        <div className="chapter-number">{chapter.id}</div>
                                        <div className="chapter-info">
                                            <div className="chapter-title">{chapter.title}</div>
                                            {chapter.duration !== '-' && <div className="chapter-duration">{chapter.duration}</div>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            {chapter.completed && (
                                                <CheckCircle style={{ width: 14, height: 14, color: 'var(--green)' }} />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Certification */}
                        <div className="detail-section">
                            <div className="detail-section-title"><Shield />Certification</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px', background: 'var(--blue-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--blue-100)' }}>
                                <Shield style={{ width: 22, height: 22, color: 'var(--accent)', flexShrink: 0 }} />
                                <div style={{ fontSize: 13, color: 'var(--blue-800)', fontWeight: 600 }}>
                                    Pass the assessment with 80% or above to earn your completion certificate.
                                </div>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-block"
                            style={{ marginTop: 4, minHeight: 48 }}
                            onClick={() => showToast('Assessment feature coming soon — sync results online', 'info')}
                        >
                            <Play /> Start Assessment
                        </button>
                    </div>
                )}

                {/* ── DETAILS TAB ── */}
                {activeTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Module Meta — real data from backend */}
                        <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Module Information
                            </div>
                            {[
                                { label: 'Module ID', value: `MOD-${module.moduleId}` },
                                { label: 'Training Type', value: categoryLabels[module.training_type] || module.training_type || 'N/A' },
                                { label: 'Total Duration', value: module.duration || 'N/A' },
                                { label: 'Total Chapters', value: `${totalChapters} chapters` },
                                { label: 'Your Progress', value: `${completedCount}/${totalChapters} completed` },
                                { label: 'Available Quality', value: module.quality === 'hq' ? 'High Definition' : 'Data-Saver' },
                                { label: 'File Size', value: module.sizeMB > 0 ? `${module.sizeMB} MB` : 'N/A' },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '8px 0', borderBottom: i < 6 ? '1px solid var(--border-light)' : 'none',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Description */}
                        {module.description && (
                            <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>
                                    Description
                                </div>
                                <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.6 }}>
                                    {module.description}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
