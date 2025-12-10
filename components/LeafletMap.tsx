import React, { useEffect, useRef, useState } from 'react';
import { TripItinerary, DayPlan, Activity } from '../types';

// Declare Leaflet global (loaded via CDN in index.html)
declare global {
  interface Window {
    L: any;
  }
}

interface Props {
  itinerary: TripItinerary;
  activeDay: number;
  highlightedActivity?: Activity | null; // Passed from parent when user clicks list item
  onMarkerClick: (activity: Activity) => void;
}

const LeafletMap: React.FC<Props> = ({ itinerary, activeDay, highlightedActivity, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    if (!window.L) {
      console.error("Leaflet not loaded");
      return;
    }

    // Default center (will be updated by data)
    const map = window.L.map(mapContainerRef.current).setView([0, 0], 2);

    // Dark Matter Tiles (matches theme)
    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when active day or itinerary changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !itinerary) return;

    // Clear existing layers
    markersRef.current.forEach(m => map.removeLayer(m));
    markersRef.current = [];
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const currentDay: DayPlan = itinerary.days[activeDay];
    const points: any[] = [];
    const newMarkers: any[] = [];

    // Helper to add marker
    const addMarker = (lat: number, lng: number, title: string, type: 'HOTEL' | 'ACTIVITY', data: any) => {
      if (!lat || !lng) return;

      const color = type === 'HOTEL' ? '#8b5cf6' : '#0ea5e9'; // Violet for Hotel, Blue for Activity
      
      // Simple custom icon using HTML
      const icon = window.L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = window.L.marker([lat, lng], { icon, draggable: true })
        .addTo(map)
        .bindPopup(`<b>${title}</b><br>${type === 'HOTEL' ? 'Accommodation' : 'Activity'}`);

      // Handle Click
      marker.on('click', () => {
         if (type === 'ACTIVITY') onMarkerClick(data);
      });

      // Handle Drag
      marker.on('dragend', (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        console.log(`New position for ${title}:`, position);
        // In a real app with persistent backend, we would dispatch an update here.
        // For local state, we'd need a deep setItinerary prop which is complex for this scope.
        // For now, we update the popup.
        marker.setPopupContent(`<b>${title}</b><br>Moved to: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`).openPopup();
      });

      newMarkers.push(marker);
      points.push([lat, lng]);
    };

    // Plot Hotel
    if (currentDay.hotelSuggestion?.coordinates) {
      addMarker(
        currentDay.hotelSuggestion.coordinates.lat,
        currentDay.hotelSuggestion.coordinates.lng,
        currentDay.hotelSuggestion.name,
        'HOTEL',
        currentDay.hotelSuggestion
      );
    }

    // Plot Activities
    currentDay.activities.forEach(activity => {
      if (activity.coordinates) {
        addMarker(
          activity.coordinates.lat,
          activity.coordinates.lng,
          activity.title,
          'ACTIVITY',
          activity
        );
      }
    });

    markersRef.current = newMarkers;

    // Connect with polyline
    if (points.length > 1) {
      polylineRef.current = window.L.polyline(points, { color: '#64748b', dashArray: '10, 10', weight: 3 }).addTo(map);
      map.fitBounds(window.L.polyline(points).getBounds(), { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 13);
    }

  }, [itinerary, activeDay, onMarkerClick]);

  // Handle Highlight from List Click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !highlightedActivity?.coordinates) return;

    const { lat, lng } = highlightedActivity.coordinates;
    map.flyTo([lat, lng], 16, { duration: 1.5 });

    // Open popup of corresponding marker
    const marker = markersRef.current.find(m => {
        const mLoc = m.getLatLng();
        // Rough comparison
        return Math.abs(mLoc.lat - lat) < 0.0001 && Math.abs(mLoc.lng - lng) < 0.0001;
    });

    if (marker) marker.openPopup();

  }, [highlightedActivity]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);

    try {
      // Use Nominatim OpenStreetMap Geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const latNum = parseFloat(lat);
        const lonNum = parseFloat(lon);

        const map = mapInstanceRef.current;
        if (map) {
          map.flyTo([latNum, lonNum], 13);
          
          // Add a temporary search marker
          const icon = window.L.divIcon({
            className: 'search-pin',
            html: `<div style="background-color: #f43f5e; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [24, 24]
          });

          window.L.marker([latNum, lonNum], { icon })
            .addTo(map)
            .bindPopup(`<b>Search Result</b><br>${display_name}`)
            .openPopup();
        }
      } else {
        setSearchError("Location not found.");
      }
    } catch (err) {
      setSearchError("Error searching location.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative h-96 w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 group">
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />
      
      {/* Search Overlay */}
      <div className="absolute top-4 left-4 z-[400] w-64">
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places..."
            className="w-full pl-4 pr-10 py-2 rounded-lg bg-white/90 dark:bg-slate-800/90 backdrop-blur border border-slate-300 dark:border-slate-600 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 text-slate-500 hover:text-blue-500"
          >
            {isSearching ? '...' : '🔍'}
          </button>
        </form>
        {searchError && (
          <div className="mt-2 text-xs text-white bg-red-500 p-2 rounded shadow-lg animate-fade-in">
            {searchError}
          </div>
        )}
      </div>

      {/* Legend / Info */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/90 dark:bg-slate-900/90 p-2 rounded-lg text-xs shadow-lg backdrop-blur flex flex-col gap-1 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-violet-500 border border-white"></span> Hotel
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-sky-500 border border-white"></span> Activity
        </div>
        <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-white"></span> Search Result
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
           Drag markers to adjust
        </div>
      </div>
    </div>
  );
};

export default LeafletMap;