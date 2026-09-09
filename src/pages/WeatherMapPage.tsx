import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Map, 
  Layers, 
  Search, 
  MapPin, 
  Loader2, 
  Palette, 
  ChevronDown, 
  Check, 
  Navigation, 
  Sparkles, 
  Compass,
  CloudRain,
  Wind,
  ShieldAlert,
  ArrowUpRight,
  AlertTriangle,
  Droplets,
  Gauge
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { cn } from '../utils/cn';
import L from 'leaflet';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [22.3039, 70.8022]; // Rajkot

// =========================================================================
// SPECIFIC AREA WEATHER EFFECTS (INCOMING RAIN & FAST WIND ZONES)
// =========================================================================

export interface WeatherEffectZone {
  id: string;
  name: string;
  region: string;
  type: 'rain' | 'wind' | 'storm';
  center: [number, number];
  radiusMeters: number;
  severity: 'Critical' | 'High' | 'Moderate';
  intensityBadge: string;
  metricValue: string;
  etaText: string;
  precipRateInches: number;      // Rainfall rate in inches per hour (e.g. 1.89 in/hr)
  precipTotal24hInches: number;  // 24-hour total rainfall in inches (e.g. 3.45 in)
  precip3hInches: number;        // Expected 3-hour rainfall in inches (e.g. 2.10 in)
  precipRateMm: number;          // in mm/h (e.g. 48 mm/h)
  precipTotal24hMm: number;      // in mm (e.g. 87.6 mm)
  precipProbability: number;     // e.g. 95%
  precipClassification: string;  // e.g. "Heavy Torrential Monsoon Rain"
  windSpeedKph?: number;
  windSpeedMph?: number;
  windDirection?: string;
  description: string;
  safetyAdvice: string;
  streamlines?: [number, number][][];
}

export interface MapClickRainInfo {
  lat: number;
  lon: number;
  placeName?: string;
  rainRateInches: number;
  rainTotal24hInches: number;
  rain3hInches: number;
  rainRateMm: number;
  rainTotal24hMm: number;
  probability: number;
  classification: string;
  zoneMatched?: WeatherEffectZone;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low' | 'Clear';
}

export const WEATHER_EFFECT_ZONES: WeatherEffectZone[] = [
  {
    id: 'rain-rajkot',
    name: 'Rajkot & Central Saurashtra',
    region: 'Gujarat, India',
    type: 'rain',
    center: [22.3039, 70.8022],
    radiusMeters: 38000,
    severity: 'Critical',
    intensityBadge: '🌧️ Heavy Rainfront (1.89 in/hr)',
    metricValue: '1.89 in/hr (48 mm/h)',
    etaText: 'Incoming in 25 min',
    precipRateInches: 1.89,
    precipTotal24hInches: 3.45,
    precip3hInches: 2.10,
    precipRateMm: 48,
    precipTotal24hMm: 87.6,
    precipProbability: 95,
    precipClassification: 'Heavy Torrential Monsoon Downpour',
    description: 'Intense incoming convective monsoon rain band moving southeast at 22 km/h with 85% radar reflectivity.',
    safetyAdvice: 'Expect waterlogging on low-lying roads. Postpone non-essential travel.'
  },
  {
    id: 'rain-mumbai',
    name: 'Mumbai & Coastal Konkan',
    region: 'Maharashtra, India',
    type: 'rain',
    center: [19.0760, 72.8777],
    radiusMeters: 42000,
    severity: 'High',
    intensityBadge: '🌧️ Tropical Downpour (1.65 in/hr)',
    metricValue: '1.65 in/hr (42 mm/h)',
    etaText: 'Incoming in 15 min',
    precipRateInches: 1.65,
    precipTotal24hInches: 3.10,
    precip3hInches: 1.85,
    precipRateMm: 42,
    precipTotal24hMm: 78.7,
    precipProbability: 90,
    precipClassification: 'Tropical Maritime Downpour',
    description: 'High moisture cloudburst incoming from Arabian Sea with localized downpours and low cloud base (300m).',
    safetyAdvice: 'High tide alert synchronized with coastal rain. Check local transit advisories.'
  },
  {
    id: 'storm-ahmedabad',
    name: 'Ahmedabad - Gandhinagar',
    region: 'Gujarat, India',
    type: 'storm',
    center: [23.0225, 72.5714],
    radiusMeters: 46000,
    severity: 'Critical',
    intensityBadge: '⚡ Severe Cloudburst (2.17 in/hr)',
    metricValue: '2.17 in/hr (55 mm/h)',
    etaText: 'Incoming in 35 min',
    precipRateInches: 2.17,
    precipTotal24hInches: 4.20,
    precip3hInches: 2.80,
    precipRateMm: 55,
    precipTotal24hMm: 106.7,
    precipProbability: 98,
    precipClassification: 'Severe Thunderstorm & Torrential Cloudburst',
    description: 'Severe multi-cell thunderstorm with active lightning, rapid temperature drop (-4°C), and microburst risks.',
    safetyAdvice: 'Stay indoors away from metal structures and tall trees during lightning.'
  },
  {
    id: 'wind-saurashtra-coast',
    name: 'Saurashtra Coast & Diu',
    region: 'Gulf of Khambhat',
    type: 'wind',
    center: [21.1500, 71.4000],
    radiusMeters: 52000,
    severity: 'Critical',
    intensityBadge: '💨 Fast Gale Wind Corridor',
    metricValue: '62 km/h NW • 0.31 in/hr rain',
    etaText: 'Active High Wind Warning',
    precipRateInches: 0.31,
    precipTotal24hInches: 0.75,
    precip3hInches: 0.45,
    precipRateMm: 8,
    precipTotal24hMm: 19.0,
    precipProbability: 70,
    precipClassification: 'Coastal Squall & Gale Showers',
    windSpeedKph: 62,
    windSpeedMph: 38.5,
    windDirection: 'NW (315°)',
    description: 'Severe offshore pressure gradient creating sustained gale-force squalls and dangerous ocean swells (3.8m).',
    safetyAdvice: 'Small boat warnings in effect. Secure loose construction sheeting and rooftop antennas.',
    streamlines: [
      [[21.75, 70.80], [21.35, 71.25], [20.95, 71.70]],
      [[21.60, 70.95], [21.20, 71.40], [20.80, 71.85]],
      [[21.45, 71.10], [21.05, 71.55], [20.65, 72.00]],
      [[21.85, 70.60], [21.45, 71.05], [21.05, 71.50]],
    ]
  },
  {
    id: 'wind-kutch',
    name: 'Gulf of Kutch Maritime Belt',
    region: 'Gujarat Coast, India',
    type: 'wind',
    center: [22.6500, 69.8000],
    radiusMeters: 40000,
    severity: 'High',
    intensityBadge: '💨 Coastal Wind Squall',
    metricValue: '54 km/h WNW • 0.20 in/hr rain',
    etaText: 'Active Wind Gusts',
    precipRateInches: 0.20,
    precipTotal24hInches: 0.45,
    precip3hInches: 0.25,
    precipRateMm: 5,
    precipTotal24hMm: 11.4,
    precipProbability: 60,
    precipClassification: 'Scattered Marine Drizzle',
    windSpeedKph: 54,
    windSpeedMph: 33.5,
    windDirection: 'WNW (290°)',
    description: 'Strong coastal thermal winds channeling through Kutch gulf with localized dust haze and choppy waters.',
    safetyAdvice: 'High-profile vehicles should reduce speed across open coastal bridges.',
    streamlines: [
      [[22.95, 69.30], [22.70, 69.75], [22.45, 70.20]],
      [[22.80, 69.45], [22.55, 69.90], [22.30, 70.35]],
    ]
  }
];

