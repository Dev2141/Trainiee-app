import React, { useState } from 'react';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, Target, Award,
    TrendingUp, Clipboard, AlertTriangle, Shield, FileText
} from '../components/Icons';
import { mockAssessmentDetails } from '../mockData';

const UserIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);

const RepeatIcon = (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 014-4h14" />
        <polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 01-4 4H3" />
    </svg>
);

export default function AssessmentDetailScreen({ result, onBack }) {
    const [activeTab, setActiveTab] = useState('breakdown');
    const detail = mockAssessmentDetails[result.id];
    const passed = result.passed;

    const submittedStr = detail.submittedAt.toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    });
    const submittedTime = detail.submittedAt.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit',
    });

    const correctCount = detail.questions.filter(q => q.correct).length;
    const wrongCount = detail.questions.length - correctCount;

    return (
        <div className="screen-content" style={{ padding: 0 }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: 12,
                background: 'var(--bg-primary)',
                borderBottom: '1px solid var(--border-light)',
            }}>
                <button className="back-btn" onClick={onBack}>
                    <ArrowLeft />
                </button>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                        Assessment #{result.moduleId}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '240px' }}>
                        {detail.moduleName}
                    </div>
                </div>
            </div>

            {/* Score Hero */}
            <div style={{
                background: passed
                    ? 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)'
                    : 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                padding: '24px 20px 28px',
                textAlign: 'center',
                position: 'relative',
            }}>
                <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 12px',
                }}>
                    {passed
                        ? <Award style={{ width: 40, height: 40, color: '#fff' }} />
                        : <XCircle style={{ width: 40, height: 40, color: '#fff' }} />
                    }
                </div>
                <div style={{ fontSize: 48, fontWeight: 800, color: '#fff', letterSpacing: '-2px', lineHeight: 1 }}>
                    {result.percentageScore}%
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(255,255,255,0.85)', marginTop: 4, marginBottom: 14 }}>
                    {passed ? 'Assessment Passed' : 'Assessment Failed'}
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)',
                        padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                        {result.score} / {result.maxScore} pts
                    </span>
                    <span style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)',
                        padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                        Pass Mark: {detail.passingScore}%
                    </span>
                    <span style={{
                        background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-full)',
                        padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#fff',
                    }}>
                        Attempt #{detail.attempts}
                    </span>
                </div>
            </div>

            {/* Stats Row */}
            <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1, background: 'var(--border-light)',
                borderBottom: '1px solid var(--border-light)',
            }}>
                {[
                    { icon: <Clock style={{ width: 16, height: 16, color: 'var(--accent)' }} />, value: detail.timeSpent, label: 'Time Spent' },
                    { icon: <CheckCircle style={{ width: 16, height: 16, color: 'var(--green)' }} />, value: correctCount, label: 'Correct' },
                    { icon: <XCircle style={{ width: 16, height: 16, color: 'var(--red)' }} />, value: wrongCount, label: 'Incorrect' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: 'var(--bg-primary)', padding: '14px 10px',
                        textAlign: 'center',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>{s.icon}</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{s.value}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex', background: 'var(--bg-primary)',
                borderBottom: '2px solid var(--border-light)', padding: '0 16px',
            }}>
                {[
                    { id: 'breakdown', label: 'Topic Breakdown' },
                    { id: 'questions', label: 'Questions' },
                    { id: 'info', label: 'Details' },
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

            <div style={{ padding: '16px 20px', overflowY: 'auto' }}>

                {/* ── TOPIC BREAKDOWN TAB ── */}
                {activeTab === 'breakdown' && (
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                            Performance by Topic
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {detail.topics.map((topic, i) => (
                                <div key={i} style={{
                                    background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                                    borderRadius: 'var(--radius-md)', padding: '14px 16px',
                                    boxShadow: 'var(--shadow-xs)',
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{topic.name}</span>
                                        <span style={{
                                            fontSize: 13, fontWeight: 800,
                                            color: topic.percentage >= 80 ? 'var(--green)' : topic.percentage >= 60 ? 'var(--amber)' : 'var(--red)',
                                        }}>
                                            {topic.percentage}%
                                        </span>
                                    </div>
                                    <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginBottom: 8 }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${topic.percentage}%`,
                                            borderRadius: 'var(--radius-full)',
                                            background: topic.percentage >= 80 ? 'var(--green)' : topic.percentage >= 60 ? 'var(--amber)' : 'var(--red)',
                                            transition: 'width 0.6s var(--ease-out)',
                                        }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {topic.correct} of {topic.total} correct
                                        </span>
                                        <span style={{
                                            fontSize: 11, fontWeight: 700,
                                            color: topic.percentage >= 80 ? 'var(--green)' : topic.percentage >= 60 ? 'var(--amber)' : 'var(--red)',
                                        }}>
                                            {topic.percentage >= 80 ? 'Strong' : topic.percentage >= 60 ? 'Needs Work' : 'Weak'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recommendation */}
                        <div style={{
                            marginTop: 16, background: passed ? 'var(--green-light)' : 'var(--red-light)',
                            border: `1px solid ${passed ? 'var(--green-border)' : 'var(--red-border)'}`,
                            borderRadius: 'var(--radius-md)', padding: '14px 16px',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <AlertTriangle style={{ width: 16, height: 16, color: passed ? 'var(--green)' : 'var(--red)', flexShrink: 0 }} />
                                <span style={{ fontSize: 12, fontWeight: 800, color: passed ? 'var(--green)' : 'var(--red)', textTransform: 'uppercase' }}>
                                    {passed ? 'Recommendation' : 'Action Required'}
                                </span>
                            </div>
                            <p style={{ fontSize: 12, color: passed ? '#14532d' : '#7f1d1d', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>
                                {detail.recommendation}
                            </p>
                        </div>

                        {/* Certificate Badge */}
                        {detail.certificate && (
                            <div style={{
                                marginTop: 12, background: 'var(--blue-50)',
                                border: '1px solid var(--blue-100)',
                                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                                display: 'flex', alignItems: 'center', gap: 12,
                            }}>
                                <Shield style={{ width: 28, height: 28, color: 'var(--accent)', flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--blue-800)' }}>Certificate Earned</div>
                                    <div style={{ fontSize: 11, color: 'var(--blue-600)', fontWeight: 600 }}>
                                        Synced to your training record on {submittedStr}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ── QUESTIONS TAB ── */}
                {activeTab === 'questions' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                                {detail.questions.length} Questions
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--green)' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green)', display: 'inline-block' }} />
                                    Correct ({correctCount})
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--red)' }}>
                                    <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--red)', display: 'inline-block' }} />
                                    Wrong ({wrongCount})
                                </span>
                            </div>
                        </div>

                        {/* Question Grid */}
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)',
                            gap: 5, marginBottom: 20,
                        }}>
                            {detail.questions.map((q) => (
                                <div
                                    key={q.num}
                                    style={{
                                        aspectRatio: '1',
                                        borderRadius: 'var(--radius-xs)',
                                        background: q.correct ? 'var(--green)' : 'var(--red)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 9, fontWeight: 800, color: '#fff',
                                    }}
                                >
                                    {q.num}
                                </div>
                            ))}
                        </div>

                        {/* Incorrect question highlight */}
                        <div style={{ marginTop: 4 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
                                Missed Questions
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {detail.questions
                                    .filter(q => !q.correct)
                                    .map((q) => (
                                        <div key={q.num} style={{
                                            display: 'flex', alignItems: 'center', gap: 12,
                                            background: 'var(--red-light)', border: '1px solid var(--red-border)',
                                            borderRadius: 'var(--radius-sm)', padding: '10px 12px',
                                        }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 'var(--radius-xs)',
                                                background: 'var(--red)', display: 'flex', alignItems: 'center',
                                                justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                                            }}>
                                                Q{q.num}
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 12, fontWeight: 700, color: '#7f1d1d' }}>
                                                    Question {q.num} — Answered Incorrectly
                                                </div>
                                                <div style={{ fontSize: 11, color: 'var(--red)', fontWeight: 600 }}>
                                                    Review relevant module chapter for this topic
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* ── DETAILS TAB ── */}
                {activeTab === 'info' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                        {/* Submission Info */}
                        <div style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)', padding: '16px',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Submission Details
                            </div>
                            {[
                                { label: 'Date Submitted', value: `${submittedStr} at ${submittedTime}` },
                                { label: 'Time Spent', value: `${detail.timeSpent} of ${detail.timeLimitMinutes} min allowed` },
                                { label: 'Total Attempts', value: `${detail.attempts} attempt${detail.attempts > 1 ? 's' : ''}` },
                                { label: 'Graded By', value: detail.assessor },
                                { label: 'Sync Status', value: result.syncStatus === 'synced' ? 'Cloud Synced' : 'Local Backup' },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                                    <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 700 }}>{row.value}</span>
                                </div>
                            ))}
                        </div>

                        {/* Score Breakdown */}
                        <div style={{
                            background: 'var(--bg-primary)', border: '1px solid var(--border-light)',
                            borderRadius: 'var(--radius-md)', padding: '16px',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>
                                Score Breakdown
                            </div>
                            {[
                                { label: 'Raw Score', value: `${result.score} / ${result.maxScore}` },
                                { label: 'Percentage', value: `${result.percentageScore}%` },
                                { label: 'Passing Mark', value: `${detail.passingScore}%` },
                                { label: 'Margin', value: (() => { const m = result.percentageScore - detail.passingScore; return m >= 0 ? `+${m}% above` : `${m}% below`; })() },
                                { label: 'Result', value: passed ? 'PASS' : 'FAIL' },
                            ].map((row, i) => (
                                <div key={i} style={{
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 0',
                                    borderBottom: i < 4 ? '1px solid var(--border-light)' : 'none',
                                }}>
                                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{row.label}</span>
                                    <span style={{
                                        fontSize: 12, fontWeight: 700,
                                        color: row.label === 'Result' ? (passed ? 'var(--green)' : 'var(--red)') : 'var(--text-primary)',
                                    }}>
                                        {row.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Retake prompt if failed */}
                        {!passed && (
                            <div style={{
                                background: 'var(--amber-light)', border: '1px solid var(--amber-border)',
                                borderRadius: 'var(--radius-md)', padding: '14px 16px',
                                display: 'flex', alignItems: 'flex-start', gap: 10,
                            }}>
                                <RepeatIcon style={{ width: 18, height: 18, color: 'var(--amber)', flexShrink: 0, marginTop: 1 }} />
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: '#92400E', marginBottom: 4 }}>Retake Available</div>
                                    <div style={{ fontSize: 11, color: '#78350F', fontWeight: 500, lineHeight: 1.5 }}>
                                        Return to the module, review the recommended chapters, then start a new assessment attempt. Your best score will be recorded.
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
