import { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  CloudRain, 
  Sun, 
  CloudSun, 
  CloudLightning,
  Navigation, 
  ArrowRight, 
  ArrowLeftRight, 
  MapPin, 
  Loader2, 
  Calendar, 
  Bike, 
  Bus, 
  Train, 
  CheckCircle2, 
  Eye, 
  Wind, 
  Sparkles,
  Map as MapIcon
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLanguage } from '../hooks/useLanguage';
import { useUserProfile } from '../hooks/useUserProfile';
import { INDIAN_CITIES } from '../data/indianCities';
import { 
  calculateRouteWeather, 
  type RouteCalculationResult 
} from '../services/routeWeatherService';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map markers for start, waypoints, and end
const startIcon = L.divIcon({
  className: 'custom-map-pin-start',
  html: `<div style="background-color:#10b981; width:28px; height:28px; rounded-full; border:3px solid white; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-weight:bold; font-size:12px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">A</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const endIcon = L.divIcon({
  className: 'custom-map-pin-end',
  html: `<div style="background-color:#ef4444; width:28px; height:28px; border:3px solid white; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-weight:bold; font-size:12px; box-shadow:0 4px 6px rgba(0,0,0,0.3);">B</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14]
});

const waypointIcon = L.divIcon({
  className: 'custom-map-pin-wpt',
  html: `<div style="background-color:#3b82f6; width:22px; height:22px; border:2.5px solid white; border-radius:50%; display:flex; align-items:center; justify-center; color:white; font-weight:bold; font-size:10px; box-shadow:0 3px 5px rgba(0,0,0,0.25);">📍</div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

const PRESET_ROUTES = [
  { source: 'Morbi', destination: 'Rajkot', label: 'Morbi ➔ Rajkot (NH27)' },
  { source: 'Rajkot', destination: 'Ahmedabad', label: 'Rajkot ➔ Ahmedabad (NH47)' },
  { source: 'Mumbai', destination: 'Pune', label: 'Mumbai ➔ Pune (Expressway)' },
  { source: 'Delhi', destination: 'Jaipur', label: 'Delhi ➔ Jaipur (NH48)' }
];

export default function TravelPlannerPage() {
  const { t } = useLanguage();
  const { convertTemp, tempUnitSymbol } = useUserProfile();

  const [sourceInput, setSourceInput] = useState('Morbi');
  const [destInput, setDestInput] = useState('Rajkot');
  const [departureDate, setDepartureDate] = useState('');
  const [travelMode, setTravelMode] = useState<'driving' | 'bus' | 'bike' | 'train'>('driving');

  const [sourceSuggestions, setSourceSuggestions] = useState<string[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<string[]>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);

  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Initialize with default Morbi -> Rajkot route calculation
  useEffect(() => {
    handleCalculateRoute('Morbi', 'Rajkot', undefined, 'driving');
  }, []);

  // Handle source suggestions
  const handleSourceChange = (val: string) => {
    setSourceInput(val);
    if (!val.trim()) {
      setSourceSuggestions([]);
      setShowSourceDropdown(false);
      return;
    }
    const q = val.toLowerCase().trim();
    const matches = INDIAN_CITIES
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => c.name);
    setSourceSuggestions(matches);
    setShowSourceDropdown(matches.length > 0);
  };

  // Handle destination suggestions
  const handleDestChange = (val: string) => {
    setDestInput(val);
    if (!val.trim()) {
      setDestSuggestions([]);
      setShowDestDropdown(false);
      return;
    }
    const q = val.toLowerCase().trim();
    const matches = INDIAN_CITIES
      .filter(c => c.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(c => c.name);
    setDestSuggestions(matches);
    setShowDestDropdown(matches.length > 0);
  };

  // Swap Source and Destination
  const handleSwap = () => {
    const temp = sourceInput;
    setSourceInput(destInput);
    setDestInput(temp);
  };

  // Main Route Submit Handler
  const handleCalculateRoute = async (
    src = sourceInput,
    dst = destInput,
    depIso = departureDate ? new Date(departureDate).toISOString() : undefined,
    mode = travelMode
  ) => {
    if (!src.trim() || !dst.trim()) {
      setErrorMsg('Please enter both source and destination locations.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setShowSourceDropdown(false);
    setShowDestDropdown(false);

    try {
      // Simulate brief smooth calculation delay for UX
      await new Promise(r => setTimeout(r, 400));
      const res = await calculateRouteWeather(src, dst, depIso, mode);
      setRouteResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to calculate route weather.');
    } finally {
      setLoading(false);
    }
  };

  // Render weather icon helper
  const renderWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'cloud-rain':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'cloud-lightning':
        return <CloudLightning className="w-5 h-5 text-amber-400" />;
      case 'cloud-sun':
        return <CloudSun className="w-5 h-5 text-amber-300" />;
      default:
        return <Sun className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-500 font-bold text-xs uppercase tracking-wider mb-1">
            <Car className="w-4 h-4" />
            <span>Highway & Journey Weather</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            {t('travel_title', 'Source ➔ Destination Weather')}
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-xl">
            {t('travel_subtitle', 'Live arrival-time weather forecasts, highway hazard alerts, and route telemetry along your entire travel corridor.')}
          </p>
        </div>

        {/* Preset Quick Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_ROUTES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSourceInput(preset.source);
                setDestInput(preset.destination);
                handleCalculateRoute(preset.source, preset.destination, undefined, travelMode);
              }}
              className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted border border-border text-xs font-semibold text-foreground transition-all cursor-pointer shadow-2xs"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Route Search Form Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border border-border shadow-lg space-y-4">
        <h2 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span>Plan Your Journey Weather</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
          
          {/* Source Input */}
          <div className="md:col-span-4 relative" ref={sourceRef}>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Source Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Morbi"
                value={sourceInput}
                onChange={e => handleSourceChange(e.target.value)}
                onFocus={() => sourceSuggestions.length > 0 && setShowSourceDropdown(true)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Source Suggestions Dropdown */}
            {showSourceDropdown && (
              <div className="absolute left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in">
                {sourceSuggestions.map((cityName, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSourceInput(cityName);
                      setShowSourceDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{cityName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-1 md:py-0">
            <button
              onClick={handleSwap}
              type="button"
              className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 border border-border text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              title="Swap Source and Destination"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-4 relative" ref={destRef}>
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Destination Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Rajkot"
                value={destInput}
                onChange={e => handleDestChange(e.target.value)}
                onFocus={() => destSuggestions.length > 0 && setShowDestDropdown(true)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-sm font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Destination Suggestions Dropdown */}
            {showDestDropdown && (
              <div className="absolute left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in">
                {destSuggestions.map((cityName, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDestInput(cityName);
                      setShowDestDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold hover:bg-muted text-foreground flex items-center gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>{cityName}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Departure Date/Time */}
          <div className="md:col-span-3">
            <label className="text-xs font-bold text-muted-foreground block mb-1.5">
              Departure Time
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-primary absolute left-3 top-3" />
              <input
                type="datetime-local"
                value={departureDate}
                onChange={e => setDepartureDate(e.target.value)}
                className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Travel Mode Pills & Submit Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
          
          {/* Travel Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-muted/50 border border-border text-xs w-full sm:w-auto">
            <button
              onClick={() => setTravelMode('driving')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'driving' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Driving</span>
            </button>
            <button
              onClick={() => setTravelMode('bus')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'bus' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Bus</span>
            </button>
            <button
              onClick={() => setTravelMode('bike')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'bike' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Bike</span>
            </button>
            <button
              onClick={() => setTravelMode('train')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                travelMode === 'train' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span>Train</span>
            </button>
          </div>

          {/* Action Submit Button */}
          <button
            onClick={() => handleCalculateRoute()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-primary-foreground font-extrabold text-sm rounded-2xl hover:bg-primary/90 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Calculating Route Weather...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Check Route Weather</span>
              </>
            )}
          </button>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Route Weather Results Display */}
      {routeResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* 1. Route Summary Banner */}
          <div className="p-6 rounded-3xl bg-card border border-border shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                    <span>{routeResult.source.name}</span>
                    <ArrowRight className="w-5 h-5 text-primary" />
                    <span>{routeResult.destination.name}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Total Distance: <strong className="text-foreground font-bold">{routeResult.distanceKm} km</strong> • 
                    Approx Travel: <strong className="text-foreground font-bold">{Math.floor(routeResult.durationMinutes / 60)}h {routeResult.durationMinutes % 60}m</strong>
                  </p>
                </div>
              </div>

              {/* Highway Safety Score Index */}
              <div className="flex items-center gap-3 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block">Highway Safety Index</span>
                  <span className={`text-2xl font-black ${routeResult.safetyScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {routeResult.safetyScore} / 100
                  </span>
                </div>
                <div className={`p-2.5 rounded-2xl border ${routeResult.safetyScore > 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Recommended Departure Window */}
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase block">Optimal Departure Window</span>
                <span className="text-xs font-bold text-foreground">{routeResult.recommendedDeparture}</span>
              </div>
            </div>

            {/* Hazard Warning Callout */}
            {routeResult.hazardAlert && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <div>
                  <strong className="font-bold">Live Highway Hazard ({routeResult.hazardAlert.place}): </strong>
                  <span>{routeResult.hazardAlert.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Main 2-Column Section: Waypoint Timeline & Embedded Leaflet Route Map */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (7 Cols): Step-by-Step Waypoint Cards */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-primary" />
                  <span>Weather Along Your Journey ({routeResult.waypoints.length} Sampling Points)</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Deterministic Route
                </span>
              </div>

              {/* Waypoint Cards Chain */}
              <div className="space-y-3">
                {routeResult.waypoints.map((wpt, idx) => {
                  const isFirst = idx === 0;
                  const isLast = idx === routeResult.waypoints.length - 1;
                  const convertedTemp = convertTemp(wpt.weather.temperatureC);

                  return (
                    <div
                      key={wpt.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isFirst 
                          ? 'bg-emerald-500/5 border-emerald-500/30 shadow-xs'
                          : isLast 
                          ? 'bg-rose-500/5 border-rose-500/30 shadow-xs'
                          : 'bg-card border-border shadow-xs'
                      }`}
                    >
                      {/* Left: Location Name & Arrival Time */}
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isFirst 
                            ? 'bg-emerald-500 text-white' 
                            : isLast 
                            ? 'bg-rose-500 text-white' 
                            : 'bg-primary/20 text-primary border border-primary/30'
                        }`}>
                          {isFirst ? 'Start' : isLast ? 'End' : idx}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-foreground">{wpt.name}</span>
                            {isFirst && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Source</span>}
                            {isLast && <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400">Destination</span>}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>Arrival: <strong className="text-foreground font-bold">{wpt.estimatedArrivalFormatted}</strong></span>
                            <span>•</span>
                            <span>{wpt.distanceFromStartKm} km from start</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Weather Condition & Icon */}
                      <div className="flex items-center gap-2.5">
                        {renderWeatherIcon(wpt.weather.icon)}
                        <div>
                          <div className="text-xs font-bold text-foreground">{wpt.weather.condition}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Rain Prob: <strong className="text-blue-400 font-bold">{wpt.weather.rainProbability}%</strong>
                          </div>
                        </div>
                      </div>

                      {/* Right: Temp & Telemetry Pills */}
                      <div className="text-right flex items-center sm:flex-col justify-between w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40">
                        <div className="text-lg font-black text-foreground">
                          {convertedTemp}{tempUnitSymbol}
                        </div>
                        <div className="text-[10px] text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-cyan-400" /> {wpt.weather.windSpeedKph} km/h</span>
                          <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-emerald-400" /> {wpt.weather.visibilityKm} km</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (5 Cols): Embedded Route Map & Checklist */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Interactive Route Leaflet Map Card */}
              <div className="p-4 rounded-3xl bg-card border border-border shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-primary" />
                    <span>Route Geometry & Waypoint Markers</span>
                  </h3>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                    Live Map
                  </span>
                </div>

                <div className="h-72 w-full rounded-2xl overflow-hidden border border-border shadow-inner relative z-0">
                  <MapContainer
                    center={[routeResult.source.latitude, routeResult.source.longitude]}
                    zoom={9}
                    scrollWheelZoom={false}
                    className="w-full h-full"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Polyline vector connecting route */}
                    <Polyline
                      positions={routeResult.polyline}
                      color="#3b82f6"
                      weight={5}
                      opacity={0.8}
                    />

                    {/* Source Marker */}
                    <Marker
                      position={[routeResult.source.latitude, routeResult.source.longitude]}
                      icon={startIcon}
                    >
                      <Popup>
                        <div className="text-xs font-bold p-1">
                          <div>📍 Source: {routeResult.source.name}</div>
                          <div className="text-[10px] text-slate-600">Departure: {routeResult.waypoints[0]?.estimatedArrivalFormatted}</div>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Intermediate Waypoint Markers */}
                    {routeResult.waypoints.slice(1, -1).map(wpt => (
                      <Marker
                        key={wpt.id}
                        position={[wpt.latitude, wpt.longitude]}
                        icon={waypointIcon}
                      >
                        <Popup>
                          <div className="text-xs font-bold p-1">
                            <div>📍 {wpt.name} ({wpt.distanceFromStartKm} km)</div>
                            <div className="text-blue-600">ETA: {wpt.estimatedArrivalFormatted}</div>
                            <div>{wpt.weather.condition} • {convertTemp(wpt.weather.temperatureC)}{tempUnitSymbol}</div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}

                    {/* Destination Marker */}
                    <Marker
                      position={[routeResult.destination.latitude, routeResult.destination.longitude]}
                      icon={endIcon}
                    >
                      <Popup>
                        <div className="text-xs font-bold p-1">
                          <div>🏁 Destination: {routeResult.destination.name}</div>
                          <div className="text-[10px] text-slate-600">ETA: {routeResult.waypoints[routeResult.waypoints.length - 1]?.estimatedArrivalFormatted}</div>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                </div>
              </div>

              {/* Driving Safety Checklist */}
              <div className="p-5 rounded-3xl bg-card border border-border shadow-lg space-y-3">
                <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Monsoon Driving Safety Checklist</span>
                </h3>
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Check windshield wiper blades & washer fluid reservoir.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Keep headlights on low-beam during heavy rain bands.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Maintain 4-second braking distance on wet highway pavement.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
