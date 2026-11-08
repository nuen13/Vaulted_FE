// -- file: src/auth/auth-context.js
import { createContext, useContext } from 'react';

import { signOut } from './auth.js';

export const AuthContext = createContext({ user: null, signOut });

// The signed-in user ({ id, email, displayName, pictureUrl }) and signOut, for any component
export const useAuth = () => useContext(AuthContext);
