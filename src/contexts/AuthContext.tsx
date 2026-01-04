import React, { createContext, useContext, useEffect, useState } from 'react';
import { setAuthToken, login as apiLogin, signup as apiSignup } from '../../services/apiService';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initAuth = () => {
            console.log('[AUTH CONTEXT] Initializing authentication...');
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if (token && savedUser) {
                try {
                    setAuthToken(token);
                    const parsedUser = JSON.parse(savedUser);
                    setUser(parsedUser);
                    console.log('[AUTH CONTEXT] Restored session for:', parsedUser.email);
                } catch (e) {
                    console.error('[AUTH CONTEXT] Failed to parse saved user:', e);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            } else {
                console.log('[AUTH CONTEXT] No saved session found.');
            }
            setLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        console.log(`[AUTH CONTEXT] Attempting login for: ${email}`);
        try {
            const data = await apiLogin(email, password);
            console.log('[AUTH CONTEXT] Login API response:', data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthToken(data.token);
                setUser(data.user);
                console.log('[AUTH CONTEXT] User state updated successfully.');
            } else {
                const msg = data.message || 'Login failed';
                setError(msg);
                throw new Error(msg);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Login failed';
            console.error('[AUTH CONTEXT] Login error:', msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        console.log(`[AUTH CONTEXT] Attempting signup for: ${email}`);
        try {
            const data = await apiSignup(name, email, password);
            console.log('[AUTH CONTEXT] Signup API response:', data);

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                setAuthToken(data.token);
                setUser(data.user);
                console.log('[AUTH CONTEXT] User created and logged in.');
            } else {
                const msg = data.message || 'Signup failed';
                setError(msg);
                throw new Error(msg);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.message || 'Signup failed';
            console.error('[AUTH CONTEXT] Signup error:', msg);
            setError(msg);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        console.log('[AUTH CONTEXT] Logging out...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setAuthToken(null);
        setUser(null);
    };

    const clearError = () => setError(null);

    return (
        <AuthContext.Provider value={{ user, loading, error, login, signup, logout, clearError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
