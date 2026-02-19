import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapPin {
  dayNumber: number;
  location: string;
  lat: number;
  lng: number;
}

interface TripMapProps {
  locations: { dayNumber: number; location: string }[];
  onPinClick?: (dayNumber: number) => void;
  className?: string;
}

const geocodeCache = new Map<string, { lat: number; lng: number } | null>();

async function geocode(location: string): Promise<{ lat: number; lng: number } | null> {
  const key = location.toLowerCase().trim();
  if (geocodeCache.has(key)) return geocodeCache.get(key) || null;

  if (!MAPBOX_TOKEN) return null;

  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${MAPBOX_TOKEN}&limit=1`
    );
    if (!res.ok) throw new Error(`Geocode ${res.status}`);
    const data = await res.json();
    const [lng, lat] = data.features?.[0]?.center || [];
    if (lat && lng) {
      const result = { lat, lng };
      geocodeCache.set(key, result);
      return result;
    }
    geocodeCache.set(key, null);
    return null;
  } catch (e) {
    console.warn('Geocode failed for', location, e);
    geocodeCache.set(key, null);
    return null;
  }
}

export function TripMap({ locations, onPinClick, className = '' }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [pins, setPins] = useState<MapPin[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!locations.length) return;

    const resolveAll = async () => {
      const resolved: MapPin[] = [];
      for (const loc of locations) {
        const coords = await geocode(loc.location);
        if (coords) {
          resolved.push({ dayNumber: loc.dayNumber, location: loc.location, ...coords });
        }
      }
      setPins(resolved);
    };
    resolveAll();
  }, [locations]);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN || pins.length === 0) return;

    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    mapboxgl.accessToken = MAPBOX_TOKEN;
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [pins[0].lng, pins[0].lat],
      zoom: 10,
    });

    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    m.on('load', () => {
      setLoaded(true);

      pins.forEach((pin) => {
        const el = document.createElement('div');
        el.className = 'trip-map-pin';
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background: #7c3aed; color: white; display: flex;
          align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; cursor: pointer;
          border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        `;
        el.textContent = String(pin.dayNumber);
        el.addEventListener('click', () => onPinClick?.(pin.dayNumber));

        new mapboxgl.Marker({ element: el })
          .setLngLat([pin.lng, pin.lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(`Day ${pin.dayNumber}: ${pin.location}`))
          .addTo(m);
      });

      if (pins.length > 1) {
        const bounds = new mapboxgl.LngLatBounds();
        pins.forEach((p) => bounds.extend([p.lng, p.lat]));
        m.fitBounds(bounds, { padding: 50 });
      }
    });

    map.current = m;

    return () => {
      m.remove();
      map.current = null;
    };
  }, [pins, onPinClick]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className={`bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 text-sm ${className}`}>
        Map unavailable — add VITE_MAPBOX_TOKEN to .env
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm">
          Loading map...
        </div>
      )}
    </div>
  );
}