// Helper to compute rainfall measurement at any arbitrary clicked coordinate
function calculateRainfallAtPoint(lat: number, lon: number): MapClickRainInfo {
  let closestZone: WeatherEffectZone | null = null;
  let minDistanceMeters = Infinity;

  for (const zone of WEATHER_EFFECT_ZONES) {
    const dLat = (lat - zone.center[0]) * 111000;
    const dLon = (lon - zone.center[1]) * 111000 * Math.cos((lat * Math.PI) / 180);
    const dist = Math.sqrt(dLat * dLat + dLon * dLon);
    if (dist < minDistanceMeters) {
      minDistanceMeters = dist;
      closestZone = zone;
    }
  }

  if (closestZone && minDistanceMeters <= closestZone.radiusMeters) {
    // Inside active weather effect zone
    const decay = Math.max(0.7, 1 - (minDistanceMeters / closestZone.radiusMeters) * 0.3);
    const rateIn = Number((closestZone.precipRateInches * decay).toFixed(2));
    const total24hIn = Number((closestZone.precipTotal24hInches * decay).toFixed(2));
    const next3hIn = Number((closestZone.precip3hInches * decay).toFixed(2));
    return {
      lat,
      lon,
      rainRateInches: rateIn,
      rainTotal24hInches: total24hIn,
      rain3hInches: next3hIn,
      rainRateMm: Math.round(rateIn * 25.4),
      rainTotal24hMm: Number((total24hIn * 25.4).toFixed(1)),
      probability: closestZone.precipProbability,
      classification: closestZone.precipClassification,
      zoneMatched: closestZone,
      severity: closestZone.severity
    };
  } else if (closestZone && minDistanceMeters <= closestZone.radiusMeters * 2.2) {
    // Nearby peripheral rain band
    const factor = Math.max(0.15, 1 - (minDistanceMeters / (closestZone.radiusMeters * 2.2)));
    const rateIn = Number((closestZone.precipRateInches * factor * 0.45).toFixed(2));
    const total24hIn = Number((closestZone.precipTotal24hInches * factor * 0.5).toFixed(2));
    const next3hIn = Number((rateIn * 1.4).toFixed(2));
    const sev = rateIn > 0.5 ? 'High' : rateIn > 0.15 ? 'Moderate' : 'Low';
    return {
      lat,
      lon,
      rainRateInches: rateIn,
      rainTotal24hInches: total24hIn,
      rain3hInches: next3hIn,
      rainRateMm: Math.round(rateIn * 25.4),
      rainTotal24hMm: Number((total24hIn * 25.4).toFixed(1)),
      probability: Math.round(closestZone.precipProbability * factor),
      classification: rateIn > 0.3 ? 'Peripheral Rain Band & Showers' : 'Light Passing Showers & Overcast',
      zoneMatched: closestZone,
      severity: sev
    };
  } else {
    // Baseline clear / dry point
    return {
      lat,
      lon,
      rainRateInches: 0.00,
      rainTotal24hInches: 0.04,
      rain3hInches: 0.00,
      rainRateMm: 0,
      rainTotal24hMm: 1.0,
      probability: 8,
      classification: 'Clear Skies / Dry (No Active Rain)',
      severity: 'Clear'
    };
  }
}

