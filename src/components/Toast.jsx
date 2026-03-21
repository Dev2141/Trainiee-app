import React from 'react';
import { CheckCircle, Info, AlertTriangle } from './Icons';

export default function Toast({ toast }) {
    if (!toast) return <div className="toast" />;

    const isSuccess = toast.type === 'success';
    const isWarning = toast.type === 'warning';

    return (
        <div className={`toast visible`}>
            {isSuccess && <CheckCircle style={{ color: 'var(--green)' }} />}
            {isWarning && <AlertTriangle style={{ color: 'var(--amber)' }} />}
            {!isSuccess && !isWarning && <Info style={{ color: 'var(--accent)' }} />}
            <span>{toast.message}</span>
        </div>
    );
}
