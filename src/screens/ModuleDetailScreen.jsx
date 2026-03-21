import React, { useState } from 'react';
import {
    ArrowLeft, Play, Pause, FileText, CheckCircle, Clock,
    Volume2, Shield, BookOpen, Award, Target, ChevronRight,
    AlertTriangle
} from '../components/Icons';
import { mockModuleDetails } from '../mockData';

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

const CHAPTER_DETAILS = {
    1: { subtitle: 'Definitions, scope, and foundational terminology used throughout the course.', keyPoints: ['Course objectives overview', 'Key terminology and definitions', 'Legal and regulatory framework', 'Role of each team member'] },
    2: { subtitle: 'Step-by-step procedures for safe daily operations and task execution.', keyPoints: ['Pre-task safety checks', 'Standard operating sequence', 'Communication protocols', 'Documentation requirements'] },
    3: { subtitle: 'Immediate actions, escalation paths, and evacuation drills.', keyPoints: ['Emergency contact hierarchy', 'Evacuation roles and assembly points', 'First response actions', 'Incident reporting procedure'] },
    4: { subtitle: 'Scheduled and condition-based maintenance, inspection forms.', keyPoints: ['Inspection frequency guidelines', 'Condition assessment criteria', 'Tagging and lockout requirements', 'Maintenance log completion'] },
    5: { subtitle: 'Key topic review, sample questions, and assessment guidance.', keyPoints: ['Summary of module objectives', 'Common exam question formats', 'Areas to prioritise for study', 'Assessment rules and conditions'] },
};

