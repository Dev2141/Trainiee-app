import React, { useState, useEffect, useRef } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginScreen from './screens/LoginScreen';
import ModulesScreen from './screens/ModulesScreen';
import ResultsScreen from './screens/ResultsScreen';
import SettingsScreen from './screens/SettingsScreen';
import StorageManagerScreen from './screens/StorageManagerScreen';
import ModuleDetailScreen from './screens/ModuleDetailScreen';
import AssessmentDetailScreen from './screens/AssessmentDetailScreen';
import Toast from './components/Toast';
import { BookOpen, ChartBar, Settings, Wifi } from './components/Icons';
import syncService, { autoArchiveService } from './services/syncService';

const TABS = [
    { id: 'modules', label: 'Modules', Icon: BookOpen },
    { id: 'results', label: 'Results', Icon: ChartBar },
    { id: 'settings', label: 'Settings', Icon: Settings },
];

function AppContent() {
    const { isAuthenticated, loading } = useAuth();
    const [activeTab, setActiveTab] = useState('modules');
    // Navigation stack — each entry: { screen, data }
    // Empty stack = root tab view. Pushing navigates forward, popping goes back.
    const [navStack, setNavStack] = useState([]);
    const [toast, setToast] = useState(null);
    const [syncStatus, setSyncStatus] = useState('idle');
    // Ref so backButton listener always reads latest stack without stale closure
    const navStackRef = useRef([]);
    useEffect(() => { navStackRef.current = navStack; }, [navStack]);

    // Derived helpers
    const currentNav = navStack[navStack.length - 1] || null;
    const subScreen = currentNav?.screen || null;
    const activeModule = navStack.find(n => n.screen === 'moduleDetail')?.data || null;
    const activeResult = navStack.find(n => n.screen === 'assessmentDetail')?.data || null;

    // Initialize offline-first services
    useEffect(() => {
        if (isAuthenticated) {
            const initializeServices = async () => {
                try {
                    // Run archive maintenance check
                    await autoArchiveService.runMaintenanceCheck();

                    // Initialize sync engine with network status callback
                    await syncService.init(
                        (status, data) => {
                            setSyncStatus(status);
                            if (status === 'idle' && data && data.successCount > 0) {
                                showToast(
                                    `✓ Synced ${data.successCount} offline result${data.successCount !== 1 ? 's' : ''}`,
                                    'success'
                                );
                            } else if (status === 'idle' && data && data.failedCount > 0) {
                                showToast(
                                    `${data.failedCount} item${data.failedCount !== 1 ? 's' : ''} failed to sync. Will retry later.`,
                                    'warning'
                                );
                            }
                        },
                        /**
                         * Step 3: Network Toast Callback
                         * Handles network state changes and shows appropriate toasts
                         */
                        (eventType, message) => {
                            if (eventType === 'offline') {
                                showToast(message, 'warning');
                            } else if (eventType === 'reconnect') {
                                showToast(message, 'info');
                            } else if (eventType === 'synced') {
                                showToast(message, 'success');
                            }
                        }
                    );
                } catch (error) {
                    console.error('Failed to initialize services:', error);
                }
            };

            initializeServices();

            // ── Hardware Back Button (Android) ──────────────────────────────
            let backListener = null;
            if (Capacitor.isNativePlatform()) {
                CapacitorApp.addListener('backButton', () => {
                    if (navStackRef.current.length > 0) {
                        // Pop one screen off the stack (step back, not jump to root)
                        setNavStack(prev => prev.slice(0, -1));
                    } else {
                        // On root tab → minimize app (Android convention)
                        CapacitorApp.minimizeApp();
                    }
                }).then(listener => { backListener = listener; });
            }

            // Cleanup on unmount
            return () => {
                syncService.destroy();
                if (backListener) backListener.remove();
            };
        }
    }, [isAuthenticated]);

    // Show login if not authenticated
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    background: 'var(--bg-screen)',
                }}
            >
                <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loading...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <LoginScreen />;
    }

    function showToast(message, type = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function navigateTo(screen, data = null) {
        // Push new screen onto the stack — preserves history
        setNavStack(prev => [...prev, { screen, data }]);
    }

    function goBack() {
        // Pop one level — correctly returns to previous screen (not root)
        setNavStack(prev => prev.slice(0, -1));
    }

    function renderScreen() {
        if (subScreen === 'storageManager') {
            return <StorageManagerScreen onBack={goBack} showToast={showToast} />;
        }
        if (subScreen === 'moduleDetail' && activeModule) {
            return <ModuleDetailScreen module={activeModule} onBack={goBack} showToast={showToast} />;
        }
        if (subScreen === 'assessmentDetail' && activeResult) {
            return <AssessmentDetailScreen result={activeResult} onBack={goBack} />;
        }

        switch (activeTab) {
            case 'modules':
                return <ModulesScreen showToast={showToast} onOpenModule={(m) => navigateTo('moduleDetail', m)} />;
            case 'results':
                return <ResultsScreen navigateTo={navigateTo} />;
            case 'settings':
                return <SettingsScreen navigateTo={navigateTo} showToast={showToast} />;
            default:
                return null;
        }
    }

    return (
        <div className="phone-frame">
            {/* Sync Status Indicator */}
            {syncStatus === 'syncing' && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        right: 12,
                        padding: '8px 12px',
                        background: 'var(--accent-light)',
                        color: 'var(--accent)',
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: '0 0 var(--radius-md) var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        zIndex: 100,
                    }}
                >
                    <div
                        style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                    />
                    Syncing...
                </div>
            )}

            {/* Screen Content */}
            <div className="screen-area">
                {renderScreen()}
            </div>

            {/* Bottom Tab Bar */}
            {!subScreen && (
                <div className="tab-bar">
                    {TABS.map(({ id, label, Icon }) => (
                        <button
                            key={id}
                            className={`tab-item ${activeTab === id ? 'active' : ''}`}
                            onClick={() => setActiveTab(id)}
                        >
                            <div className="tab-icon-wrap">
                                <Icon />
                            </div>
                            <span className="tab-label">{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Toast */}
            <Toast toast={toast} />

            {/* Pulse animation for sync indicator */}
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}
