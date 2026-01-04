import React, { useState, useEffect } from 'react';
import Hero3D from './components/Hero3D';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import RecentTrips from './components/RecentTrips';
import { TripFormData, TripItinerary, LoadingState } from './types';
import { generateItinerary } from './services/geminiService';
import { saveSearch } from './services/apiService';
import Login from './components/Login';
import Signup from './components/Signup';
import AuthGuard from './components/AuthGuard';
import { useAuth } from './src/contexts/AuthContext';

const App: React.FC = () => {
  const { user, loading: authLoading, logout: handleLogout } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');

  const [formData, setFormData] = useState<TripFormData>({
    currentLocation: '',
    destination: '',
    startDate: '',
    endDate: '',
    budget: 50000,
    travelers: 2,
    interests: [],
    dietary: 'None'
  });

  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);
  const [itinerary, setItinerary] = useState<TripItinerary | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load saved theme and trip
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }

    if (user?.email) {
      const savedKey = localStorage.getItem(`gemini_api_key_${user.email}`);
      if (savedKey) {
        setApiKey(savedKey);
        setShowKeyInput(false);
      } else {
        setApiKey('');
        setShowKeyInput(true);
      }

      const savedTrip = localStorage.getItem(`last_trip_${user.email}`);
      if (savedTrip) {
        try {
          const parsed = JSON.parse(savedTrip) as TripItinerary;
          setItinerary(parsed);
          setLoadingState(LoadingState.SUCCESS);

          if (parsed.origin) {
            setFormData(prev => ({
              ...prev,
              currentLocation: parsed.origin || prev.currentLocation,
              destination: parsed.destination || prev.destination,
              budget: parsed.originalBudget || prev.budget
            }));
          }
        } catch (e) {
          console.error("Failed to parse saved trip");
        }
      } else {
        // Reset itinerary if no saved trip for this user
        setItinerary(null);
        setLoadingState(LoadingState.IDLE);
      }
    } else {
      // Clear sensitive state on logout
      setApiKey('');
      setItinerary(null);
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleSaveKey = () => {
    if (apiKey.trim() && user?.email) {
      localStorage.setItem(`gemini_api_key_${user.email}`, apiKey);
      setShowKeyInput(false);
    }
  };

  const addToHistory = (trip: TripItinerary) => {
    if (!user?.email) return;

    try {
      const key = `recent_trips_${user.email}`;
      const historyStr = localStorage.getItem(key);
      const history: any[] = historyStr ? JSON.parse(historyStr) : [];

      const newTrip = { ...trip, savedAt: new Date().toISOString() };

      // Combine new trip, remove duplicates (by destination), keep max 3
      const updated = [newTrip, ...history.filter((t: any) => t.destination !== trip.destination)].slice(0, 3);

      localStorage.setItem(key, JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to save history:", err);
    }
  };

  const handleLoadRecent = (trip: TripItinerary) => {
    setItinerary(trip);
    setLoadingState(LoadingState.SUCCESS);
    window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });

    // Also update form data
    setFormData(prev => ({
      ...prev,
      destination: trip.destination,
      currentLocation: trip.origin || prev.currentLocation
    }));
  };

  const handleGenerate = async () => {
    if (!apiKey) {
      setError("Please enter a Gemini API Key first.");
      setShowKeyInput(true);
      return;
    }
    if (!formData.destination || !formData.startDate || !formData.endDate) {
      setError("Please fill in destination and dates.");
      return;
    }

    setLoadingState(LoadingState.LOADING);
    setError(null);
    setItinerary(null);

    if (user) {
      saveSearch(user.email!, `Trip to ${formData.destination} for ${formData.travelers} travelers`).catch(console.error);
    }

    window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });

    try {
      const result = await generateItinerary(formData, apiKey);

      // Add origin to result for history context
      const outcome = { ...result, origin: formData.currentLocation };

      setItinerary(outcome);
      setLoadingState(LoadingState.SUCCESS);

      if (user?.email) {
        localStorage.setItem(`last_trip_${user.email}`, JSON.stringify(outcome));
      }

      // Save to recent history
      addToHistory(outcome);

    } catch (err: any) {
      console.error("[GENERATE ERROR]:", err);
      setError(err.message || "Something went wrong generating your trip.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 flex items-center gap-4">
          <span className="font-bold text-white tracking-wider">WANDERLUST.AI</span>
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-3">
              <span className="text-white text-sm hidden sm:inline">Hi, {(user.name || user.email || '').split(' ')[0]}</span>

              <button
                onClick={handleLogout}
                className="p-2 rounded-full bg-red-500/10 backdrop-blur-md border border-red-500/20 text-red-500 hover:bg-red-500/20 transition"
                title="Logout"
              >
                🚪
              </button>
            </div>
          )}
          {user && (
            <button
              onClick={() => setShowKeyInput(true)}
              className="px-3 py-2 rounded-full bg-blue-600/20 backdrop-blur-md border border-blue-400/30 text-white hover:bg-blue-600/40 transition flex items-center gap-2"
              title="Update API Key"
            >
              <span>🔑</span>
              <span className="text-xs font-bold hidden sm:inline">API Key</span>
            </button>
          )}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
            title="Toggle Theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </nav>

      {/* API Key Modal */}
      {showKeyInput && user && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 relative">
            <button
              onClick={() => setShowKeyInput(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold mb-2 dark:text-white flex items-center gap-2">
              <span>🗝️</span> Enter Gemini API Key
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              To use Wanderlust AI, you need a free API key from Google.
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline ml-1">Get one here →</a>
            </p>

            <div className="flex gap-2">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here..."
                className="flex-1 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
              />
              <button
                onClick={handleSaveKey}
                disabled={!apiKey.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-3 text-center">
              Your key is stored locally in your browser for safety.
            </p>
          </div>
        </div>
      )}

      <AuthGuard
        user={user}
        loading={authLoading}
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]"></div>

            {authView === 'login' ? (
              <Login onSwitch={() => setAuthView('signup')} />
            ) : (
              <Signup onSwitch={() => setAuthView('login')} />
            )}
          </div>
        }
      >
        <Hero3D />

        <main className="pb-20">
          <TravelForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleGenerate}
            loading={loadingState === LoadingState.LOADING}
          />

          {error && (
            <div className="max-w-4xl mx-auto mt-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-200 text-center animate-bounce">
              {error}
            </div>
          )}

          {itinerary && loadingState === LoadingState.SUCCESS && (
            <ItineraryDisplay
              itinerary={itinerary}
              onRegenerate={handleGenerate}
              user={user}
              currentLocation={formData.currentLocation}
            />
          )}

          {!itinerary && loadingState !== LoadingState.LOADING && (
            <div className="mt-20">
              <RecentTrips onSelect={handleLoadRecent} userEmail={user?.email} />

              {!error && (
                <div className="text-center opacity-40 mt-10">
                  <p className="text-slate-500 dark:text-slate-400 text-lg">👇 Fill out the form above to start your journey</p>
                </div>
              )}
            </div>
          )}
        </main>
      </AuthGuard>

      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center mt-auto">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Developed by Harsh Lagwal</p>
        <div className="flex justify-center gap-4">
          <a href="mailto:harshlagwal123@gmail.com" className="text-xl grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" title="Email Me">📧</a>
          <a href="https://www.linkedin.com/in/harshlagwal" target="_blank" rel="noreferrer" className="text-xl grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100" title="LinkedIn">🔗</a>
        </div>
      </footer>
    </div>
  );
};

export default App;