export default function ModuleDetailScreen({ module, onBack, showToast }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [activeChapter, setActiveChapter] = useState(null);
    const [activeTab, setActiveTab] = useState('content');

    const detail = mockModuleDetails[module.moduleId] || mockModuleDetails[101];

    const completedCount = 2;
    const totalChapters = 5;
    const progressPct = Math.round((completedCount / totalChapters) * 100);

    const chapters = [
        { id: 1, title: 'Introduction & Core Concepts', duration: '12:45', completed: true },
        { id: 2, title: 'Safe Operating Procedures', duration: '28:10', completed: true },
        { id: 3, title: 'Emergency Response Protocols', duration: '15:30', completed: false },
        { id: 4, title: 'Maintenance & Inspections', duration: '22:15', completed: false },
        { id: 5, title: 'Conclusion & Assessment Prep', duration: '08:50', completed: false },
    ];

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
                <div className="video-duration">{detail.duration}</div>
                <div style={{ position: 'absolute', bottom: 10, left: 12, display: 'flex', gap: 10 }}>
                    <Volume2 style={{ width: 14, height: 14, color: '#fff' }} />
                    <div style={{ width: 80, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, alignSelf: 'center' }}>
                        <div style={{ width: '40%', height: '100%', background: '#fff', borderRadius: 2 }} />
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ padding: '14px 20px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Your Progress</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{completedCount} of {totalChapters} Chapters</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)' }}>{progressPct}%</div>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--accent)', borderRadius: 'var(--radius-full)' }} />
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', background: 'var(--bg-primary)', borderBottom: '2px solid var(--border-light)', padding: '0 16px' }}>
                {[
                    { id: 'content', label: 'Content' },
                    { id: 'details', label: 'Details' },
                    { id: 'resources', label: 'Resources' },
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
                                This module covers the essential safety requirements and operational guidelines for high-risk industrial environments. You will learn to identify hazards, implement preventive measures, and respond to emergencies according to standard industry protocols.
                            </div>
                        </div>

                        {/* Learning Outcomes */}
                        <div className="detail-section">
                            <div className="detail-section-title"><Target />Learning Outcomes</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {detail.learningOutcomes.map((outcome, i) => (
                                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', background: 'var(--blue-50)',
                                            border: '1px solid var(--blue-100)', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', flexShrink: 0, marginTop: 1,
                                        }}>
                                            <CheckIcon style={{ width: 10, height: 10, color: 'var(--accent)' }} />
                                        </div>
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, lineHeight: 1.5 }}>{outcome}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Chapter List */}
                        <div className="detail-section">
                            <div className="detail-section-title"><BookOpen />Course Content</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {chapters.map(chapter => (
                                    <div key={chapter.id}>
                                        <div
                                            className={`chapter-item ${activeChapter === chapter.id ? 'active' : ''}`}
                                            onClick={() => setActiveChapter(activeChapter === chapter.id ? null : chapter.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <div className="chapter-number">{chapter.id}</div>
                                            <div className="chapter-info">
                                                <div className="chapter-title">{chapter.title}</div>
                                                <div className="chapter-duration">{chapter.duration}</div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                {chapter.completed && (
                                                    <CheckCircle style={{ width: 14, height: 14, color: 'var(--green)' }} />
                                                )}
                                                <ChevronRight style={{
                                                    width: 14, height: 14, color: 'var(--text-muted)',
                                                    transform: activeChapter === chapter.id ? 'rotate(90deg)' : 'rotate(0deg)',
                                                    transition: 'transform 0.2s',
                                                }} />
                                            </div>
                                        </div>

                                        {/* Chapter Expanded Detail */}
                                        {activeChapter === chapter.id && CHAPTER_DETAILS[chapter.id] && (
                                            <div style={{
                                                margin: '0 0 4px 0',
                                                background: 'var(--blue-50)',
                                                border: '1px solid var(--blue-100)',
                                                borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                                                padding: '12px 14px',
                                            }}>
                                                <p style={{ fontSize: 12, color: 'var(--blue-800)', fontWeight: 600, marginBottom: 10, lineHeight: 1.5 }}>
                                                    {CHAPTER_DETAILS[chapter.id].subtitle}
                                                </p>
                                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                                                    Topics Covered
                                                </div>
                                                {CHAPTER_DETAILS[chapter.id].keyPoints.map((pt, i) => (
                                                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                                        <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                                                        <span style={{ fontSize: 12, color: 'var(--blue-800)', fontWeight: 600 }}>{pt}</span>
                                                    </div>
                                                ))}
                                                <button
                                                    style={{
                                                        marginTop: 10, padding: '8px 14px', border: '1px solid var(--blue-200)',
                                                        borderRadius: 'var(--radius-sm)', background: '#fff', cursor: 'pointer',
                                                        fontSize: 11, fontWeight: 700, color: 'var(--accent)',
                                                        display: 'flex', alignItems: 'center', gap: 6,
                                                    }}
                                                    onClick={() => showToast(`Playing Chapter ${chapter.id}`, 'info')}
                                                >
                                                    <Play style={{ width: 10, height: 10 }} />
                                                    {chapter.completed ? 'Rewatch Chapter' : 'Start Chapter'}
                                                </button>
                                            </div>
                                        )}
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
                            style={{ marginTop: 4 }}
                            onClick={() => showToast('Assessment simulation started', 'info')}
                        >
                            <Play /> Start Assessment
                        </button>
                    </div>
                )}

                {/* ── DETAILS TAB ── */}
                {activeTab === 'details' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Instructor Card */}
                        <div style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)', padding: '16px', boxShadow: 'var(--shadow-xs)',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Module Instructor
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, var(--blue-400), var(--accent))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <UserIcon style={{ width: 24, height: 24, color: '#fff' }} />
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{detail.instructor.name}</div>
                                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{detail.instructor.title}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>
                                        {detail.instructor.experience} industry experience
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Module Meta */}
                        <div style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)', padding: '16px',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Module Information
                            </div>
                            {[
                                { label: 'Module ID', value: `MOD-${module.moduleId}` },
                                { label: 'Total Duration', value: detail.duration },
                                { label: 'Chapters', value: `${totalChapters} chapters` },
                                { label: 'Last Updated', value: detail.lastUpdated },
                                { label: 'Available Quality', value: module.quality === 'hq' ? 'High Definition' : 'Data-Saver' },
                                { label: 'File Size', value: `${module.sizeMB} MB` },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--border-light)' : 'none',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Prerequisites */}
                        {detail.prerequisites.length > 0 && (
                            <div style={{
                                background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                                borderRadius: 'var(--radius-md)', padding: '16px',
                            }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                    Prerequisites
                                </div>
                                {detail.prerequisites.map((pre, i) => (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 10,
                                        padding: '8px 0', borderBottom: i < detail.prerequisites.length - 1 ? '1px solid var(--border-light)' : 'none',
                                    }}>
                                        <CheckCircle style={{ width: 14, height: 14, color: 'var(--green)', flexShrink: 0 }} />
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{pre}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Prior Assessment Attempts */}
                        <div style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)', padding: '16px',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Assessment History
                            </div>
                            {detail.priorAttempts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>No attempts recorded yet</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 4 }}>Complete the module to unlock the assessment</div>
                                </div>
                            ) : (
                                detail.priorAttempts.map((attempt, i) => {
                                    const dateStr = attempt.date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
                                    return (
                                        <div key={i} style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 12px', marginBottom: i < detail.priorAttempts.length - 1 ? 8 : 0,
                                            background: attempt.passed ? 'var(--green-light)' : 'var(--red-light)',
                                            border: `1px solid ${attempt.passed ? 'var(--green-border)' : 'var(--red-border)'}`,
                                            borderRadius: 'var(--radius-sm)',
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: attempt.passed ? 'var(--green)' : 'var(--red)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                }}>
                                                    {attempt.passed
                                                        ? <Award style={{ width: 16, height: 16, color: '#fff' }} />
                                                        : <AlertTriangle style={{ width: 16, height: 16, color: '#fff' }} />
                                                    }
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                                                        Attempt #{i + 1}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{dateStr}</div>
                                                </div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: 18, fontWeight: 800, color: attempt.passed ? 'var(--green)' : 'var(--red)' }}>
                                                    {attempt.score}%
                                                </div>
                                                <div style={{ fontSize: 10, fontWeight: 700, color: attempt.passed ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }}>
                                                    {attempt.passed ? 'Passed' : 'Failed'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}

                {/* ── RESOURCES TAB ── */}
                {activeTab === 'resources' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                            Downloadable Materials
                        </div>
                        {detail.resources.map((res, i) => (
                            <div
                                key={i}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)', padding: '14px 16px',
                                    cursor: 'pointer', boxShadow: 'var(--shadow-xs)',
                                }}
                                onClick={() => showToast(`Opening ${res.name}`, 'info')}
                            >
                                <div style={{
                                    width: 40, height: 40, borderRadius: 'var(--radius-sm)',
                                    background: 'var(--blue-50)', border: '1px solid var(--blue-100)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                }}>
                                    <FileText style={{ width: 20, height: 20, color: 'var(--accent)' }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{res.name}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginTop: 2 }}>{res.size}</div>
                                </div>
                                <DownloadIcon style={{ width: 18, height: 18, color: 'var(--text-muted)', flexShrink: 0 }} />
                            </div>
                        ))}

                        <div style={{
                            marginTop: 6,
                            background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
                            borderRadius: 'var(--radius-md)', padding: '12px 14px',
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                        }}>
                            <AlertTriangle style={{ width: 15, height: 15, color: 'var(--amber)', flexShrink: 0, marginTop: 2 }} />
                            <div style={{ fontSize: 11, color: '#78350F', fontWeight: 600, lineHeight: 1.5 }}>
                                Resources are cached locally with the module download. They remain accessible offline.
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
