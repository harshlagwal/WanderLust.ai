import React, { useEffect, useState } from 'react';
import { geocodeLocation } from '../services/geocodingService';

interface WeatherData {
    temp: number;
    condition: string;
    isDay: boolean;
}

interface Props {
    destination: string;
}

const WeatherWidget: React.FC<Props> = ({ destination }) => {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [season, setSeason] = useState('');

    useEffect(() => {
        // 1. Determine Season based on month (Simple Northern Hemisphere logic for demo)
        const month = new Date().getMonth();
        if (month >= 2 && month <= 5) setSeason('Spring/Summer');
        else if (month >= 6 && month <= 8) setSeason('Monsoon/Summer');
        else if (month >= 9 && month <= 10) setSeason('Autumn');
        else setSeason('Winter');

        const fetchWeather = async () => {
            try {
                setLoading(true);
                // Get coords
                const [lat, lng] = await geocodeLocation(destination);

                // Free Open-Meteo API (No key required)
                const response = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true`
                );
                const data = await response.json();

                if (data.current_weather) {
                    setWeather({
                        temp: data.current_weather.temperature,
                        condition: interpretWeatherCode(data.current_weather.weathercode),
                        isDay: data.current_weather.is_day === 1
                    });
                }
            } catch (err) {
                console.error("Weather fetch failed:", err);
                // Fallback or leave null to just show season
            } finally {
                setLoading(false);
            }
        };

        if (destination) fetchWeather();
    }, [destination]);

    // WMO Weather interpretation codes (simplified)
    const interpretWeatherCode = (code: number): string => {
        if (code === 0) return 'Clear Sky';
        if (code >= 1 && code <= 3) return 'Partly Cloudy';
        if (code >= 45 && code <= 48) return 'Foggy';
        if (code >= 51 && code <= 67) return 'Rainy';
        if (code >= 71 && code <= 77) return 'Snowy';
        if (code >= 95) return 'Thunderstorm';
        return 'Sunny';
    };

    return (
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-xl p-4 border border-blue-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-6 animate-fade-in">
            <div className="flex items-center gap-4">
                <div className="text-4xl">
                    {loading ? '⏳' : (weather?.condition.includes('Rain') ? '🌧️' : weather?.condition.includes('Snow') ? '❄️' : weather?.condition.includes('Cloud') ? '⛅' : '☀️')}
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-200">{loading ? 'Loading...' : `${weather?.temp}°C`}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{loading ? 'Checking forecast' : weather?.condition}</p>
                </div>
            </div>

            <div className="text-right border-l pl-6 border-slate-200 dark:border-slate-700">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">Best Season</span>
                <p className="font-bold text-blue-600 dark:text-blue-400">{season}</p>
            </div>
        </div>
    );
};

export default WeatherWidget;
