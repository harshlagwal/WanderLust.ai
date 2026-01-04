import React, { useEffect, useState, useRef, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface Waypoint {
    lat: number;
    lng: number;
    label: string;
}

interface MapViewProps {
    waypoints: Waypoint[];
    activePoint?: Waypoint | null; // Explicit focus point
}

// Component to handle map center updates efficiently
const ChangeView = ({ center, zoom, waypoints, activePoint }: { center: [number, number], zoom: number, waypoints?: Waypoint[], activePoint?: Waypoint | null }) => {
    const map = useMap();
    const lastActive = useRef<string>("");

    useEffect(() => {
        // PRIORITY 1: Active selection takes precedence
        if (activePoint) {
            const activeKey = `${activePoint.lat},${activePoint.lng}`;
            console.log(`[MAP] 🎯 Focusing on active point: ${activePoint.label} [${activePoint.lat}, ${activePoint.lng}]`);

            map.flyTo([activePoint.lat, activePoint.lng], 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
            lastActive.current = activeKey;
            return;
        }

        // PRIORITY 2: Fit bounds for route (only if no active point)
        if (waypoints && waypoints.length > 1) {
            try {
                const bounds = L.latLngBounds(waypoints.map(wp => [wp.lat, wp.lng]));
                console.log(`[MAP] Fitting bounds for ${waypoints.length} waypoints`);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
            } catch (err) {
                console.error("[MAP] FitBounds error:", err);
            }
            return;
        }

        // PRIORITY 3: Initial center
        map.flyTo(center, zoom, {
            duration: 1.2
        });

    }, [center, zoom, map, waypoints, activePoint]);

    // MAP RESIZE FIX: Ensure map fills container correctly after mount
    useEffect(() => {
        const resizeMap = () => {
            console.log("[MAP] Triggering forced resize...");
            map.invalidateSize();
        };

        // Attempt multiple resize triggers to catch different loading states
        const t1 = setTimeout(resizeMap, 100);
        const t2 = setTimeout(resizeMap, 500);
        const t3 = setTimeout(resizeMap, 1000); // Safety net

        // Also trigger on window resize
        window.addEventListener('resize', resizeMap);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
            window.removeEventListener('resize', resizeMap);
        };
    }, [map]);

    return null;
};

const MapView: React.FC<MapViewProps> = memo(({ waypoints, activePoint }) => {
    const [center, setCenter] = useState<[number, number]>([20.5937, 78.9629]);

    useEffect(() => {
        if (activePoint) {
            setCenter([activePoint.lat, activePoint.lng]);
        } else if (waypoints.length > 0) {
            const lastPoint = waypoints[waypoints.length - 1];
            setCenter([lastPoint.lat, lastPoint.lng]);
        }
    }, [waypoints, activePoint]);

    const polylinePositions = waypoints.map(wp => [wp.lat, wp.lng] as [number, number]);

    return (
        <div className="h-full w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', zIndex: 1 }}
                zoomControl={true}
                whenReady={() => console.log("[MAP] Instance Ready")}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <ChangeView center={center} zoom={13} waypoints={waypoints} activePoint={activePoint} />

                {/* Render Route Waypoints */}
                {waypoints.map((wp, idx) => (
                    <Marker
                        key={`route-${idx}-${wp.lat}`}
                        position={[wp.lat, wp.lng]}
                        opacity={0.6} // Fade route markers slightly
                    >
                        <Popup className="custom-popup">
                            <div className="p-1">
                                <div className="font-bold text-slate-800">{wp.label}</div>
                                <div className="text-xs text-blue-500 font-semibold uppercase tracking-wider mt-0.5">Route Stop {idx + 1}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Render Active Selection Marker (Distinct) */}
                {activePoint && (
                    <Marker
                        key={`active-${activePoint.lat}-${activePoint.lng}`}
                        position={[activePoint.lat, activePoint.lng]}
                        zIndexOffset={1000} // Always on top
                        opacity={1}
                    >
                        <Popup className="custom-popup" autoPan={false}>
                            <div className="p-1">
                                <div className="font-bold text-slate-800">{activePoint.label}</div>
                                <div className="text-xs text-green-600 font-semibold uppercase tracking-wider mt-0.5">Selected Location</div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {waypoints.length > 1 && (
                    <Polyline
                        positions={polylinePositions}
                        color="#3b82f6"
                        weight={4}
                        opacity={0.8}
                        dashArray="10, 10"
                        lineCap="round"
                    />
                )}
            </MapContainer>
        </div>
    );
});

export default MapView;
