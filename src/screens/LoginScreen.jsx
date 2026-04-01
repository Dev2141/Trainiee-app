import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import apiService from '../api/apiService';
import { LogIn } from '../components/Icons';

export default function LoginScreen() {
    const { login } = useAuth();
    const [email, setEmail] = useState('trainee@eagle.com');
    const [password, setPassword] = useState('trainee123');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleLogin(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await apiService.login(email, password);
            const { access_token, user } = response.data;

            login(user, access_token);
            // Redirect handled automatically by App.jsx
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'var(--bg-screen)',
                padding: '20px',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
        >
            {/* Logo / Header */}
            <div
                style={{
                    marginBottom: '40px',
                    textAlign: 'center',
                }}
            >
                <div
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'var(--accent)',
                        marginBottom: '16px',
                    }}
                >
                    <LogIn style={{ width: 32, height: 32, color: 'var(--text-white)' }} />
                </div>
                <h1 style={{ color: 'var(--text-primary)', fontSize: 28, fontWeight: 800, margin: 0 }}>
                    Eagle LMS
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 8 }}>
                    Training & Reporting System
                </p>
            </div>

            {/* Login Form */}
            <form
                onSubmit={handleLogin}
                style={{
                    width: '100%',
                    maxWidth: '360px',
                    background: 'var(--bg-primary)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px',
                    boxShadow: 'var(--shadow-md)',
                }}
            >
                {/* Email Field */}
                <div style={{ marginBottom: '20px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                        }}
                    >
                        Email
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-input)',
                            fontSize: 14,
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent)';
                            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Password Field */}
                <div style={{ marginBottom: '24px' }}>
                    <label
                        style={{
                            display: 'block',
                            fontSize: 13,
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            marginBottom: '8px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                        }}
                    >
                        Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '12px 14px',
                            border: '1px solid var(--border)',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-input)',
                            fontSize: 14,
                            color: 'var(--text-primary)',
                            fontFamily: 'inherit',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--accent)';
                            e.target.style.boxShadow = '0 0 0 3px var(--accent-glow)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div
                        style={{
                            padding: '12px',
                            marginBottom: '20px',
                            background: 'var(--red-light)',
                            border: '1px solid var(--red-border)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--red)',
                            fontSize: 13,
                            fontWeight: 600,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: loading ? 'var(--blue-300)' : 'var(--accent)',
                        color: 'var(--text-white)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        fontSize: 14,
                        fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                    }}
                    onMouseEnter={(e) => {
                        if (!loading) e.target.style.background = 'var(--accent-hover)';
                    }}
                    onMouseLeave={(e) => {
                        if (!loading) e.target.style.background = 'var(--accent)';
                    }}
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                {/* Demo Info */}
                <div
                    style={{
                        marginTop: '20px',
                        padding: '12px',
                        background: 'var(--blue-light)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 12,
                        color: 'var(--blue-800)',
                        lineHeight: 1.5,
                    }}
                >
                    <strong>Demo Credentials:</strong>
                    <br />
                    Email: trainee@eagle.com
                    <br />
                    Password: trainee123
                </div>
            </form>
        </div>
    );
}
