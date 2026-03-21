import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, TrendingUp, ChevronRight } from './Icons';

export default function ResultCard({ result, onClick }) {
    const [animatedWidth, setAnimatedWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(result.percentageScore);
        }, 300);
        return () => clearTimeout(timer);
    }, [result.percentageScore]);

    const passed = result.passed;
    const dateStr = result.completedAt.toLocaleDateString('en-US', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
        <div
            className="card"
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <div className="card-accent-bar" style={{ backgroundColor: passed ? 'var(--green)' : 'var(--red)' }} />

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="sync-dot synced" style={{ backgroundColor: passed ? 'var(--green)' : 'var(--red)' }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>
                        Assessment #{result.moduleId}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`badge ${passed ? 'badge-pass' : 'badge-fail'}`}>
                        {passed ? <CheckCircle /> : <XCircle />}
                        {passed ? 'SUCCESS' : 'FAILED'}
                    </span>
                    {onClick && (
                        <ChevronRight style={{ width: 16, height: 16, color: 'var(--text-muted)' }} />
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                        Knowledge Score
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                        <span style={{ fontSize: 32, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1px' }}>
                            {result.score}
                        </span>
                        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-muted)' }}>
                            /{result.maxScore}
                        </span>
                    </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: passed ? 'var(--green)' : 'var(--red)', marginBottom: 2 }}>
                        <TrendingUp style={{ width: 16, height: 16 }} />
                        <span style={{ fontSize: 24, fontWeight: 800 }}>{result.percentageScore}%</span>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        Proficiency
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: 14 }}>
                <div className="score-track">
                    <div
                        className="score-fill"
                        style={{
                            width: `${animatedWidth}%`,
                            backgroundColor: passed ? 'var(--green)' : 'var(--red)',
                        }}
                    />
                </div>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {dateStr}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`sync-dot ${result.syncStatus === 'synced' ? 'synced' : 'local'}`} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {result.syncStatus === 'synced' ? 'Cloud Synced' : 'Local Backup'}
                    </span>
                </div>
            </div>
        </div>
    );
}
