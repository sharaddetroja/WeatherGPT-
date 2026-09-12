import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  Navigation, 
  AlertTriangle, 
  CloudOff, 
  ChevronDown, 
  ChevronUp, 
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  type RouteWeatherData, 
  mockRouteWeather 
} from '../../data/mockRouteWeather';
import { useUserProfile } from '../../hooks/useUserProfile';

interface RouteWeatherProps {
  data?: RouteWeatherData | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

// Format duration minutes (e.g. 500 -> "8h 20m", 45 -> "45m")
export function formatDuration(minutes: number): string {
  if (!minutes || minutes <= 0) return '0m';
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

// Format ISO timestamp to readable date/time (e.g., "Sep 12, 2026 • 11:17 PM")
export function formatDateTime(isoString: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', '');
  } catch {
    return isoString;
  }
}

// Format ISO timestamp to time only (e.g. "11:17 PM")
export function formatTimeOnly(isoString: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return isoString;
  }
}

export function RouteWeather({ 
  data = mockRouteWeather, 
  loading = false, 
  error = null,
  onRefresh 
}: RouteWeatherProps) {
  const { convertTemp, tempUnitSymbol } = useUserProfile();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse text-white">
        <div className="glass-panel p-6 sm:p-8 rounded-3xl h-48 bg-white/10" />
        <div className="glass-panel p-6 rounded-3xl h-96 bg-white/10 space-y-4" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 border border-rose-500/30 bg-rose-950/20 text-white">
        <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Unable to load Route Weather</h3>
        <p className="text-sm text-white/70">{error}</p>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="px-5 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-white/90 cursor-pointer"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!data || !data.route || !data.places || data.places.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-3xl text-center space-y-4 text-white">
        <Navigation className="w-10 h-10 text-sky-300 mx-auto" />
        <h3 className="text-lg font-bold text-white">No Journey Data Selected</h3>
        <p className="text-sm text-white/70">
          Enter a source and destination to view weather along your journey.
        </p>
      </div>
    );
  }

  const { route, places, alerts } = data;
  const totalDistance = route.distance_km || places[places.length - 1]?.distance_from_start_km || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 text-white">
      
      {/* 1. ROUTE SUMMARY CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel relative overflow-hidden p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl backdrop-blur-xl bg-slate-900/40"
      >
        {/* Subtle Ambient Glow */}
        <div className="absolute -right-12 -top-12 w-56 h-56 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-300">
              <Navigation className="w-4 h-4 text-sky-400" />
              <span>Source → Destination Weather</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/70 font-medium">
              <Clock className="w-3.5 h-3.5 text-white/60" />
              <span>Departure: <strong className="text-white">{formatDateTime(route.departure_time)}</strong></span>
            </div>
          </div>

          {/* Main Origin -> Destination Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
            {/* Origin */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">SOURCE</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{route.source.name}</h2>
                <span className="text-[11px] text-white/60">
                  {route.source.latitude.toFixed(2)}°, {route.source.longitude.toFixed(2)}°
                </span>
              </div>
            </div>

            {/* Connecting Route Metric Arrow */}
            <div className="flex-1 w-full sm:w-auto flex flex-col items-center justify-center px-4">
              <div className="flex items-center gap-4 text-xs font-bold text-sky-200 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {route.distance_km} km
                </span>
                <span>•</span>
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                  {formatDuration(route.duration_minutes)}
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full relative flex items-center justify-between">
                <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 z-10" />
                <div className="h-1 flex-1 bg-gradient-to-r from-emerald-500 via-sky-400 to-rose-500 rounded-full mx-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
                <div className="w-3 h-3 rounded-full bg-rose-400 border-2 border-slate-900 z-10" />
              </div>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-start sm:justify-end">
              <div className="text-left sm:text-right order-2 sm:order-1">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block">DESTINATION</span>
                <h2 className="text-2xl font-extrabold text-white tracking-tight">{route.destination.name}</h2>
                <span className="text-[11px] text-white/60">
                  {route.destination.latitude.toFixed(2)}°, {route.destination.longitude.toFixed(2)}°
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0 order-1 sm:order-2">
                <MapPin className="w-6 h-6 text-rose-400" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. ALERTS SECTION (Rendered only if alerts exist) */}
      {alerts && alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 rounded-2xl border border-amber-500/40 bg-amber-950/20 text-white space-y-3"
        >
          <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Route Advisories & Hazards ({alerts.length})</span>
          </div>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div key={alert.id || i} className="text-xs text-amber-100/90 pl-7 leading-relaxed">
                • {alert.message} {alert.location && <span className="font-semibold text-amber-300">({alert.location})</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. JOURNEY TIMELINE SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Weather Along Your Journey</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/15 text-sky-200 border border-white/20">
                {places.length} Waypoints
              </span>
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Sequential travel corridor from {route.source.name} to {route.destination.name}
            </p>
          </div>
        </div>

        {/* Vertical Timeline Wrapper */}
        <div className="relative pl-6 sm:pl-8 space-y-4 sm:space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-emerald-400 before:via-sky-400 before:to-rose-400">
          {places.map((place, index) => {
            const isSource = place.type === 'source' || index === 0;
            const isDestination = place.type === 'destination' || index === places.length - 1;
            const isExpanded = expandedIndex === index;
            
            // UI relative progress percentage along total route distance
            const progressPct = Math.min(100, Math.max(0, Math.round((place.distance_from_start_km / totalDistance) * 100)));

            return (
              <motion.div
                key={`${place.name}-${index}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                className="relative"
              >
                {/* Timeline Connector Marker Icon */}
                <div 
                  className={`absolute -left-6 sm:-left-8 top-5 -translate-x-1/2 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold z-20 shadow-md ${
                    isSource 
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20' 
                      : isDestination 
                      ? 'bg-rose-500 text-white ring-4 ring-rose-500/20'
                      : 'bg-sky-500 text-slate-950 ring-2 ring-sky-500/20'
                  }`}
                >
                  {isSource ? 'A' : isDestination ? 'B' : index}
                </div>

                {/* Place Card Container */}
                <div 
                  onClick={() => toggleExpand(index)}
                  className={`glass-panel p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:border-white/30 backdrop-blur-xl ${
                    isSource 
                      ? 'border-emerald-500/40 bg-emerald-950/10' 
                      : isDestination 
                      ? 'border-rose-500/40 bg-rose-950/10'
                      : 'border-white/15 bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Place Identification */}
                    <div className="flex items-start gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                            {place.name}
                          </h4>
                          
                          {/* Type Badge */}
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                            isSource 
                              ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/40' 
                              : isDestination 
                              ? 'bg-rose-500/25 text-rose-300 border-rose-500/40' 
                              : 'bg-sky-500/20 text-sky-200 border-sky-500/30'
                          }`}>
                            {isSource ? 'Source' : isDestination ? 'Destination' : 'Route Place'}
                          </span>
                        </div>

                        {/* Distance & Arrival Details */}
                        <div className="flex items-center gap-3 text-xs text-white/75 mt-1 font-medium">
                          <span>{place.distance_from_start_km} km</span>
                          <span>•</span>
                          <span className="text-sky-300 font-semibold">
                            {isSource ? 'Departure ' : 'ETA '}{formatTimeOnly(place.estimated_arrival)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Weather Display / Placeholder Box */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {place.weather ? (
                        /* Weather Available State */
                        <div className="flex items-center gap-3 bg-white/10 px-3.5 py-2 rounded-xl border border-white/15">
                          <Sun className="w-5 h-5 text-amber-300 shrink-0" />
                          <div>
                            <div className="text-sm font-bold text-white">
                              {convertTemp(place.weather.temp_c ?? 25)}{tempUnitSymbol}
                            </div>
                            <div className="text-[10px] text-white/70">
                              {place.weather.condition || 'Clear'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Weather Unavailable Clean Placeholder */
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-white/60 text-xs">
                          <CloudOff className="w-4 h-4 text-white/40" />
                          <span className="text-[11px] font-medium italic">Weather unavailable</span>
                        </div>
                      )}

                      <button className="p-1 text-white/50 hover:text-white transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                  </div>

                  {/* Expanded Place Details Drawer */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-3 border-t border-white/10 text-xs text-white/75 space-y-2 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <span className="text-[10px] text-white/50 block">Coordinates</span>
                            <span className="font-semibold text-white">{place.latitude.toFixed(4)}°, {place.longitude.toFixed(4)}°</span>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <span className="text-[10px] text-white/50 block">Estimated Arrival</span>
                            <span className="font-semibold text-white">{formatDateTime(place.estimated_arrival)}</span>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <span className="text-[10px] text-white/50 block">Distance from Start</span>
                            <span className="font-semibold text-white">{place.distance_from_start_km} km</span>
                          </div>
                          <div className="bg-white/5 p-2 rounded-xl border border-white/10">
                            <span className="text-[10px] text-white/50 block">Journey Progress</span>
                            <span className="font-semibold text-sky-300">{progressPct}% completed</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
