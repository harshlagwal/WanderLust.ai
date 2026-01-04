// Cache for geocoding results
const geocodeCache: Record<string, [number, number]> = {};

export const clearGeocodeCache = () => {
    const count = Object.keys(geocodeCache).length;
    Object.keys(geocodeCache).forEach(key => delete geocodeCache[key]);
    console.log(`[GEO] Cleared ${count} cached locations`);
};

export const geocodeLocation = async (query: string): Promise<[number, number]> => {
    // 1. Check Cache
    if (geocodeCache[query]) {
        console.log(`[GEO] ✓ Cache hit for "${query}"`);
        return geocodeCache[query];
    }

    try {
        // 2. Prepare Query: Append "India" if not present to allow Nominatim to prioritize
        const searchQuery = query.toLowerCase().includes('india') ? query : `${query}, India`;

        // Fetch 5 results to allow for filtering/ranking
        // countrycodes=in restricts results to India only
        // accept-language=en forces English place names
        // addressdetails=1 provides full location context
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=in&accept-language=en&addressdetails=1`;

        console.log(`[GEO] 🔍 Searching for "${searchQuery}"`);

        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en-US,en;q=0.9',
                'User-Agent': 'WanderlustAIPlanner/1.2'
            }
        });
        const data = await response.json();

        if (data && data.length > 0) {
            // 3. Filter & Rank Results
            // We want to prioritize Cities/Towns/Tourist spots over Suburbs/Neighbourhoods
            const rankedResults = data.map((item: any) => {
                let score = 0;
                const type = item.type; // e.g., 'city', 'town', 'administrative', 'suburb'
                const placeCheck = item.class; // 'place', 'boundary', 'tourism'

                // Promotion logic
                if (placeCheck === 'tourism') score += 10;
                if (type === 'city') score += 8;
                if (type === 'town') score += 6;
                if (type === 'village') score += 4;
                if (type === 'administrative') score += 2; // States/Districts

                // Demotion logic
                if (type === 'suburb') score -= 5;       // e.g. Manali, Chennai
                if (type === 'neighbourhood') score -= 5;
                if (type === 'industrial') score -= 5;

                return { ...item, score };
            }).sort((a: any, b: any) => b.score - a.score); // Sort highest score first

            // 4. Select Best Valid Result
            for (const result of rankedResults) {
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                // Validate India Bounds (Approximate)
                // India: lat 6°N to 38°N, lng 68°E to 98°E
                if (lat >= 6 && lat <= 38 && lon >= 68 && lon <= 98) {
                    console.log(`[GEO] 📍 Selected: "${result.display_name}" (Score: ${result.score}, Type: ${result.type})`);
                    const coords: [number, number] = [lat, lon];
                    geocodeCache[query] = coords;
                    return coords;
                }
            }

            console.warn(`[GEO] ⚠️ No valid results within India bounds for "${query}"`);
        }

        // Fallback: Deterministic random within Central India
        console.warn(`[GEO] ⚠️ Geocoding failed for "${query}", using fallback.`);
        let hash = 0;
        for (let i = 0; i < query.length; i++) hash = query.charCodeAt(i) + ((hash << 5) - hash);
        const lat = 20 + (Math.abs(hash % 1000) / 100);
        const lng = 78 + (Math.abs(hash % 1000) / 100);
        const fallbackCoords: [number, number] = [lat, lng];
        geocodeCache[query] = fallbackCoords;
        return fallbackCoords;

    } catch (err) {
        console.error("[GEO] ❌ Fetch failed:", err);
        // Emergency fallback: New Delhi
        return [28.6139, 77.2090];
    }
};
