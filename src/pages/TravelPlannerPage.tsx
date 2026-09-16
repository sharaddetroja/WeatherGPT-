import { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  AlertTriangle, 
  Navigation, 
  ArrowLeftRight, 
  MapPin, 
  Loader2, 
  Sparkles,
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import { useLanguage } from '../hooks/useLanguage';
import { INDIAN_CITIES } from '../data/indianCities';
import { 
  calculateRouteWeather, 
  getLiveRouteWeatherBackend,
  type RouteCalculationResult 
} from '../services/routeWeatherService';
import { RouteWeather } from '../components/route/RouteWeather';
import { rawBackendRouteWeatherResponse } from '../data/mockRouteWeather';

export default function TravelPlannerPage() {
  const { t } = useLanguage();

  const [sourceInput, setSourceInput] = useState('Morbi');
  const [destInput, setDestInput] = useState('Surat');

  const [sourceSuggestions, setSourceSuggestions] = useState<typeof INDIAN_CITIES>([]);
  const [destSuggestions, setDestSuggestions] = useState<typeof INDIAN_CITIES>([]);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [rawBackendRes, setRawBackendRes] = useState<any>(null);
  const [routeResult, setRouteResult] = useState<RouteCalculationResult | null>(null);

  const sourceRef = useRef<HTMLDivElement>(null);
  const destRef = useRef<HTMLDivElement>(null);

  // Initialize with default route calculation
  useEffect(() => {
    handleCalculateRoute('Morbi', 'Surat');
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sourceRef.current && !sourceRef.current.contains(e.target as Node)) {
        setShowSourceDropdown(false);
      }
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle source suggestions across all Indian cities & regions
  const handleSourceChange = (val: string) => {
    setSourceInput(val);
    if (!val.trim()) {
      setSourceSuggestions([]);
      setShowSourceDropdown(false);
      return;
    }
    const q = val.toLowerCase().trim();
    const matches = INDIAN_CITIES
      .filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      .slice(0, 8);
    setSourceSuggestions(matches);
    setShowSourceDropdown(matches.length > 0);
  };

  // Handle destination suggestions across all Indian cities & regions
  const handleDestChange = (val: string) => {
    setDestInput(val);
    if (!val.trim()) {
      setDestSuggestions([]);
      setShowDestDropdown(false);
      return;
    }
    const q = val.toLowerCase().trim();
    const matches = INDIAN_CITIES
      .filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q))
      .slice(0, 8);
    setDestSuggestions(matches);
    setShowDestDropdown(matches.length > 0);
  };

  // Swap Source and Destination
  const handleSwap = () => {
    const temp = sourceInput;
    setSourceInput(destInput);
    setDestInput(temp);
  };

  // Main Route Submit Handler calling live Express API
  const handleCalculateRoute = async (
    src = sourceInput,
    dst = destInput
  ) => {
    if (!src.trim() || !dst.trim()) {
      setErrorMsg('Please enter both source and destination locations.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setShowSourceDropdown(false);
    setShowDestDropdown(false);
    setRawBackendRes(null);
    setRouteResult(null);

    try {
      // 1. First attempt fetching live route weather from Express backend
      const liveRes = await getLiveRouteWeatherBackend(src, dst);
      setRawBackendRes(liveRes);
    } catch (err: any) {
      console.warn('Live API fetch failed, using fallback route calculator:', err.message);
      // 2. Fallback to client route calculation
      try {
        const fallbackRes = await calculateRouteWeather(src, dst, undefined, 'driving');
        setRouteResult(fallbackRes);
      } catch (fallbackErr: any) {
        setErrorMsg(fallbackErr.message || 'Unable to calculate route weather.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Construct active raw response for RouteWeather component
  const activeRawResponse = rawBackendRes 
    ? rawBackendRes 
    : routeResult 
    ? {
        success: true,
        route: {
          source: { name: routeResult.source.name, latitude: routeResult.source.latitude, longitude: routeResult.source.longitude },
          destination: { name: routeResult.destination.name, latitude: routeResult.destination.latitude, longitude: routeResult.destination.longitude },
          distance_km: routeResult.distanceKm,
          duration_minutes: routeResult.durationMinutes,
          departure_time: routeResult.departureTimeIso
        },
        places: routeResult.waypoints.map(w => ({
          name: w.name,
          type: w.name === routeResult.source.name ? 'source' : w.name === routeResult.destination.name ? 'destination' : 'route_place',
          latitude: w.latitude,
          longitude: w.longitude,
          distance_from_start_km: w.distanceFromStartKm,
          estimated_arrival: w.estimatedArrivalIso,
          weather: {
            temp_c: w.weather.temperatureC,
            temperature_c: w.weather.temperatureC,
            condition: {
              text: w.weather.condition,
              icon: w.weather.icon
            },
            humidity: w.weather.humidity,
            wind_kph: w.weather.windSpeedKph,
            wind_speed_kph: w.weather.windSpeedKph,
            rain_probability: w.weather.rainProbability,
            visibility_km: w.weather.visibilityKm,
            is_stale: w.weather.isStale
          }
        })),
        alerts: routeResult.hazardAlert ? [{ type: routeResult.hazardAlert.type, title: 'Route Warning', place: routeResult.hazardAlert.place, severity: 'Warning', description: routeResult.hazardAlert.message }] : []
      }
    : rawBackendRouteWeatherResponse;

  return (
    <div className="space-y-4 xs:space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Header Banner */}
      <div className="glass-panel p-4 xs:p-5 sm:p-7 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-sky-300 font-bold text-[11px] xs:text-xs uppercase tracking-wider mb-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30">
            <Car className="w-3.5 h-3.5" />
            <span>Highway & Route Telemetry</span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5 flex-wrap">
            <span>Source</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            <span>Destination Weather</span>
          </h1>
          <p className="text-xs text-white/70 mt-1 max-w-xl leading-relaxed">
            {t('travel_subtitle', 'Live arrival-time weather forecasts, highway hazard alerts, and route telemetry along your travel corridor.')}
          </p>
        </div>
      </div>

      {/* Main Interactive Route Search Form Card */}
      <div className="glass-panel p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs xs:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
            <Navigation className="w-4 h-4 text-sky-400" />
            <span>Plan Your Journey Weather</span>
          </h2>
          <span className="text-[10px] text-white/60 hidden sm:inline-block font-medium">
            Auto-detects live route corridor & waypoints
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          
          {/* Source Input */}
          <div className="md:col-span-5 relative" ref={sourceRef}>
            <label className="text-xs font-bold text-white/80 block mb-1.5 flex items-center justify-between">
              <span>Source Location</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Start Point</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-400 fill-emerald-400/20 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Morbi"
                value={sourceInput}
                onChange={e => handleSourceChange(e.target.value)}
                onFocus={() => sourceSuggestions.length > 0 && setShowSourceDropdown(true)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-white/50 border border-white/20 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 outline-none transition-all shadow-xs"
              />
            </div>

            {/* Source Suggestions Dropdown */}
            {showSourceDropdown && (
              <div className="absolute left-0 right-0 z-50 mt-1 glass-panel bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in max-h-60 overflow-y-auto divide-y divide-white/10">
                <div className="px-3 py-1.5 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center justify-between">
                  <span>Start City Suggestions</span>
                  <span>{sourceSuggestions.length} found</span>
                </div>
                {sourceSuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSourceInput(city.name);
                      setShowSourceDropdown(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-white/15 text-white flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate font-bold">{city.name}</span>
                    </div>
                    <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 border border-white/10">
                      {city.region}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center py-0.5 md:py-0">
            <button
              onClick={handleSwap}
              type="button"
              className="p-2.5 rounded-xl glass-pill border border-white/20 text-white/80 hover:text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-xs"
              title="Swap Source and Destination"
              aria-label="Swap Source and Destination"
            >
              <ArrowLeftRight className="w-4 h-4 rotate-90 md:rotate-0 text-sky-300" />
            </button>
          </div>

          {/* Destination Input */}
          <div className="md:col-span-4 relative" ref={destRef}>
            <label className="text-xs font-bold text-white/80 block mb-1.5 flex items-center justify-between">
              <span>Destination Location</span>
              <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">Arrival Point</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-rose-400 fill-rose-400/20 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Surat"
                value={destInput}
                onChange={e => handleDestChange(e.target.value)}
                onFocus={() => destSuggestions.length > 0 && setShowDestDropdown(true)}
                className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-white/50 border border-white/20 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 outline-none transition-all shadow-xs"
              />
            </div>

            {/* Destination Suggestions Dropdown */}
            {showDestDropdown && (
              <div className="absolute left-0 right-0 z-50 mt-1 glass-panel bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in max-h-60 overflow-y-auto divide-y divide-white/10">
                <div className="px-3 py-1.5 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center justify-between">
                  <span>Arrival City Suggestions</span>
                  <span>{destSuggestions.length} found</span>
                </div>
                {destSuggestions.map((city, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setDestInput(city.name);
                      setShowDestDropdown(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-white/15 text-white flex items-center justify-between gap-2.5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 fill-rose-400/20 shrink-0" />
                      <span className="truncate font-bold">{city.name}</span>
                    </div>
                    <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 border border-white/10">
                      {city.region}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          <div className="md:col-span-2">
            <button
              onClick={() => handleCalculateRoute()}
              disabled={loading}
              className="w-full px-4 py-2.5 bg-primary text-primary-foreground font-extrabold text-xs sm:text-sm rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 min-h-[42px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
                  <span className="truncate font-bold">Check Route</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error message banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-500 font-semibold flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <button 
              onClick={() => handleCalculateRoute()} 
              className="px-2.5 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-[11px] font-bold text-red-400 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}
      </div>

      {/* Main Route Weather Display */}
      <RouteWeather 
        rawResponse={activeRawResponse} 
        loading={loading} 
        error={errorMsg}
        onRefresh={() => handleCalculateRoute()} 
      />
    </div>
  );
}
