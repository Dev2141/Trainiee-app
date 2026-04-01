import React, { useState, useEffect } from 'react';
import apiService from '../api/apiService';
import ResultCard from '../components/ResultCard';
import { Award, Clipboard, Target, WifiOff, Refresh } from '../components/Icons';

export default function ResultsScreen({ navigateTo }) {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadResults();
    }, []);

    async function loadResults() {
        try {
            setLoading(true);
            setError('');
            const response = await apiService.getResults();
            setResults(response.data.results || []);
        } catch (err) {
            console.error('Failed to load results:', err);
            setError('Could not load results. Make sure you are connected.');
        } finally {
            setLoading(false);
        }
    }

    const totalAttempts = results.length;
    const avgScore = totalAttempts > 0
        ? Math.round(results.reduce((s, r) => s + r.percentageScore, 0) / totalAttempts)
        : 0;
    const passCount = results.filter(r => r.passed).length;

    if (loading) {
        return (
            <div className="screen-content">
                <div className="screen-title">Performance</div>
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
                    Loading results...
                </div>
            </div>
        );
    }

    return (
        <div className="screen-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                <div className="screen-title">Performance</div>
                <button
                    onClick={loadResults}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--accent)', padding: 6, borderRadius: 8,
                        display: 'flex', alignItems: 'center',
                    }}
                    title="Refresh results"
                >
                    <Refresh style={{ width: 18, height: 18 }} />
                </button>
            </div>

            <div className="screen-subtitle">
                Your synced scorecard history and proficiency metrics.
            </div>

            {error && (
                <div style={{
                    padding: '12px', marginBottom: '16px', marginTop: 8,
                    background: 'var(--red-light)', border: '1px solid var(--red-border)',
                    borderRadius: 'var(--radius-sm)', color: 'var(--red)', fontSize: 12, fontWeight: 600,
                }}>
                    {error}
                </div>
            )}

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

            {/* Result Cards — map backend shape to what ResultCard expects */}
            {results.map(r => (
                <ResultCard
                    key={r.id}
                    result={{
                        id: r.id,
                        moduleId: r.module_id,
                        moduleName: r.moduleName,
                        score: r.score,
                        maxScore: r.total_marks,
                        percentageScore: r.percentageScore,
                        passed: r.passed,
                        completedAt: r.completedAt ? new Date(r.completedAt) : null,
                        syncStatus: r.syncStatus,
                    }}
                    onClick={() => navigateTo && navigateTo('assessmentDetail', r)}
                />
            ))}

            {!loading && results.length === 0 && !error && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Clipboard />
                    </div>
                    <div className="empty-title">No assessment results yet</div>
                    <div className="empty-subtitle">
                        Complete your training modules and assessments to see your scorecard here.
                    </div>
                </div>
            )}
        </div>
    );
}
