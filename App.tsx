import React, { useState, useEffect } from 'react';
import Hero3D from './components/Hero3D';
import TravelForm from './components/TravelForm';
import ItineraryDisplay from './components/ItineraryDisplay';
import { TripFormData, TripItinerary, LoadingState } from './types';
import { generateItinerary } from './services/geminiService';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [apiKey, setApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(true);
  
  const [formData, setFormData] = useState<TripFormData>({
    destination: '',
    startDate: '',
    endDate: '',
    budget: 2000,
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

    const savedKey = localStorage.getItem('gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setShowKeyInput(false);
    }

    const savedTrip = localStorage.getItem('last_trip');
    if (savedTrip) {
      try {
        setItinerary(JSON.parse(savedTrip));
        setLoadingState(LoadingState.SUCCESS);
      } catch (e) {
        console.error("Failed to parse saved trip");
      }
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handleSaveKey = () => {
    if (apiKey.trim()) {
        localStorage.setItem('gemini_api_key', apiKey);
        setShowKeyInput(false);
    }
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

    // Scroll to form to show loading
    window.scrollTo({ top: window.innerHeight * 0.4, behavior: 'smooth' });

    try {
      const result = await generateItinerary(formData, apiKey);
      setItinerary(result);
      setLoadingState(LoadingState.SUCCESS);
      localStorage.setItem('last_trip', JSON.stringify(result));
    } catch (err: any) {
      setError(err.message || "Something went wrong generating your trip.");
      setLoadingState(LoadingState.ERROR);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Navigation / Top Bar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          <span className="font-bold text-white tracking-wider">WANDERLUST.AI</span>
        </div>
        
        <div className="pointer-events-auto flex gap-3">
            {!showKeyInput && (
                <button 
                onClick={() => setShowKeyInput(true)}
                className="p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition"
                title="Update API Key"
                >
                🔑
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

      {/* API Key Modal/Overlay */}
      {showKeyInput && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 transform scale-100 animate-blob">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Enter Gemini API Key</h3>
            <p className="text-sm text-slate-500 mb-4">
              To generate trips, this app requires a free Google Gemini API Key. 
              Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 underline">aistudio.google.com</a>.
            </p>
            <input 
              type="password" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste AIzSy..."
              className="w-full p-3 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white mb-4"
            />
            <div className="flex justify-end gap-2">
                {/* Allow closing if key exists in storage (cancel edit) */}
               {localStorage.getItem('gemini_api_key') && (
                   <button onClick={() => setShowKeyInput(false)} className="px-4 py-2 text-slate-500 hover:text-slate-700">Cancel</button>
               )}
               <button 
                onClick={handleSaveKey}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero3D />

      {/* Main Content Area */}
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
          />
        )}
        
        {/* Empty State / Prompt */}
        {!itinerary && loadingState !== LoadingState.LOADING && !error && (
            <div className="text-center mt-20 opacity-40">
                <p className="text-slate-500 dark:text-slate-400 text-lg">👇 Fill out the form above to start your journey</p>
            </div>
        )}
      </main>

    </div>
  );
};

export default App;