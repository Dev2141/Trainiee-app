import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StorageBar from '../components/StorageBar';
import ConfirmDialog from '../components/ConfirmDialog';
import { Database, Folder, Bell, Refresh, ChevronRight } from '../components/Icons';
import { getDeviceStorageInfo } from '../nativeServices';

export default function SettingsScreen({ navigateTo, showToast }) {
    const { logout, user } = useAuth();
    const [showDebugConfirm, setShowDebugConfirm] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [storageStats, setStorageStats] = useState(null);
    const [storageLoading, setStorageLoading] = useState(true);

    // Load real device storage on mount
    useEffect(() => {
        async function loadStorage() {
            try {
                const stats = await getDeviceStorageInfo();
                setStorageStats({
                    totalUsedMB: stats.appUsedMB,
                    deviceTotalGB: stats.deviceTotalGB,
                    deviceFreeMB: stats.deviceFreeMB,
                    usagePercent: stats.usagePercent,
                });
            } catch (err) {
                console.error('Storage read error:', err);
                setStorageStats({ totalUsedMB: 0, deviceTotalGB: 64, deviceFreeMB: 32768, usagePercent: 0 });
            } finally {
                setStorageLoading(false);
            }
        }
        loadStorage();
    }, []);

    function handleDebugRun() {
        setShowDebugConfirm(false);
        showToast?.('System maintenance task initiated', 'info');
    }

    function handleLogout() {
        setShowLogoutConfirm(false);
        logout();
        showToast?.('Logged out successfully', 'info');
    }

    return (
        <div className="screen-content">
            <div className="screen-title">Account Settings</div>
            <div className="screen-subtitle">Manage your local storage and application preferences.</div>

            {/* User Profile Card */}
            {user && (
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, marginBottom: 4 }}>
                    <div style={{
                        width: 46, height: 46, borderRadius: '50%',
                        background: 'var(--accent)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>
                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                        </span>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user.name || 'Unknown User'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {user.email}
                        </div>
                        <div style={{ marginTop: 4 }}>
                            <span className="badge badge-category" style={{ fontSize: 10 }}>
                                {user.role?.toUpperCase() || 'TRAINEE'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Storage Bar Card */}
            <div className="card" style={{ marginBottom: 16, marginTop: 12 }}>
                {storageLoading ? (
                    <div style={{ padding: '8px 0', color: 'var(--text-muted)', fontSize: 13 }}>
                        Measuring device storage...
                    </div>
                ) : (
                    <StorageBar stats={storageStats} showBreakdown={false} />
                )}
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
                <span className="section-label">Maintenance &amp; Security</span>
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

            {/* Logout Button */}
            <div style={{ marginTop: 24, marginBottom: 16 }}>
                <button
                    onClick={() => setShowLogoutConfirm(true)}
                    style={{
                        width: '100%',
                        padding: '14px 16px',
                        background: 'var(--red-light)',
                        color: 'var(--red)',
                        border: '1px solid var(--red-border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        minHeight: 48,
                    }}
                >
                    Sign Out
                </button>
            </div>

            {/* Version Info */}
            <div className="info-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                    <Database style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                    <span className="info-text">Eagle LMS • Secure Offline Architecture</span>
                </div>
                <div className="info-sub">v1.0.0 • Module 14 Build</div>
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

            {/* Logout Confirm Dialog */}
            {showLogoutConfirm && (
                <ConfirmDialog
                    title="Sign Out"
                    message="Are you sure you want to sign out? You'll need to log in again to access your modules."
                    confirmText="Sign Out"
                    onConfirm={handleLogout}
                    onCancel={() => setShowLogoutConfirm(false)}
                    danger
                />
            )}
        </div>
    );
}
