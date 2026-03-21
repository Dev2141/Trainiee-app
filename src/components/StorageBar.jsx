import React, { useState, useEffect } from 'react';
import { HardDrive } from './Icons';

export default function StorageBar({ stats, showBreakdown = true, modules = [] }) {
    const [animatedWidth, setAnimatedWidth] = useState(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedWidth(stats.usagePercent);
        }, 200);
        return () => clearTimeout(timer);
    }, [stats.usagePercent]);

    function getBarColor(pct) {
        if (pct >= 80) return 'var(--red)';
        if (pct >= 50) return 'var(--amber)';
        return 'var(--accent)';
    }

    const downloadedModules = modules.filter(m => m.isDownloaded);

    return (
        <div className="storage-bar-wrap">
            <div className="storage-header">
                <span className="storage-label">Device Storage</span>
                <span className="storage-value">{stats.totalUsedMB} MB used</span>
            </div>

            <div className="storage-track">
                <div
                    className="storage-fill"
                    style={{
                        width: `${animatedWidth}%`,
                        background: getBarColor(stats.usagePercent),
                    }}
                />
            </div>

            <div className="storage-footer">
                <span className="storage-stat">
                    {stats.usagePercent}% of {stats.deviceTotalGB} GB total
                </span>
                <span className="storage-stat">
                    {stats.deviceFreeMB.toLocaleString()} MB available
                </span>
            </div>

            {showBreakdown && downloadedModules.length > 0 && (
                <div className="module-breakdown">
                    <div className="breakdown-header">
                        <HardDrive />
                        <span>Content Inventory</span>
                    </div>
                    {downloadedModules.map(m => (
                        <div key={m.id} className="module-row">
                            <span className="module-name">{m.title}</span>
                            <div className="module-right">
                                <span className={`badge ${m.quality === 'hq' ? 'badge-hq' : 'badge-ds'}`}>
                                    {m.quality.toUpperCase()}
                                </span>
                                <span className="module-size">{m.sizeMB} MB</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
