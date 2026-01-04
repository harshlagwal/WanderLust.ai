import React, { useState } from 'react';
import { useAuth } from '../src/contexts/AuthContext';

interface LoginProps {
    onSwitch: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitch }) => {
    const { login, error: authError, clearError } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState('');
    const [loading, setLoading] = useState(false);

    // Clear global error when switching to this view or on mount
    React.useEffect(() => {
        clearError();
    }, []);


    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setLocalError('');
        clearError();

        try {
            console.log('[LOGIN COMPONENT] Submitting login form...');
            await login(email, password);
            console.log('[LOGIN COMPONENT] Login successful, forcing redirect...');
            window.location.href = '/';
        } catch (err: any) {
            console.error('[LOGIN COMPONENT] Login submission error:', err);
            // Error is already set in AuthContext, but we can set a local fallback if needed
            if (!authError) {
                setLocalError(err.response?.data?.message || err.message || 'Failed to login');
            }
        } finally {
            setLoading(false);
        }
    };

    const activeError = localError || authError;

    return (
        <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-2xl w-full max-w-md animate-fade-in text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">Welcome Back</h2>

            {activeError && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex flex-col gap-1">
                    <span className="font-bold underline">Authentication Error:</span>
                    <span>{activeError}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-white/70 text-sm mb-1">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-white/70 text-sm mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        placeholder="••••••••"
                        required
                    />
                </div>
                <button
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition duration-300 shadow-lg shadow-blue-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Logging in...
                        </>
                    ) : 'Login'}
                </button>
            </form>

            <p className="text-white/60 text-center mt-8 text-sm">
                Don't have an account? <button onClick={onSwitch} className="text-blue-400 hover:underline">Sign up</button>
            </p>
        </div>
    );
};

export default Login;
