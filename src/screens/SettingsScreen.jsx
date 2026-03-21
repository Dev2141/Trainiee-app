import React, { useState } from 'react';
import { mockModules, mockStorageStats } from '../mockData';
import StorageBar from '../components/StorageBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { Database, Folder, Bell, Refresh, ChevronRight, Info } from '../components/Icons';

export default function SettingsScreen({ navigateTo, showToast }) {
    const [showDebugConfirm, setShowDebugConfirm] = useState(false);

    function handleDebugRun() {
        setShowDebugConfirm(false);
        showToast?.('System maintenance task initiated', 'info');
    }

    return (
        <div className="screen-content">
            <div className="screen-title">Account Settings</div>
            <div className="screen-subtitle">Manage your local storage and application preferences.</div>

            {/* Storage Bar Card */}
            <div className="card" style={{ marginBottom: 16, marginTop: 12 }}>
                <StorageBar
                    stats={mockStorageStats}
                    showBreakdown={true}
                    modules={mockModules}
                />
            </div>

            {/* Storage Manager Nav */}
            <div className="nav-row" onClick={() => navigateTo('storageManager')}>
                <div className="nav-row-left">
                    <div className="nav-row-icon" style={{ backgroundColor: 'var(--blue-50)' }}>
                        <Folder style={{ color: 'var(--blue-600)' }} />
                    </div>
                    <div>
                        <div className="nav-row-title">Storage Optimizer</div>
                        <div className="nav-row-sub">Manage offline files and cache</div>
                    </div>
                </div>
                <span className="nav-row-chevron"><ChevronRight /></span>
            </div>

            {/* Developer Section */}
            <div className="section-header">
                <span className="section-label">Maintenance & Security</span>
            </div>

            <div className="nav-row" onClick={() => setShowDebugConfirm(true)}>
                <div className="nav-row-left">
                    <div className="nav-row-icon" style={{ backgroundColor: 'var(--accent-light)' }}>
                        <Refresh style={{ color: 'var(--accent)' }} />
                    </div>
                    <div>
                        <div className="nav-row-title">Synchronize Metadata</div>
                        <div className="nav-row-sub">Refresh logs and inactivity records</div>
                    </div>
                </div>
                <span className="nav-row-chevron"><ChevronRight /></span>
            </div>

            {/* Notification Test */}
            <div className="nav-row" onClick={() => showToast?.('Local notification service active', 'success')}>
                <div className="nav-row-left">
                    <div className="nav-row-icon" style={{ backgroundColor: '#FAF5FF' }}>
                        <Bell style={{ color: '#7C3AED' }} />
                    </div>
                    <div>
                        <div className="nav-row-title">App Notifications</div>
                        <div className="nav-row-sub">Toggle alerts and reminders</div>
                    </div>
                </div>
                <span className="nav-row-chevron"><ChevronRight /></span>
            </div>

            {/* Version Info */}
            <div className="info-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                    <Database style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                    <span className="info-text">Secure Offline Architecture</span>
                </div>
                <div className="info-sub">v2.4.0 • Enterprise Edition</div>
            </div>

            {/* Debug Confirm Dialog */}
            {showDebugConfirm && (
                <ConfirmDialog
                    title="Manual Synchronization"
                    message="This will force a check of all local material timestamps and cleanup orphan file temporary markers."
                    confirmText="Initialize Now"
                    onConfirm={handleDebugRun}
                    onCancel={() => setShowDebugConfirm(false)}
                />
            )}
        </div>
    );
}
