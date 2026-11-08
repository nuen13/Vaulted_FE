// -- file: src/auth/sign-in-gate.jsx
// Shows the app only to signed-in friends; everyone else gets the "Sign in with Google" screen.
// Who may sign in is decided by the API (the invite list in its appsettings).
import React, { useEffect, useRef, useState } from 'react';

import { getSession, onSessionChange, refreshSession, signInWithGoogle, signOut } from './auth.js';
import { AuthContext } from './auth-context.js';

import './sign-in.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GSI_SRC = 'https://accounts.google.com/gsi/client';

let gsiPromise = null;
const loadGoogleScript = () => {
    gsiPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = GSI_SRC;
        script.async = true;
        script.onload = () => resolve(window.google);
        script.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google sign-in. Check your connection.')); };
        document.head.appendChild(script);
    });
    return gsiPromise;
};

const SignInScreen = () => {
    const buttonRef = useRef(null);
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            setError('Sign-in isn\'t set up: add VITE_GOOGLE_CLIENT_ID to the frontend .env.');
            return;
        }
        let cancelled = false;
        loadGoogleScript()
            .then((google) => {
                if (cancelled || !buttonRef.current) return;
                google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: async ({ credential }) => {
                        setBusy(true);
                        setError('');
                        try {
                            await signInWithGoogle(credential);
                        } catch (err) {
                            setError(err.message);
                        } finally {
                            setBusy(false);
                        }
                    },
                });
                google.accounts.id.renderButton(buttonRef.current, {
                    theme: 'outline', size: 'large', shape: 'pill', text: 'signin_with',
                });
            })
            .catch((err) => !cancelled && setError(err.message));
        return () => { cancelled = true; };
    }, []);

    return (
        <main className="sign-in">
            <div className="sign-in-card">
                <h1>Media: Vaulted</h1>
                <p className="sign-in-lede">A shared vault for friends. Sign in to add things and leave reviews.</p>
                <div ref={buttonRef} className="sign-in-button" aria-busy={busy}></div>
                {busy && <p className="sign-in-note">Signing in…</p>}
                {error && <p className="sign-in-error" role="alert">{error}</p>}
            </div>
        </main>
    );
};

const SignInGate = ({ children }) => {
    const [session, setSession] = useState(getSession);

    useEffect(() => {
        const stop = onSessionChange(setSession);
        refreshSession();
        return stop;
    }, []);

    if (!session) return <SignInScreen />;

    const handleSignOut = () => {
        window.google?.accounts.id.disableAutoSelect();
        signOut();
    };

    return (
        <AuthContext.Provider value={{ user: session.user, signOut: handleSignOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export default SignInGate;
