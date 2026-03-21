import React from 'react';
import { mockResults } from '../mockData';
import ResultCard from '../components/ResultCard';
import { Award, Clipboard, Target, TrendingUp, WifiOff } from '../components/Icons';

export default function ResultsScreen({ navigateTo }) {
    const results = mockResults;
    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0
        ? Math.round(results.reduce((s, r) => s + r.percentageScore, 0) / totalAttempts)
        : 0;
    const passCount = results.filter(r => r.passed).length;
    const failCount = totalAttempts - passCount;

    return (
        <div className="screen-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div className="screen-title">Performance</div>
                <span className="badge badge-offline">
                    <WifiOff style={{ width: 12, height: 12 }} /> Offline View
                </span>
            </div>

            <div className="screen-subtitle">
                Your synced scorecard history and proficiency metrics.
            </div>

            {/* Summary Cards */}
            {totalAttempts > 0 && (
                <div className="summary-row">
                    <div className="summary-card">
                        <div className="summary-icon" style={{ backgroundColor: 'var(--blue-50)' }}>
                            <Clipboard style={{ color: 'var(--blue-600)' }} />
                        </div>
                        <div className="summary-value">{totalAttempts}</div>
                        <div className="summary-label">Tests</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon" style={{ backgroundColor: 'var(--green-light)' }}>
                            <Award style={{ color: 'var(--green)' }} />
                        </div>
                        <div className="summary-value" style={{ color: 'var(--green)' }}>{passCount}</div>
                        <div className="summary-label">Passed</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon" style={{ backgroundColor: 'var(--accent-light)' }}>
                            <Target style={{ color: 'var(--accent)' }} />
                        </div>
                        <div className="summary-value">{avgScore}%</div>
                        <div className="summary-label">Average</div>
                    </div>
                </div>
            )}

            {/* Section Heading */}
            <div className="section-header">
                <span className="section-label">Scorecard History</span>
                <span className="section-count">{results.length} Recorded</span>
            </div>

            {/* Result Cards */}
            {results.map(r => (
                <ResultCard
                    key={r.id}
                    result={r}
                    onClick={() => navigateTo && navigateTo('assessmentDetail', r)}
                />
            ))}

            {results.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Clipboard />
                    </div>
                    <div className="empty-title">No assessment results</div>
                    <div className="empty-subtitle">
                        Complete your training modules and assessments while online to sync your scorecard data here.
                    </div>
                </div>
            )}
        </div>
    );
}