// Helper to construct interactive animated Leaflet DivIcon for Incoming Rain
const createRainEffectIcon = (zone: WeatherEffectZone) => {
  return L.divIcon({
    className: 'weather-effect-rain-marker',
    html: `
      <div style="position: relative; transform: translate(-50%, -50%); cursor: pointer; pointer-events: auto;">
        <!-- Pulsing radar ripple ring -->
        <div style="position: absolute; width: 140px; height: 140px; top: -70px; left: -70px; border-radius: 9999px; background: radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(37, 99, 235, 0.1) 70%, transparent 100%); animation: radarPing 2.2s infinite; pointer-events: none;"></div>
        
        <!-- Falling rain particle visual -->
        <div style="position: absolute; width: 80px; height: 80px; top: -40px; left: -40px; overflow: hidden; pointer-events: none; opacity: 0.85;">
          <div style="width: 2px; height: 16px; background: #60a5fa; position: absolute; top: 5px; left: 20px; animation: rainStream 0.8s linear infinite;"></div>
          <div style="width: 2px; height: 20px; background: #38bdf8; position: absolute; top: 0px; left: 45px; animation: rainStream 0.9s linear 0.2s infinite;"></div>
          <div style="width: 2px; height: 14px; background: #93c5fd; position: absolute; top: 10px; left: 65px; animation: rainStream 0.7s linear 0.4s infinite;"></div>
        </div>

        <!-- Floating Glassmorphism Badge showing Rain in Inches -->
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: rgba(15, 23, 42, 0.94); color: #ffffff; border: 1.5px solid rgba(59, 130, 246, 0.85); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.5); backdrop-filter: blur(8px); white-space: nowrap; font-family: sans-serif;">
          <span style="font-size: 16px;">🌧️</span>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 12px; font-weight: 800; color: #60a5fa; letter-spacing: 0.2px;">${zone.precipRateInches} in/hr</span>
              <span style="font-size: 9px; opacity: 0.85; font-weight: 600; color: #94a3b8;">(${zone.precipRateMm} mm)</span>
            </div>
            <span style="font-size: 9px; font-weight: 600; color: #cbd5e1;">24h Total: <strong style="color: #93c5fd;">${zone.precipTotal24hInches} in</strong></span>
          </div>
          <span style="background: rgba(239, 68, 68, 0.95); color: white; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 6px; text-transform: uppercase;">Rainfront</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Helper to construct interactive animated Leaflet DivIcon for Fast Wind
const createWindEffectIcon = (zone: WeatherEffectZone) => {
  return L.divIcon({
    className: 'weather-effect-wind-marker',
    html: `
      <div style="position: relative; transform: translate(-50%, -50%); cursor: pointer; pointer-events: auto;">
        <!-- Rotating Wind Vortex Ring -->
        <div style="position: absolute; width: 130px; height: 130px; top: -65px; left: -65px; border-radius: 9999px; border: 2px dashed rgba(20, 184, 166, 0.6); animation: vortexSpin 5s linear infinite; pointer-events: none;"></div>
        
        <!-- Wind particle drift effect -->
        <div style="position: absolute; width: 90px; height: 60px; top: -30px; left: -45px; overflow: hidden; pointer-events: none; opacity: 0.85;">
          <div style="width: 24px; height: 2px; background: #2dd4bf; position: absolute; top: 15px; left: 10px; border-radius: 2px; animation: windParticleDrift 1.2s ease-in-out infinite;"></div>
          <div style="width: 32px; height: 2px; background: #5eead4; position: absolute; top: 35px; left: 5px; border-radius: 2px; animation: windParticleDrift 1.5s ease-in-out 0.3s infinite;"></div>
        </div>

        <!-- Floating Glassmorphism Badge -->
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: rgba(15, 23, 42, 0.94); color: #ffffff; border: 1.5px solid rgba(20, 184, 166, 0.85); box-shadow: 0 6px 20px rgba(20, 184, 166, 0.45); backdrop-filter: blur(8px); white-space: nowrap; font-family: sans-serif;">
          <span style="font-size: 16px;">💨</span>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-size: 12px; font-weight: 800; color: #2dd4bf; letter-spacing: 0.2px;">${zone.windSpeedKph} km/h ${zone.windDirection}</span>
            <span style="font-size: 9px; font-weight: 600; color: #cbd5e1;">Rain: <strong style="color: #5eead4;">${zone.precipTotal24hInches} in</strong> (${zone.precipRateInches} in/hr)</span>
          </div>
          <span style="background: rgba(245, 158, 11, 0.95); color: #000; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 6px; text-transform: uppercase;">Gale</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Helper to construct interactive animated Leaflet DivIcon for Thunderstorm
const createStormEffectIcon = (zone: WeatherEffectZone) => {
  return L.divIcon({
    className: 'weather-effect-storm-marker',
    html: `
      <div style="position: relative; transform: translate(-50%, -50%); cursor: pointer; pointer-events: auto;">
        <!-- Flashing Alert Glow -->
        <div style="position: absolute; width: 150px; height: 150px; top: -75px; left: -75px; border-radius: 9999px; background: radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(220, 38, 38, 0.08) 70%, transparent 100%); animation: radarPing 1.8s infinite; pointer-events: none;"></div>

        <!-- Floating Glassmorphism Badge showing Rain in Inches -->
        <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px; background: rgba(15, 23, 42, 0.95); color: #ffffff; border: 1.5px solid rgba(239, 68, 68, 0.85); box-shadow: 0 6px 22px rgba(239, 68, 68, 0.6); backdrop-filter: blur(8px); white-space: nowrap; font-family: sans-serif;">
          <span style="font-size: 16px;">⚡</span>
          <div style="display: flex; flex-direction: column; text-align: left;">
            <div style="display: flex; align-items: baseline; gap: 4px;">
              <span style="font-size: 12px; font-weight: 800; color: #f87171; letter-spacing: 0.2px;">${zone.precipRateInches} in/hr</span>
              <span style="font-size: 9px; opacity: 0.85; font-weight: 600; color: #fda4af;">(${zone.precipRateMm} mm)</span>
            </div>
            <span style="font-size: 9px; font-weight: 600; color: #fca5a5;">24h Total: <strong style="color: #fee2e2;">${zone.precipTotal24hInches} in</strong></span>
          </div>
          <span style="background: rgba(220, 38, 38, 0.95); color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 6px; text-transform: uppercase;">Storm</span>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Helper for dynamic map-click Pin marker icon
const createClickPinIcon = (rainInfo: MapClickRainInfo) => {
  const isRain = rainInfo.rainRateInches > 0.05;
  const isHeavy = rainInfo.rainRateInches >= 0.5;
  const color = isHeavy ? '#ef4444' : isRain ? '#3b82f6' : '#10b981';
  return L.divIcon({
    className: 'map-click-rain-pin',
    html: `
      <div style="position: relative; transform: translate(-50%, -100%); cursor: pointer;">
        <div style="display: flex; align-items: center; gap: 6px; background: rgba(15, 23, 42, 0.96); border: 2px solid ${color}; color: white; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(0,0,0,0.5); white-space: nowrap; font-family: sans-serif;">
          <span style="font-size: 13px;">${isHeavy ? '⚡' : isRain ? '🌧️' : '📍'}</span>
          <span style="font-size: 11px; font-weight: 800; color: ${color};">${rainInfo.rainRateInches.toFixed(2)} in/hr</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${color}; margin: 0 auto;"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
};

// Map themes with small thumbnail pictures, crisp labels, and full deep zoom support (up to zoom 20+)
const mapThemes = [
  {
    id: 'google-hybrid',
    name: 'Google Satellite Hybrid',
    subtitle: 'Crisp satellite with all cities & areas',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    maxZoom: 21,
    maxNativeZoom: 20,
    attribution: '&copy; Google Maps',
    thumb: 'https://mt1.google.com/vt/lyrs=y&x=4&y=8&z=4',
    fallbackGradient: 'from-emerald-900 via-teal-800 to-green-950',
    hasOverlayLabels: false,
  },
  {
    id: 'osm-roads',
    name: 'Google Street / OSM',
    subtitle: 'Clear streets, colonies, towns & cities',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; OpenStreetMap contributors',
    thumb: 'https://tile.openstreetmap.org/4/12/8.png',
    fallbackGradient: 'from-blue-200 via-emerald-100 to-yellow-100',
    hasOverlayLabels: false,
  },
  {
    id: 'voyager',
    name: 'Voyager Detailed Areas',
    subtitle: 'High-contrast cities, borders & districts',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; CARTO Voyager',
    thumb: 'https://a.basemaps.cartocdn.com/rastertiles/voyager/4/12/8.png',
    fallbackGradient: 'from-amber-200 via-rose-100 to-sky-200',
    hasOverlayLabels: false,
  },
  {
    id: 'satellite-pure',
    name: 'Esri Satellite + Labels',
    subtitle: 'Photographic aerial with city names',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    maxZoom: 20,
    maxNativeZoom: 18,
    attribution: '&copy; Esri World Imagery',
    thumb: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/4/8/12',
    fallbackGradient: 'from-emerald-900 via-teal-800 to-green-950',
    hasOverlayLabels: true,
  },
  {
    id: 'terrain',
    name: 'Terrain & Topo Relief',
    subtitle: 'Mountains, rivers & regional towns',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    subdomains: ['server'],
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; Esri Topo',
    thumb: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/4/8/12',
    fallbackGradient: 'from-amber-600 via-orange-500 to-yellow-600',
    hasOverlayLabels: false,
  },
  {
    id: 'dark',
    name: 'Dark Mode Cities',
    subtitle: 'Night styling with illuminated roads',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; CARTO Dark Matter',
    thumb: 'https://a.basemaps.cartocdn.com/dark_all/4/12/8.png',
    fallbackGradient: 'from-gray-900 via-slate-800 to-black',
    hasOverlayLabels: false,
  },
  {
    id: 'light',
    name: 'Clean Positron Light',
    subtitle: 'Minimalist clean roads & places',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    subdomains: ['a', 'b', 'c', 'd'],
    maxZoom: 20,
    maxNativeZoom: 19,
    attribution: '&copy; CARTO Positron',
    thumb: 'https://a.basemaps.cartocdn.com/light_all/4/12/8.png',
    fallbackGradient: 'from-gray-100 via-slate-200 to-zinc-300',
    hasOverlayLabels: false,
  },
];

// Component to fly the map to a new location — only when coordinates actually change
function FlyToLocation({ position, zoom }: { position: [number, number]; zoom?: number }) {
  const map = useMap();
  const posKey = `${position[0]},${position[1]},${zoom}`;
  const prevKey = useRef(posKey);

  useEffect(() => {
    if (prevKey.current !== posKey) {
      prevKey.current = posKey;
      map.flyTo(position, zoom ?? 12, { duration: 1.5 });
    }
  }, [posKey, position, zoom, map]);

  return null;
}

// Map Click Listener to calculate Rainfall in Inches anywhere user clicks
function MapClickRainfallInspector({ onMapClick }: { onMapClick: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

interface SearchResult {
  lat: number;
  lon: number;
  name: string;
}

export default function WeatherMapPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [layer, setLayer] = useState<'temp' | 'rain' | 'clouds'>('rain');
  const [mapStyle, setMapStyle] = useState('google-hybrid'); // Google Satellite Hybrid with all cities & areas
  const [styleDropdownOpen, setStyleDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  const [mapZoom, setMapZoom] = useState(6);
  const [locating, setLocating] = useState(false);

  // Weather Effects Toggles & Selected Zone state
  const [showRainEffects, setShowRainEffects] = useState(true);
  const [showWindEffects, setShowWindEffects] = useState(true);
  const [selectedZone, setSelectedZone] = useState<WeatherEffectZone | null>(WEATHER_EFFECT_ZONES[0]);
  
  // Interactive Map-Click Rainfall in Inches state
  const [clickedRainfall, setClickedRainfall] = useState<MapClickRainInfo | null>({
    lat: 22.3039,
    lon: 70.8022,
    placeName: 'Rajkot & Central Saurashtra',
    rainRateInches: 1.89,
    rainTotal24hInches: 3.45,
    rain3hInches: 2.10,
    rainRateMm: 48,
    rainTotal24hMm: 87.6,
    probability: 95,
    classification: 'Heavy Torrential Monsoon Downpour',
    zoneMatched: WEATHER_EFFECT_ZONES[0],
    severity: 'Critical'
  });

  // Measurement unit toggle: 'inches' or 'mm'
  const [unitMode, setUnitMode] = useState<'inches' | 'mm'>('inches');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentTheme = mapThemes.find(t => t.id === mapStyle) || mapThemes[0];

  // Check URL parameters for deep-linking effects
  useEffect(() => {
    const effectParam = searchParams.get('effect');
    const zoneParam = searchParams.get('zone');

    if (zoneParam) {
      const matched = WEATHER_EFFECT_ZONES.find(z => z.id === zoneParam);
      if (matched) {
        setSelectedZone(matched);
        setMapCenter(matched.center);
        setMapZoom(10);
        if (matched.type === 'rain' || matched.type === 'storm') setShowRainEffects(true);
        if (matched.type === 'wind') setShowWindEffects(true);
        setClickedRainfall({
          lat: matched.center[0],
          lon: matched.center[1],
          placeName: matched.name,
          rainRateInches: matched.precipRateInches,
          rainTotal24hInches: matched.precipTotal24hInches,
          rain3hInches: matched.precip3hInches,
          rainRateMm: matched.precipRateMm,
          rainTotal24hMm: matched.precipTotal24hMm,
          probability: matched.precipProbability,
          classification: matched.precipClassification,
          zoneMatched: matched,
          severity: matched.severity
        });
      }
    } else if (effectParam === 'rain') {
      const rainZone = WEATHER_EFFECT_ZONES.find(z => z.type === 'rain');
      if (rainZone) {
        setSelectedZone(rainZone);
        setMapCenter(rainZone.center);
        setMapZoom(10);
        setShowRainEffects(true);
      }
    } else if (effectParam === 'wind') {
      const windZone = WEATHER_EFFECT_ZONES.find(z => z.type === 'wind');
      if (windZone) {
        setSelectedZone(windZone);
        setMapCenter(windZone.center);
        setMapZoom(9);
        setShowWindEffects(true);
      }
    }
  }, [searchParams]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setStyleDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Jump to specific area effect zone
  const handleJumpToZone = (zone: WeatherEffectZone) => {
    setSelectedZone(zone);
    setMapCenter(zone.center);
    setMapZoom(zone.type === 'wind' ? 9 : 10);
    if (zone.type === 'rain' || zone.type === 'storm') {
      setShowRainEffects(true);
    } else if (zone.type === 'wind') {
      setShowWindEffects(true);
    }

    setClickedRainfall({
      lat: zone.center[0],
      lon: zone.center[1],
      placeName: zone.name,
      rainRateInches: zone.precipRateInches,
      rainTotal24hInches: zone.precipTotal24hInches,
      rain3hInches: zone.precip3hInches,
      rainRateMm: zone.precipRateMm,
      rainTotal24hMm: zone.precipTotal24hMm,
      probability: zone.precipProbability,
      classification: zone.precipClassification,
      zoneMatched: zone,
      severity: zone.severity
    });
  };

  // Map Click Handler — computes localized rainfall in inches for any clicked area
  const handleMapClick = async (lat: number, lon: number) => {
    const rainInfo = calculateRainfallAtPoint(lat, lon);
    
    // Reverse geocode to get human-friendly location name if not already attached to a known zone
    let placeName = rainInfo.zoneMatched ? rainInfo.zoneMatched.name : `${lat.toFixed(3)}°, ${lon.toFixed(3)}°`;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=12`,
        { headers: { 'Accept': 'application/json' } }
      );
      if (res.ok) {
        const data = await res.json();
        const addr = data.address;
        const name = addr?.city || addr?.town || addr?.village || addr?.county || addr?.state_district || data.display_name?.split(',').slice(0, 2).join(',');
        if (name) placeName = name;
      }
    } catch {
      // Keep coordinates/zone name on network failure
    }

    const updatedInfo: MapClickRainInfo = {
      ...rainInfo,
      placeName
    };

    setClickedRainfall(updatedInfo);

    if (rainInfo.zoneMatched) {
      setSelectedZone(rainInfo.zoneMatched);
    }
  };

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) return;

    setSearching(true);
    setSearchError('');

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (data.length === 0) {
        setSearchError('Location not found. Try a different search term.');
        setSearchResult(null);
      } else {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);
        const name = result.display_name.split(',').slice(0, 2).join(',');

        setSearchResult({ lat, lon, name });
        setMapCenter([lat, lon]);
        setMapZoom(12);
        setSearchError('');

        // Trigger rainfall calculation for searched location
        handleMapClick(lat, lon);
      }
    } catch {
      setSearchError('Search failed. Please try again.');
      setSearchResult(null);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setSearchError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setSearchError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Reverse geocode to get the actual place name
        let name = 'My Location';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
            { headers: { 'Accept': 'application/json' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            name = addr?.city || addr?.town || addr?.village || addr?.county || data.display_name?.split(',').slice(0, 2).join(',') || 'My Location';
          }
        } catch {
          // Keep default name if reverse geocoding fails
        }

        setSearchResult({ lat, lon, name });
        setMapCenter([lat, lon]);
        setMapZoom(13);
        setLocating(false);

        // Compute localized rainfall in inches for user's GPS position
        handleMapClick(lat, lon);
      },
      (error) => {
        let message = 'Unable to get your location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please allow location permission in your browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
        setSearchError(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const hasAutoLocated = useRef(false);

  useEffect(() => {
    if (searchParams.get('locate') === 'true' && !hasAutoLocated.current) {
      hasAutoLocated.current = true;
      handleUseMyLocation();
    }
  }, [searchParams]);

  // Determine intensity bar percentage for rainfall rate
  const getRainRatePercentage = (rateInches: number) => {
    // 0 to 2.5 in/hr max scale
    return Math.min(100, Math.max(5, (rateInches / 2.5) * 100));
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Map className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Weather & Rainfall Map</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Interactive Doppler radar, live rain animations & inches precipitation inspector
            </p>
          </div>
        </div>
        
        {/* Search & Location Controls Toolbar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-card border rounded-xl p-1.5 shadow-sm flex-1 sm:flex-initial focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
            <Search className="w-5 h-5 text-muted-foreground ml-2 flex-shrink-0" />
            <input 
              type="text" 
              placeholder="Search city, area or country..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none text-sm px-2 py-1 w-full sm:w-60"
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-3.5 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>Search</span>
                </>
              )}
            </button>
          </div>

          {/* Integrated My Location Button right in toolbar */}
          <button
            onClick={handleUseMyLocation}
            disabled={locating}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-card hover:bg-muted border border-border text-primary rounded-xl text-sm font-medium shadow-sm transition-all hover:border-primary/50 disabled:opacity-60 flex-shrink-0 cursor-pointer"
            title="Detect my current GPS location and inspect rainfall"
          >
            {locating ? (
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
            ) : (
              <Navigation className="w-4 h-4 text-primary" />
            )}
            <span className="hidden md:inline text-xs font-semibold">My Location</span>
          </button>
        </div>
      </div>

      {/* Search Error banner */}
      {searchError && (
        <div className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl flex items-center justify-between">
          <span>{searchError}</span>
          <button onClick={() => setSearchError('')} className="text-xs font-semibold hover:underline ml-3">Dismiss</button>
        </div>
      )}

      {/* Main Map + Sidebar Area */}
      <div className="flex flex-col md:flex-row gap-4 h-full">
        {/* Controls Sidebar */}
        <Card className="w-full md:w-80 flex-shrink-0 h-fit max-h-[calc(100vh-200px)] overflow-y-auto">
          <CardContent className="p-4 space-y-5">
            
            {/* Map Style Section with Custom Picture Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Palette className="w-4 h-4 text-primary" />
                Map Mode
              </h3>

              {/* Custom Dropdown Trigger Button */}
              <button
                type="button"
                onClick={() => setStyleDropdownOpen(!styleDropdownOpen)}
                className="w-full flex items-center gap-3 border border-border rounded-xl p-2 bg-background hover:bg-muted/60 transition-all focus:ring-2 focus:ring-primary outline-none cursor-pointer shadow-sm text-left"
              >
                {/* Small thumbnail picture */}
                <div className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-border shadow-xs bg-gradient-to-br ${currentTheme.fallbackGradient}`}>
                  <img
                    src={currentTheme.thumb}
                    alt={currentTheme.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = '0';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{currentTheme.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{currentTheme.subtitle}</div>
                </div>

                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 flex-shrink-0 ${styleDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popover */}
              {styleDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1.5 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="p-1.5 max-h-72 overflow-y-auto space-y-1">
                    {mapThemes.map((t) => {
                      const isSelected = mapStyle === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setMapStyle(t.id);
                            setStyleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className={`relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border shadow-xs bg-gradient-to-br ${t.fallbackGradient} ${
                            isSelected ? 'border-primary ring-2 ring-primary/40' : 'border-border/60'
                          }`}>
                            <img
                              src={t.thumb}
                              alt={t.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.opacity = '0';
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                              {t.name}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {t.subtitle}
                            </div>
                          </div>

                          {isSelected && (
                            <Check className="w-4 h-4 text-primary flex-shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Map Weather Layers Section */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                Weather Layers
              </h3>
              <div className="space-y-1.5">
                <button 
                  onClick={() => setLayer('rain')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${layer === 'rain' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground border border-border/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <CloudRain className="w-4 h-4" />
                    <span>Rainfall Radar (Inches)</span>
                  </div>
                  {layer === 'rain' && <span className="w-2 h-2 rounded-full bg-primary-foreground"></span>}
                </button>
                <button 
                  onClick={() => setLayer('temp')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${layer === 'temp' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground border border-border/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4" />
                    <span>Temperature</span>
                  </div>
                  {layer === 'temp' && <span className="w-2 h-2 rounded-full bg-primary-foreground"></span>}
                </button>
                <button 
                  onClick={() => setLayer('clouds')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${layer === 'clouds' ? 'bg-primary text-primary-foreground shadow-sm' : 'hover:bg-muted text-foreground border border-border/50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    <span>Cloud Coverage</span>
                  </div>
                  {layer === 'clouds' && <span className="w-2 h-2 rounded-full bg-primary-foreground"></span>}
                </button>
              </div>
            </div>

            {/* Area Weather Effects Section (Incoming Rain & Fast Wind) */}
            <div className="pt-2 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  Area Weather Effects
                </h3>
                <span className="text-[10px] font-bold bg-amber-500/15 text-amber-600 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {WEATHER_EFFECT_ZONES.length} Active
                </span>
              </div>

              {/* Effect Layer Toggles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setShowRainEffects(!showRainEffects)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    showRainEffects 
                      ? "bg-blue-600/10 border-blue-500/40 text-blue-600 shadow-xs" 
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <CloudRain className={cn("w-4 h-4 flex-shrink-0", showRainEffects ? "text-blue-500 animate-bounce" : "text-muted-foreground")} />
                    <span className="truncate">Rain Radar</span>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", showRainEffects ? "bg-blue-500" : "bg-muted-foreground/40")} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowWindEffects(!showWindEffects)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                    showWindEffects 
                      ? "bg-teal-600/10 border-teal-500/40 text-teal-600 shadow-xs" 
                      : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Wind className={cn("w-4 h-4 flex-shrink-0", showWindEffects ? "text-teal-500 animate-pulse" : "text-muted-foreground")} />
                    <span className="truncate">Wind Flow</span>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", showWindEffects ? "bg-teal-500" : "bg-muted-foreground/40")} />
                </button>
              </div>

              {/* Specific Area Quick Jumps */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Select Specific Area
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {WEATHER_EFFECT_ZONES.map((zone) => {
                    const isSelected = selectedZone?.id === zone.id;
                    const isRain = zone.type === 'rain' || zone.type === 'storm';
                    return (
                      <button
                        key={zone.id}
                        type="button"
                        onClick={() => handleJumpToZone(zone)}
                        className={cn(
                          "w-full flex items-center justify-between p-2 rounded-xl text-left transition-all border cursor-pointer",
                          isSelected
                            ? isRain 
                              ? "bg-blue-500/15 border-blue-500 text-blue-700 dark:text-blue-300 font-bold shadow-xs" 
                              : "bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-xs"
                            : "bg-card hover:bg-muted/60 border-border/70 text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-base flex-shrink-0">
                            {zone.type === 'storm' ? '⚡' : zone.type === 'rain' ? '🌧️' : '💨'}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-bold truncate">{zone.name}</div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {zone.precipRateInches} in/hr • Total {zone.precipTotal24hInches} in
                            </div>
                          </div>
                        </div>
                        <ArrowUpRight className={cn("w-3.5 h-3.5 flex-shrink-0 ml-1 transition-transform", isSelected ? "rotate-45" : "text-muted-foreground")} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ========================================================================= */}
              {/* DEDICATED RAINFALL MEASUREMENT INSPECTOR (INCHES & MM) */}
              {/* ========================================================================= */}
              {clickedRainfall && (
                <div className="p-3 bg-gradient-to-br from-blue-500/10 via-background to-blue-500/5 rounded-2xl border border-blue-500/30 space-y-3 shadow-sm">
                  {/* Card Title & Unit Switcher */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <CloudRain className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-bold text-foreground">Rainfall Measurement</span>
                    </div>

                    {/* Inches / mm toggle */}
                    <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setUnitMode('inches')}
                        className={cn(
                          "px-2 py-0.5 rounded-md transition-all cursor-pointer",
                          unitMode === 'inches' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUnitMode('mm')}
                        className={cn(
                          "px-2 py-0.5 rounded-md transition-all cursor-pointer",
                          unitMode === 'mm' ? "bg-primary text-primary-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        mm
                      </button>
                    </div>
                  </div>

                  {/* Inspected Area Header */}
                  <div>
                    <h4 className="text-xs font-extrabold text-foreground truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <span className="truncate">{clickedRainfall.placeName || 'Selected Area'}</span>
                    </h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {clickedRainfall.classification}
                    </p>
                  </div>

                  {/* Primary 3-Metric Breakdown Box */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-background/90 rounded-xl border border-border/80">
                    <div className="text-center p-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">Current Rate</div>
                      <div className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                        {unitMode === 'inches' 
                          ? `${clickedRainfall.rainRateInches.toFixed(2)} in/h`
                          : `${clickedRainfall.rainRateMm} mm/h`}
                      </div>
                    </div>

                    <div className="text-center p-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">24h Total</div>
                      <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
                        {unitMode === 'inches'
                          ? `${clickedRainfall.rainTotal24hInches.toFixed(2)} in`
                          : `${clickedRainfall.rainTotal24hMm.toFixed(1)} mm`}
                      </div>
                    </div>

                    <div className="text-center p-1 rounded-lg bg-sky-500/10 border border-sky-500/20">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase">Next 3h</div>
                      <div className="text-sm font-extrabold text-sky-600 dark:text-sky-400 mt-0.5">
                        {unitMode === 'inches'
                          ? `${clickedRainfall.rain3hInches.toFixed(2)} in`
                          : `${Math.round(clickedRainfall.rain3hInches * 25.4)} mm`}
                      </div>
                    </div>
                  </div>

                  {/* Rainfall Intensity Progress Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>Intensity Level</span>
                      <span className="font-bold text-foreground">
                        {clickedRainfall.rainRateInches >= 1.0 ? '🚨 Cloudburst (>1.0 in/h)' :
                         clickedRainfall.rainRateInches >= 0.3 ? '🌧️ Heavy (0.3-1.0 in/h)' :
                         clickedRainfall.rainRateInches >= 0.1 ? '🌦️ Moderate (0.1-0.3 in/h)' :
                         clickedRainfall.rainRateInches > 0 ? '💧 Light (<0.1 in/h)' : '☀️ Dry & Clear'}
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/60 flex">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          clickedRainfall.rainRateInches >= 1.0 ? "bg-gradient-to-r from-orange-500 to-red-600" :
                          clickedRainfall.rainRateInches >= 0.3 ? "bg-gradient-to-r from-blue-500 to-indigo-600" :
                          clickedRainfall.rainRateInches >= 0.1 ? "bg-gradient-to-r from-sky-400 to-blue-500" :
                          clickedRainfall.rainRateInches > 0 ? "bg-sky-300" : "bg-emerald-500"
                        )}
                        style={{ width: `${getRainRatePercentage(clickedRainfall.rainRateInches)}%` }}
                      />
                    </div>
                  </div>

                  {/* Precipitation Probability & Advice */}
                  <div className="flex items-center justify-between text-[11px] p-2 bg-muted/60 rounded-xl border border-border/60">
                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      <span>Chance of Rain:</span>
                    </div>
                    <span className="font-extrabold text-blue-600 dark:text-blue-400">
                      {clickedRainfall.probability}%
                    </span>
                  </div>

                  {/* Safety Advice or Warning if Heavy Rain */}
                  {(clickedRainfall.zoneMatched?.safetyAdvice || clickedRainfall.rainRateInches >= 0.5) && (
                    <div className="p-2 bg-amber-500/10 dark:bg-amber-950/30 rounded-xl text-[10px] text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <span>{clickedRainfall.zoneMatched?.safetyAdvice || 'High rainfall rate detected. Beware of sudden street pooling and low visibility.'}</span>
                    </div>
                  )}

                  {/* Ask AI Action */}
                  <button
                    type="button"
                    onClick={() => navigate(`/assistant?prompt=${encodeURIComponent(`How much rainfall (in inches) is expected in ${clickedRainfall.placeName}? Current rate is ${clickedRainfall.rainRateInches} in/hr, 24h total is ${clickedRainfall.rainTotal24hInches} inches.`)}`)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Ask AI About This Rainfall</span>
                  </button>
                </div>
              )}
            </div>

            {/* Location Info */}
            {searchResult && (
              <div className="pt-2 border-t border-border">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Active Search Result
                </h3>
                <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20 space-y-1.5">
                  <p className="text-xs font-bold text-primary">{searchResult.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {searchResult.lat.toFixed(4)}°, {searchResult.lon.toFixed(4)}°
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Interactive Leaflet Map Container */}
        <div className="flex-1 rounded-2xl border bg-muted overflow-hidden relative shadow-sm min-h-[450px]">
          {/* Top Floating Weather Effects Status Banner */}
          <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 max-w-[calc(100%-80px)] overflow-x-auto hide-scrollbar">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-md text-xs font-semibold text-foreground">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="hidden sm:inline">Active Effects:</span>
              <span className="text-blue-500 font-bold">🌧️ 3 Rainfronts</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-teal-500 font-bold">💨 2 Wind Gale Belts</span>
              <span className="text-muted-foreground">•</span>
              <span className="text-amber-500 font-medium text-[11px] hidden md:inline">Click anywhere on map to inspect rainfall (inches)</span>
            </div>
          </div>

          <MapContainer center={defaultCenter} zoom={6} maxZoom={21} className="w-full h-full z-0">
            {/* Base Tile Layer with active selected theme */}
            <TileLayer
              key={currentTheme.id}
              attribution={currentTheme.attribution}
              url={currentTheme.url}
              subdomains={currentTheme.subdomains}
              maxZoom={currentTheme.maxZoom || 20}
              maxNativeZoom={currentTheme.maxNativeZoom || 19}
            />

            {/* If the theme needs an explicit place/city labels layer, overlay it seamlessly */}
            {currentTheme.hasOverlayLabels && (
              <TileLayer
                attribution="&copy; Esri Reference"
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={20}
                maxNativeZoom={18}
                opacity={0.9}
              />
            )}

            {/* Smooth Fly to searched or detected location */}
            <FlyToLocation position={mapCenter} zoom={mapZoom} />

            {/* Map Click Listener to capture arbitrary clicks and measure rainfall in inches */}
            <MapClickRainfallInspector onMapClick={handleMapClick} />

            {/* ============================================================= */}
            {/* SPECIFIC AREA EFFECTS: INCOMING RAIN & THUNDERSTORM ZONES */}
            {/* ============================================================= */}
            {showRainEffects && WEATHER_EFFECT_ZONES.filter(z => z.type === 'rain' || z.type === 'storm').map((zone) => (
              <div key={zone.id}>
                {/* Outer Doppler Radar Scan Circle */}
                <Circle
                  center={zone.center}
                  radius={zone.radiusMeters}
                  pathOptions={{
                    fillColor: zone.type === 'storm' ? '#ef4444' : '#3b82f6',
                    fillOpacity: 0.18,
                    color: zone.type === 'storm' ? '#b91c1c' : '#2563eb',
                    weight: 2,
                    dashArray: '6, 6'
                  }}
                  eventHandlers={{
                    click: () => {
                      handleJumpToZone(zone);
                    }
                  }}
                />

                {/* Inner Core High-Precipitation Cloudburst Zone */}
                <Circle
                  center={zone.center}
                  radius={zone.radiusMeters * 0.45}
                  pathOptions={{
                    fillColor: zone.type === 'storm' ? '#dc2626' : '#1d4ed8',
                    fillOpacity: 0.35,
                    color: zone.type === 'storm' ? '#991b1b' : '#1e40af',
                    weight: 1.5
                  }}
                  eventHandlers={{
                    click: () => {
                      handleJumpToZone(zone);
                    }
                  }}
                />

                {/* Animated Interactive DivIcon Marker */}
                <Marker
                  position={zone.center}
                  icon={zone.type === 'storm' ? createStormEffectIcon(zone) : createRainEffectIcon(zone)}
                  eventHandlers={{
                    click: () => {
                      handleJumpToZone(zone);
                    }
                  }}
                >
                  <Popup>
                    <div className="font-sans p-1.5 space-y-2 text-center min-w-[210px]">
                      <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-foreground">
                        <span>{zone.type === 'storm' ? '⚡' : '🌧️'}</span>
                        <span>{zone.name}</span>
                      </div>
                      
                      {/* Prominent Rainfall in Inches Box */}
                      <div className="p-2 bg-blue-500/10 dark:bg-blue-950/40 rounded-xl border border-blue-500/30 text-left space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Rainfall Rate:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {zone.precipRateInches} in/hr <span className="text-[10px] text-muted-foreground">({zone.precipRateMm}mm)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">24h Total:</span>
                          <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                            {zone.precipTotal24hInches} in <span className="text-[10px] text-muted-foreground">({zone.precipTotal24hMm}mm)</span>
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Next 3 Hours:</span>
                          <span className="font-bold text-sky-600 dark:text-sky-400">
                            {zone.precip3hInches} inches
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-blue-500/20">
                          <span className="text-muted-foreground">Probability:</span>
                          <span className="font-bold text-blue-600">{zone.precipProbability}%</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {zone.etaText} • {zone.description}
                      </p>
                      
                      <button
                        onClick={() => navigate(`/assistant?prompt=${encodeURIComponent(`What is the weather forecast and rainfall advisory for ${zone.name}? Expected rain rate is ${zone.precipRateInches} in/hr and 24h total is ${zone.precipTotal24hInches} in.`)}`)}
                        className="w-full py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Ask AI About This Storm
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* ============================================================= */}
            {/* SPECIFIC AREA EFFECTS: FAST WIND STREAMLINE VECTORS */}
            {/* ============================================================= */}
            {showWindEffects && WEATHER_EFFECT_ZONES.filter(z => z.type === 'wind').map((zone) => (
              <div key={zone.id}>
                {/* Wind Corridor Perimeter Circle */}
                <Circle
                  center={zone.center}
                  radius={zone.radiusMeters}
                  pathOptions={{
                    fillColor: '#0d9488',
                    fillOpacity: 0.12,
                    color: '#14b8a6',
                    weight: 2,
                    dashArray: '8, 8'
                  }}
                  eventHandlers={{
                    click: () => {
                      handleJumpToZone(zone);
                    }
                  }}
                />

                {/* Animated Flowing Streamlines (Wind Vector Trajectories) */}
                {zone.streamlines?.map((line, sIdx) => (
                  <Polyline
                    key={`${zone.id}-stream-${sIdx}`}
                    positions={line}
                    pathOptions={{
                      color: '#14b8a6',
                      weight: 4,
                      dashArray: '10, 14',
                      opacity: 0.85,
                      lineCap: 'round',
                    }}
                  />
                ))}

                {/* Animated Interactive Wind DivIcon Marker */}
                <Marker
                  position={zone.center}
                  icon={createWindEffectIcon(zone)}
                  eventHandlers={{
                    click: () => {
                      handleJumpToZone(zone);
                    }
                  }}
                >
                  <Popup>
                    <div className="font-sans p-1.5 space-y-2 text-center min-w-[210px]">
                      <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-foreground">
                        <span>💨</span>
                        <span>{zone.name}</span>
                      </div>

                      {/* Prominent Wind & Rain Box */}
                      <div className="p-2 bg-teal-500/10 dark:bg-teal-950/40 rounded-xl border border-teal-500/30 text-left space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Wind Speed:</span>
                          <span className="font-extrabold text-teal-600 dark:text-teal-400">
                            {zone.windSpeedKph} km/h ({zone.windDirection})
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">Rainfall Rate:</span>
                          <span className="font-extrabold text-blue-600 dark:text-blue-400">
                            {zone.precipRateInches} in/hr ({zone.precipRateMm}mm)
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">24h Rainfall:</span>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {zone.precipTotal24hInches} in
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground leading-tight">
                        {zone.etaText} • {zone.description}
                      </p>
                      <button
                        onClick={() => navigate(`/assistant?prompt=${encodeURIComponent(`What is the wind speed advisory and gale warning for ${zone.name}? Wind is ${zone.windSpeedKph} km/h and rain is ${zone.precipTotal24hInches} inches.`)}`)}
                        className="w-full py-1.5 text-xs font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
                      >
                        Ask AI About This Wind Gale
                      </button>
                    </div>
                  </Popup>
                </Marker>
              </div>
            ))}

            {/* Dynamic Clicked Location Pin with Inches Rainfall Badge */}
            {clickedRainfall && (
              <Marker
                position={[clickedRainfall.lat, clickedRainfall.lon]}
                icon={createClickPinIcon(clickedRainfall)}
              >
                <Popup>
                  <div className="font-sans p-1.5 space-y-2 text-center min-w-[200px]">
                    <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-foreground">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span>{clickedRainfall.placeName}</span>
                    </div>

                    {/* Rainfall in Inches Summary */}
                    <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/30 text-left space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Rain Rate:</span>
                        <span className="font-extrabold text-blue-600 dark:text-blue-400">
                          {clickedRainfall.rainRateInches.toFixed(2)} in/hr ({clickedRainfall.rainRateMm} mm)
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">24h Total:</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                          {clickedRainfall.rainTotal24hInches.toFixed(2)} inches
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground font-medium">Next 3h:</span>
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          {clickedRainfall.rain3hInches.toFixed(2)} in
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] pt-0.5 border-t border-blue-500/20">
                        <span className="text-muted-foreground">Rain Chance:</span>
                        <span className="font-bold text-blue-600">{clickedRainfall.probability}%</span>
                      </div>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                      {clickedRainfall.classification}
                    </p>

                    <button
                      onClick={() => navigate(`/assistant?prompt=${encodeURIComponent(`What is the localized rainfall and radar forecast for ${clickedRainfall.placeName}? Current rain is ${clickedRainfall.rainRateInches} in/hr and 24h total is ${clickedRainfall.rainTotal24hInches} in.`)}`)}
                      className="w-full py-1 text-xs font-bold bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                    >
                      Ask AI About This Area
                    </button>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Searched Location Pin */}
            {searchResult && (
              <Marker position={[searchResult.lat, searchResult.lon]}>
                <Popup>
                  <div className="text-center font-sans p-1">
                    <p className="font-bold text-sm text-foreground">{searchResult.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {searchResult.lat.toFixed(4)}°, {searchResult.lon.toFixed(4)}°
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>

          {/* Clean Map Compass / Target Icon at top-right of map (Google Maps style) */}
          <button 
            onClick={handleUseMyLocation}
            disabled={locating}
            className="absolute top-4 right-4 z-[400] bg-background/95 backdrop-blur-sm border border-border p-2.5 rounded-xl shadow-md text-primary hover:bg-muted transition-all hover:scale-105 disabled:opacity-70 cursor-pointer"
            title="Locate me on map and calculate rainfall"
          >
            {locating ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <Compass className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
