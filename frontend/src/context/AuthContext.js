/**
 * Fast Shopping - Auth Context
 * Separate file to avoid circular imports with App.jsx
 */
import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
