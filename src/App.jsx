import React, { useState } from 'react';
import ModulesScreen from './screens/ModulesScreen';
import ResultsScreen from './screens/ResultsScreen';
import SettingsScreen from './screens/SettingsScreen';
import StorageManagerScreen from './screens/StorageManagerScreen';
import ModuleDetailScreen from './screens/ModuleDetailScreen';
import AssessmentDetailScreen from './screens/AssessmentDetailScreen';
import Toast from './components/Toast';
import { BookOpen, ChartBar, Settings } from './components/Icons';

const TABS = [
    { id: 'modules', label: 'Modules', Icon: BookOpen },
    { id: 'results', label: 'Results', Icon: ChartBar },
    { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function App() {
    const [activeTab, setActiveTab] = useState('modules');
    const [subScreen, setSubScreen] = useState(null); // 'storageManager', 'moduleDetail', 'assessmentDetail'
    const [activeModule, setActiveModule] = useState(null);
    const [activeResult, setActiveResult] = useState(null);
    const [toast, setToast] = useState(null);

    function showToast(message, type = 'success') {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    }

    function navigateTo(screen, data = null) {
        if (screen === 'moduleDetail' && data) {
            setActiveModule(data);
        }
        if (screen === 'assessmentDetail' && data) {
            setActiveResult(data);
        }
        setSubScreen(screen);
    }

    function goBack() {
        setSubScreen(null);
        setActiveModule(null);
        setActiveResult(null);
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
        </div>
    );
}
