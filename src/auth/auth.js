// -- file: src/auth/auth.js
// Who is signed in, and the API token that proves it.
//
// Signing in: Google's button gives us an ID token, the API checks it (and the invite list)
// and answers with its own token. That token is kept in localStorage and added as
// "Authorization: Bearer ..." to every request to the API, so the slices can keep calling
// fetch() as they always have. A 401 from the API means the token is no longer good: we
// forget it and the sign-in screen comes back.

const API = import.meta.env.VITE_API_BASE_URL;
const STORAGE_KEY = 'vaulted.session';

const readStored = () => {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        if (saved?.token && new Date(saved.expiresAt) > new Date()) return saved;
    } catch { /* storage blocked or corrupt: just sign in again */ }
    return null;
};

let session = readStored(); // { token, expiresAt, user: { id, email, displayName, pictureUrl, isAdmin } }
const listeners = new Set();

const setSession = (next) => {
    session = next;
    try {
        if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        else localStorage.removeItem(STORAGE_KEY);
    } catch { /* still works for this tab */ }
    listeners.forEach((fn) => fn(session));
};

export const getSession = () => session;
export const onSessionChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const signOut = () => setSession(null);


// -- Send the token with every API request -- //
const nativeFetch = window.fetch.bind(window);

const isApiUrl = (input) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input?.url;
    return Boolean(API && url && url.startsWith(API));
};

window.fetch = async (input, init = {}) => {
    if (!session || !isApiUrl(input)) return nativeFetch(input, init);

    const headers = new Headers(init.headers ?? (input instanceof Request ? input.headers : undefined));
    headers.set('Authorization', `Bearer ${session.token}`);
    const response = await nativeFetch(input, { ...init, headers });

    if (response.status === 401) setSession(null);
    return response;
};


// -- Sign in / check the saved session -- //

// credential: the ID token from Google's sign-in button
export const signInWithGoogle = async (credential) => {
    const response = await nativeFetch(`${API}/Auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
    });
    if (!response.ok) throw new Error((await response.text()) || 'Sign-in failed. Try again.');
    setSession(await response.json());
};

// On load: make sure the saved token still works (and pick up a changed name/picture)
export const refreshSession = async () => {
    if (!session) return;
    try {
        const response = await fetch(`${API}/Auth/me`); // a 401 here signs out (see above)
        if (response.ok) setSession({ ...session, user: await response.json() });
    } catch { /* offline: keep the saved session */ }
};


// -- Ownership: who may change what (the API enforces the same rules) -- //

// Items and reviews from before sign-in existed have no owner, so anyone may change them.
export const isMine = (ownerId) => !ownerId || ownerId === session?.user?.id;

// Admins (the API's Auth:AdminEmails) may archive and delete anyone's items and entries.
export const isAdmin = () => Boolean(session?.user?.isAdmin);

// Archive / unarchive / delete: the owner or an admin. Editing stays owner-only.
export const canManage = (ownerId) => isMine(ownerId) || isAdmin();
