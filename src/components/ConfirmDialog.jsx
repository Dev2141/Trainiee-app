import React from 'react';
import { AlertTriangle, Trash2, CloudDownload } from './Icons';

export default function ConfirmDialog({ title, message, confirmText, onConfirm, onCancel, danger = false }) {
    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
                <div
                    className="confirm-icon"
                    style={{ backgroundColor: danger ? 'var(--red-light)' : 'var(--blue-light)' }}
                >
                    {danger ? (
                        <Trash2 style={{ color: 'var(--red)' }} />
                    ) : (
                        <CloudDownload style={{ color: 'var(--accent)' }} />
                    )}
                </div>
                <div className="confirm-title">{title}</div>
                <div className="confirm-message">{message}</div>
                <div className="confirm-actions">
                    <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
                    <button
                        className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
