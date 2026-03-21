import React, { useState } from 'react';
import { HighQuality, Zap, Check } from './Icons';

function formatBytes(bytes) {
    if (!bytes) return 'N/A';
    if (bytes >= 1024 * 1024 * 1024) {
        return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    }
    return `${Math.round(bytes / (1024 * 1024))} MB`;
}

export default function DownloadQualitySelector({
    visible,
    moduleName,
    hqSizeBytes,
    dsSizeBytes,
    onSelect,
    onCancel,
}) {
    const [selected, setSelected] = useState('hq');

    if (!visible) return null;

    const options = [
        {
            key: 'hq',
            label: 'High Definition',
            description: 'Maximum visual fidelity for immersive learning experiences.',
            sizeBytes: hqSizeBytes,
            Icon: HighQuality,
            accentColor: 'var(--blue-600)',
            bgClass: 'selected-hq',
        },
        {
            key: 'ds',
            label: 'Data Efficient',
            description: 'Optimized for mobile connections and limited storage.',
            sizeBytes: dsSizeBytes,
            Icon: Zap,
            accentColor: '#059669',
            bgClass: 'selected-ds',
        },
    ];

    return (
        <div className="modal-backdrop" onClick={onCancel}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
                <div className="modal-handle" />

                <div className="modal-title">Download Preference</div>
                <div className="modal-subtitle">{moduleName}</div>

                {options.map(opt => {
                    const isSelected = selected === opt.key;
                    const { Icon } = opt;
                    return (
                        <div
                            key={opt.key}
                            className={`quality-option ${isSelected ? opt.bgClass : ''}`}
                            onClick={() => setSelected(opt.key)}
                        >
                            <div className="quality-left">
                                <div
                                    className="quality-icon-wrap"
                                    style={{ backgroundColor: isSelected ? 'transparent' : 'var(--bg-card-hover)' }}
                                >
                                    <Icon style={{ color: isSelected ? opt.accentColor : 'var(--text-muted)' }} />
                                </div>
                                <div>
                                    <div className="quality-label">{opt.label}</div>
                                    <div className="quality-desc">{opt.description}</div>
                                </div>
                            </div>
                            <div className="quality-right">
                                <span
                                    className="quality-size"
                                    style={isSelected ? { color: opt.accentColor } : { color: 'var(--text-muted)' }}
                                >
                                    {formatBytes(opt.sizeBytes)}
                                </span>
                                {isSelected && (
                                    <div className="quality-check" style={{ backgroundColor: opt.accentColor }}>
                                        <Check />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="button-row">
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>
                        Cancel
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ flex: 2 }}
                        onClick={() => onSelect(selected)}
                    >
                        Start Download
                    </button>
                </div>
            </div>
        </div>
    );
}
