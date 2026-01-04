import React, { useEffect, useState } from 'react';
import { TripItinerary } from '../types';

interface SavedTrip extends TripItinerary {
    savedAt: string;
}

interface Props {
    onSelect: (trip: TripItinerary) => void;
    userEmail?: string | null;
}

const RecentTrips: React.FC<Props> = ({ onSelect, userEmail }) => {
    const [trips, setTrips] = useState<SavedTrip[]>([]);

    useEffect(() => {
        if (!userEmail) {
            setTrips([]);
            return;
        }

        const loadHistory = () => {
            try {
                const key = `recent_trips_${userEmail}`;
                const history = JSON.parse(localStorage.getItem(key) || '[]');
                setTrips(history);
            } catch (err) {
                console.error("Failed to load history", err);
            }
        };

        // Load initially
        loadHistory();

        // Optional: could listen to storage events if multiple tabs update it,
        // but for now simple mount is enough.
    }, [userEmail]);

    if (trips.length === 0) return null;

    return (
        <div className="w-full max-w-4xl mx-auto mb-8 animate-fade-in">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Recent Trips</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {trips.map((trip, idx) => (
                    <div
                        key={idx}
                        onClick={() => onSelect(trip)}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition">
                            <span className="text-4xl">✈️</span>
                        </div>

                        <h4 className="font-bold text-slate-800 dark:text-slate-200 truncate pr-4">{trip.destination}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>From: {trip.origin || 'Unknown'}</span>
                        </div>
                        <div className="mt-3 text-[10px] text-slate-400 font-mono">
                            {new Date(trip.savedAt || Date.now()).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentTrips;
