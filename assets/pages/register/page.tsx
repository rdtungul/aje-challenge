import React, { useState } from 'react';

interface Props {
    onGoToLogin: () => void;
    onRegistered: () => void;
}

const RegisterPage: React.FC<Props> = ({ onGoToLogin, onRegistered }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [confirmToken, setConfirmToken] = useState<string | null>(null);
    const [confirming, setConfirming] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed. Please try again.');
            } else {
                setConfirmToken(data.confirmToken);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmEmail = async () => {
        if (!confirmToken) return;
        setConfirming(true);

        try {
            await fetch(`/api/confirm-email/${confirmToken}`, {
                credentials: 'include',
            });
            onRegistered();
        } catch (err) {
            setError('Confirmation failed. Please try again.');
        } finally {
            setConfirming(false);
        }
    };

    if (confirmToken) {
        return (
            <div className="auth-container">
                <div className="auth-box">
                    <h1 className="auth-title">AJE Notes</h1>
                    <h2 className="auth-subtitle">Verify Your Email</h2>

                    <div className="alert alert--success">
                        A confirmation email has been sent to <strong>{email}</strong>.
                    </div>

                    {error && <div className="alert alert--error">{error}</div>}

                    <p style={{ marginBottom: '1.5rem', color: '#555', fontSize: '0.95rem' }}>
                        Click the button below to confirm your email address and activate your account.
                    </p>

                    <button
                        className="btn btn--primary btn--full"
                        onClick={handleConfirmEmail}
                        disabled={confirming}
                    >
                        {confirming ? 'Confirming...' : 'Confirm Email'}
                    </button>

                    <p className="auth-link">
                        <button className="link-btn" onClick={onGoToLogin}>
                            Back to Sign In
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1 className="auth-title">AJE Notes</h1>
                <h2 className="auth-subtitle">Create Account</h2>

                {error && <div className="alert alert--error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            placeholder="Repeat your password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="auth-link">
                    Already have an account?{' '}
                    <button className="link-btn" onClick={onGoToLogin}>
                        Sign in here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
