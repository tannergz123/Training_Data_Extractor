import { useEffect, useState } from 'react';
import { GlobalThemeProvider, Text } from 'arc';
import Header from './components/layout/Header';
import { ExtractionForm } from './components/ExtractionForm';
import { LoginForm } from './components/LoginForm';

type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

export function App() {
    const [authState, setAuthState] = useState<AuthState>('loading');

    useEffect(() => {
        fetch('/api/auth/check', { credentials: 'include' })
            .then((res) => res.json())
            .then((data) => {
                setAuthState(data.authenticated ? 'authenticated' : 'unauthenticated');
            })
            .catch(() => setAuthState('unauthenticated'));
    }, []);

    function handleLogout() {
        fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
            .then(() => setAuthState('unauthenticated'));
    }

    return (
        <GlobalThemeProvider theme="light">
            <div style={{ minHeight: '100vh', backgroundColor: 'var(--arc-colors-surface-page)' }}>
                <Header onLogout={authState === 'authenticated' ? handleLogout : undefined} />
                <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px 16px' }}>
                    {authState === 'loading' && (
                        <Text color="secondary">Loading...</Text>
                    )}
                    {authState === 'unauthenticated' && (
                        <LoginForm onLogin={() => setAuthState('authenticated')} />
                    )}
                    {authState === 'authenticated' && (
                        <>
                            <Text variant="caption" color="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                                Extract RMS report data into Blacksmith-compatible JSON files for training tenant population
                            </Text>
                            <ExtractionForm />
                        </>
                    )}
                </div>
            </div>
        </GlobalThemeProvider>
    );
}
