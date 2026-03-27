import React, { useState, useEffect } from 'react';
import LoginPage from './pages/login/page';
import RegisterPage from './pages/register/page';
import NotesPage from './pages/notes/page';

type Page = 'login' | 'register' | 'notes';

interface User {
    id: number;
    email: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [page, setPage] = useState<Page>('login');
    const [loading, setLoading] = useState(true);
    const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        // Check if there's a confirmation query param in the URL
        const params = new URLSearchParams(window.location.search);
        if (params.get('confirmed') === '1') {
            setFlashMessage({ type: 'success', text: 'Your email has been confirmed! You can now log in.' });
            window.history.replaceState({}, '', '/');
        } else if (params.get('confirmed') === 'error') {
            setFlashMessage({ type: 'error', text: 'Invalid or expired confirmation link.' });
            window.history.replaceState({}, '', '/');
        }

        // Check if user is already logged in
        fetch('/api/me', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.id) {
                    setUser(data);
                    setPage('notes');
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const handleLoginSuccess = (userData: User) => {
        setUser(userData);
        setPage('notes');
        setFlashMessage(null);
    };

    const handleLogout = () => {
        fetch('/api/logout', { method: 'POST', credentials: 'include' })
            .finally(() => {
                setUser(null);
                setPage('login');
            });
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div>
            {flashMessage && (
                <div className={`flash flash--${flashMessage.type}`}>
                    {flashMessage.text}
                    <button className="flash__close" onClick={() => setFlashMessage(null)}>×</button>
                </div>
            )}

            {user && page === 'notes' ? (
                <NotesPage user={user} onLogout={handleLogout} />
            ) : page === 'register' ? (
                <RegisterPage
                    onGoToLogin={() => setPage('login')}
                    onRegistered={() => {
                        setFlashMessage({ type: 'success', text: 'Email confirmed! You can now sign in.' });
                        setPage('login');
                    }}
                />
            ) : (
                <LoginPage
                    onLoginSuccess={handleLoginSuccess}
                    onGoToRegister={() => setPage('register')}
                />
            )}
        </div>
    );
};

export default App;
