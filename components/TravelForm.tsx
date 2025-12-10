import React from 'react';
import { TripFormData } from '../types';

interface Props {
  formData: TripFormData;
  setFormData: React.Dispatch<React.SetStateAction<TripFormData>>;
  onSubmit: () => void;
  loading: boolean;
}

const TravelForm: React.FC<Props> = ({ formData, setFormData, onSubmit, loading }) => {
  
  const handleChange = (field: keyof TripFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    const current = formData.interests;
    const updated = current.includes(interest) 
      ? current.filter(i => i !== interest)
      : [...current, interest];
    handleChange('interests', updated);
  };

  const interestsList = ['Adventure', 'Culture', 'Food', 'Relaxation', 'Nightlife', 'Family-friendly', 'History', 'Nature'];

  return (
    <div className="max-w-4xl mx-auto -mt-20 relative z-20 px-4">
      <div className="glass rounded-2xl p-6 md:p-10 shadow-2xl dark:shadow-blue-900/20">
        <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Plan Your Next Adventure
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Destination */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Destination</label>
            <div className="relative">
              <span className="absolute left-4 top-3.5 text-slate-400">📍</span>
              <input 
                type="text" 
                value={formData.destination}
                onChange={(e) => handleChange('destination', e.target.value)}
                placeholder="e.g., Kyoto, Japan or Paris, France"
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Dates */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Start Date</label>
            <input 
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">End Date</label>
            <input 
              type="date"
              value={formData.endDate}
              onChange={(e) => handleChange('endDate', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Travelers & Budget */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Travelers: {formData.travelers}</label>
            <input 
              type="range"
              min="1" max="10"
              value={formData.travelers}
              onChange={(e) => handleChange('travelers', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-blue-500"
            />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Budget: <span className="text-blue-600 dark:text-blue-400 font-bold">₹{formData.budget}</span>
            </label>
            <input 
              type="range"
              min="500" max="10000" step="100"
              value={formData.budget}
              onChange={(e) => handleChange('budget', parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-purple-500"
            />
          </div>

          {/* Interests */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-300">Interests</label>
            <div className="flex flex-wrap gap-3">
              {interestsList.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all transform hover:scale-105 ${
                    formData.interests.includes(interest)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-semibold mb-2 text-slate-700 dark:text-slate-300">Dietary Restrictions</label>
            <select
              value={formData.dietary}
              onChange={(e) => handleChange('dietary', e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="None">None</option>
              <option value="Vegetarian">Vegetarian</option>
              <option value="Vegan">Vegan</option>
              <option value="Gluten-free">Gluten-free</option>
              <option value="Halal">Halal</option>
              <option value="Kosher">Kosher</option>
            </select>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={loading}
          className={`w-full mt-8 py-4 rounded-xl text-lg font-bold text-white shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 ${
            loading 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-blue-500/40'
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generative AI Thinking...
            </span>
          ) : 'Generate Dream Trip ✨'}
        </button>
      </div>
    </div>
  );
};

export default TravelForm;