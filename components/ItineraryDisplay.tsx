import React, { useState } from 'react';
import { TripItinerary, DayPlan } from '../types';
import MapView, { Waypoint } from './MapView';
import { geocodeLocation } from '../services/geocodingService';
import WeatherWidget from './WeatherWidget';
import TripTools from './TripTools';
import SavedTripSummary from './SavedTripSummary';

interface Props {
  itinerary: TripItinerary;
  onRegenerate: () => void;
  user: any;
  currentLocation?: string;
}

const ItineraryDisplay: React.FC<Props> = ({ itinerary, onRegenerate, user, currentLocation }) => {
  const [activeDay, setActiveDay] = useState<number>(0);
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);

  // Initialize map with current location and first destination
  React.useEffect(() => {
    const initMap = async () => {
      // Clear old waypoints when changing itinerary
      setWaypoints([]);
      try {
        const points: Waypoint[] = [];
        if (currentLocation) {
          const startCoords = await geocodeLocation(currentLocation);
          points.push({ lat: startCoords[0], lng: startCoords[1], label: `Start: ${currentLocation}` });
        }
        const destCoords = await geocodeLocation(itinerary.destination);
        points.push({ lat: destCoords[0], lng: destCoords[1], label: `Destination: ${itinerary.destination}` });
        setWaypoints(points);
        console.log(`[MAP] Initialized ${points.length} waypoints for ${itinerary.destination}`);
      } catch (err) {
        console.error("Initial geocoding failed:", err);
      }
    };
    initMap();
  }, [itinerary.destination, currentLocation]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `Check out my trip to ${itinerary.destination}! Created with Wanderlust AI.`;
    if (navigator.share) {
      navigator.share({ title: itinerary.tripTitle, text: text }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text);
      alert('Link copied to clipboard!');
    }
  };

  // Removed interactive map click handlers to simplify UI/UX per user request.
  const handleLocationClick = (locationName: string) => {
    // console.log("Map interaction disabled for:", locationName);
  };

  const clearWaypoints = () => {
    // No-op based on simplified reqs
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-float-up">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <h2 className="text-3xl font-bold dark:text-white">Your Itinerary</h2>
        <div className="flex gap-3">
          <button onClick={clearWaypoints} className="hidden px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition font-medium items-center gap-2">
            <span>🗑️</span> Clear Route
          </button>
          <button onClick={handleShare} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium flex items-center gap-2">
            <span>🔗</span> Share
          </button>
          <button onClick={handlePrint} className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium flex items-center gap-2">
            <span>📄</span> PDF / Print
          </button>
          <button onClick={onRegenerate} className="px-4 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition font-medium flex items-center gap-2">
            <span>🔄</span> Regenerate
          </button>
        </div>
      </div>

      {/* Trip Overview Card */}
      <div className="glass rounded-2xl p-8 mb-8 border-l-4 border-blue-500 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M2.002 9.63c-.023.411.207.794.581.966l7.504 3.442 3.442 7.504c.172.374.555.604.966.581.412-.023.765-.289.893-.672l4.606-13.818c.172-.515-.269-.956-.784-.784l-13.818 4.606c-.383.128-.649.48-.672.893zm3.961 1.096l9.648-3.216-3.216 9.648-2.618-5.708-3.814-1.748z" /></svg>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
          <div className="flex-1">
            <h1 className="text-4xl font-extrabold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-default">
              {itinerary.tripTitle}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 font-mono">
              <span className="flex items-center gap-1">📍 {itinerary.destination}</span>
              <span className="flex items-center gap-1">💰 {itinerary.totalCostEstimate}</span>
              <span className="flex items-center gap-1">⛅ {itinerary.weatherForecast}</span>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <WeatherWidget destination={itinerary.destination} />
          </div>
        </div>

        <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed max-w-4xl mt-4">
          {itinerary.summary}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Days Navigation & Tools */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
            <span>📅</span> Schedule
          </h3>
          <div className="space-y-3">
            {itinerary.days.map((day, index) => (
              <button
                key={day.day}
                onClick={() => {
                  setActiveDay(index);
                }}
                className={`w-full text-left p-4 rounded-xl transition-all border ${activeDay === index
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                  }`}
              >
                <div className="font-bold text-lg">Day {day.day}</div>
                <div className={`text-sm ${activeDay === index ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                  {day.theme}
                </div>
              </button>
            ))}
          </div>

          {/* Interactive Trip Tools (Notes & Packing) */}
          <div className="mt-8">
            <TripTools
              destination={itinerary.destination}
              initialPackingList={itinerary.packingList}
              userEmail={user?.email}
            />
          </div>
        </div>



        {/* Right Column: Day Details */}
        <div className="lg:col-span-2">
          <SavedTripSummary destination={itinerary.destination} userEmail={user?.email} />
          <DayDetail
            day={itinerary.days[activeDay]}
            destination={itinerary.destination}
            onLocationClick={handleLocationClick}
            waypoints={waypoints}
          />
        </div>
      </div>
    </div>
  );
};

interface DayDetailProps {
  day: DayPlan;
  destination: string;
  onLocationClick: (loc: string) => void;
  waypoints: Waypoint[];
}

const DayDetail: React.FC<DayDetailProps> = ({ day, destination, onLocationClick, waypoints }) => {
  return (
    <div className="space-y-6 animate-fade-in">

      {/* Map Section */}
      <div className="bg-slate-200 dark:bg-slate-700 h-96 rounded-2xl overflow-hidden relative shadow-2xl border-4 border-white dark:border-slate-800">
        <MapView waypoints={waypoints} />
      </div>

      {/* Hotel Card */}
      <div
        className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800/50 p-6 rounded-2xl border border-blue-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition group"
        onClick={() => onLocationClick(day.hotelSuggestion.name)}
      >
        <div className="flex justify-between items-start">
          <div>
            <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">Accomodation</h4>
            <h3 className="text-xl font-bold dark:text-white mb-2 group-hover:text-blue-500 transition">{day.hotelSuggestion.name}</h3>
          </div>
          <span className="text-xs font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition">Click to view on map 🗺️</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">{day.hotelSuggestion.description}</p>
        <span className="inline-block px-3 py-1 bg-white dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
          Price: {day.hotelSuggestion.priceRange}
        </span>
      </div>

      {/* Activities Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-bold mb-6 dark:text-white">Activities</h3>
        <div className="relative border-l-2 border-slate-200 dark:border-slate-700 ml-3 space-y-8 pl-8">
          {day.activities.map((activity, idx) => (
            <div
              key={idx}
              className="relative group cursor-pointer"
              onClick={() => onLocationClick(activity.location)}
            >
              <span className="absolute -left-[39px] top-1 h-5 w-5 rounded-full border-2 border-white dark:border-slate-800 bg-blue-500 group-hover:scale-125 transition-transform"></span>
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-1">
                <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">{activity.time}</span>
                <h4 className="font-bold text-lg dark:text-slate-100 group-hover:text-blue-500 transition">{activity.title}</h4>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{activity.description}</p>
              <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-500">
                <span className="flex items-center gap-1">📍 {activity.location}</span>
                <span className="flex items-center gap-1">⏱️ {activity.duration}</span>
                <span className="flex items-center gap-1">💵 {activity.costEstimate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Food */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-orange-50 dark:bg-slate-800/50 p-5 rounded-xl border border-orange-100 dark:border-slate-700">
          <span className="text-2xl mb-2 block">🍽️</span>
          <h4 className="font-bold text-orange-900 dark:text-orange-200 mb-1">Lunch</h4>
          <p className="text-sm text-orange-800 dark:text-slate-400">{day.meals.lunch}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-slate-800/50 p-5 rounded-xl border border-indigo-100 dark:border-slate-700">
          <span className="text-2xl mb-2 block">🍷</span>
          <h4 className="font-bold text-indigo-900 dark:text-indigo-200 mb-1">Dinner</h4>
          <p className="text-sm text-indigo-800 dark:text-slate-400">{day.meals.dinner}</p>
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;