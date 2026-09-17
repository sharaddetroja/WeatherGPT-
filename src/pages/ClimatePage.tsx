import { useState, useEffect, useRef } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Droplets, 
  ThermometerSun, 
  Search, 
  MapPin, 
  AlertTriangle,
  RefreshCw,
  Gauge,
  CloudRain,
  Database,
  X
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { INDIAN_CITIES } from '../data/indianCities';
import { 
  getClimateDataForLocation, 
  type NormalizedClimateData 
} from '../services/climateService';
import { motion, AnimatePresence } from 'motion/react';

export default function ClimatePage() {
  const { convertTemp, tempUnitSymbol, profile, updateProfile } = useUserProfile();
  const { t } = useLanguage();

  const [selectedCity, setSelectedCity] = useState<string>(profile.location?.split(',')[0] || 'Morbi');
  const [searchInput, setSearchInput] = useState<string>('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [climateData, setClimateData] = useState<NormalizedClimateData | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);

  // Comprehensive search suggestions covering all cities across India
  const suggestions = searchInput.trim()
    ? INDIAN_CITIES.filter(c => {
        const query = searchInput.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query)
        );
      }).slice(0, 10)
    : [];

  // Fetch real backend climate data for selected city
  const loadClimateData = async (city: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getClimateDataForLocation(city);
      if (!data.success) {
        setErrorMsg(data.error || 'Unable to fetch historical climate data for this location.');
      }
      setClimateData(data);
      if (data.location.name) {
        setSelectedCity(data.location.name);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to connect to backend climate API.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCity = profile.location?.split(',')[0] || 'Morbi';
    loadClimateData(initialCity);
  }, [profile.location]);

  // Handle city selection
  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setSearchInput('');
    setShowSuggestions(false);
    updateProfile({ location: cityName });
    loadClimateData(cityName);
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format temperature trend chart data using user unit preference (°C or °F)
  const tempTrendData = climateData?.temperatureTrend.map(item => ({
    label: item.label,
    shortLabel: item.shortLabel,
    date: item.date,
    temp: convertTemp(item.avgTempC),
    minTemp: convertTemp(item.minTempC),
    maxTemp: convertTemp(item.maxTempC),
  })) || [];

  const rainTrendData = climateData?.rainfallTrend.map(item => ({
    label: item.label,
    shortLabel: item.shortLabel,
    date: item.date,
    rain: item.rainMm,
  })) || [];

  const summary = climateData?.summary;
  const location = climateData?.location;

  return (
    <div className="space-y-4 sm:space-y-6 w-full animate-in fade-in duration-500 pb-2 sm:pb-4">
      {/* Top Header & Search Bar Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0 shadow-xs">
              <BarChart2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              {t('climate_title', 'Climate Trends & Historical Intelligence')}
            </h1>
          </div>
          <p className="text-xs text-white/70 flex items-center gap-2 flex-wrap pl-0.5">
            <span>Historical observations for <strong className="text-white font-bold">{selectedCity}</strong></span>
            {location?.latitude && location?.longitude && (
              <span className="text-[11px] font-mono bg-white/10 px-2 py-0.5 rounded-md text-white/80 border border-white/15">
                {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
              </span>
            )}
          </p>
        </div>

        {/* Location Search Bar & Presets Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* City Search Bar */}
          <div className="relative w-full sm:w-56 lg:w-64" ref={searchRef}>
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-white/60 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search city..."
                value={searchInput}
                onChange={e => {
                  setSearchInput(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && searchInput.trim()) {
                    handleSelectCity(searchInput.trim());
                  }
                }}
                className="w-full glass-input rounded-xl pl-9 pr-7 py-2 text-xs font-semibold text-white placeholder-white/50 border border-white/20 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 outline-none transition-all shadow-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    setShowSuggestions(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/60 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Suggestions Dropdown for all Indian cities */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  className="absolute left-0 right-0 z-50 mt-1.5 glass-panel bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto divide-y divide-white/10"
                >
                  <div className="px-3 py-1.5 bg-white/5 text-[10px] font-bold uppercase tracking-wider text-white/60 flex items-center justify-between">
                    <span>Indian Cities & Regions</span>
                    <span>{suggestions.length} match{suggestions.length > 1 ? 'es' : ''}</span>
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(item.name)}
                      className="w-full px-3.5 py-2 text-left text-xs font-semibold hover:bg-white/15 text-white flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                        <span className="truncate font-bold">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0 border border-white/10">
                        {item.region}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="h-28 bg-muted/60 rounded-3xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-24 bg-muted/60 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-80 bg-muted/60 rounded-3xl" />
            <div className="h-80 bg-muted/60 rounded-3xl" />
          </div>
        </div>
      ) : errorMsg && (!climateData || tempTrendData.length === 0) ? (
        /* Error State Card */
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex flex-col items-center justify-center text-center space-y-4 shadow-md">
          <div className="p-3 bg-rose-500/20 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Unable to load climate data</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">{errorMsg}</p>
          </div>
          <button
            onClick={() => loadClimateData(selectedCity)}
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      ) : !climateData || tempTrendData.length === 0 ? (
        /* Empty State Card */
        <div className="p-8 rounded-3xl bg-card border border-border text-center space-y-3">
          <Database className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="text-base font-bold text-foreground">No historical climate data available</h3>
          <p className="text-xs text-muted-foreground">
            No historical weather records were found for {selectedCity}. Try selecting a different city.
          </p>
        </div>
      ) : (
        <>
          {/* Top Dynamic Climate Insight Card */}
          <div className="glass-panel rounded-3xl p-4 sm:p-6 border border-emerald-500/30 bg-emerald-950/20 shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2.5 sm:p-3 bg-emerald-500 text-white rounded-2xl shrink-0 shadow-md border border-emerald-400/40">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="space-y-1 min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-emerald-300">
                  {climateData.insight.title}
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  {climateData.insight.description}
                </p>
              </div>
            </div>
          </div>

          {/* 4 Dynamic Climate Overview Summary Cards */}
          {summary && summary.averageTemperatureC !== null && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Card 1: Average Temperature */}
              <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-md flex flex-col justify-between min-h-[96px] space-y-1 hover:border-white/30 transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <ThermometerSun className="w-3.5 h-3.5 text-orange-400 shrink-0" /> 
                  <span className="truncate">Avg Temperature</span>
                </span>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {convertTemp(summary.averageTemperatureC)}{tempUnitSymbol}
                </div>
              </div>

              {/* Card 2: Temperature Range */}
              <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-md flex flex-col justify-between min-h-[96px] space-y-1 hover:border-white/30 transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> 
                  <span className="truncate">Temp Range</span>
                </span>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight truncate">
                  {summary.minTemperatureC !== null ? convertTemp(summary.minTemperatureC) : '--'}° ~ {summary.maxTemperatureC !== null ? convertTemp(summary.maxTemperatureC) : '--'}{tempUnitSymbol}
                </div>
              </div>

              {/* Card 3: Total Rainfall */}
              <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-md flex flex-col justify-between min-h-[96px] space-y-1 hover:border-white/30 transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" /> 
                  <span className="truncate">Total Rainfall</span>
                </span>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {summary.totalRainfallMm !== null ? summary.totalRainfallMm : 0} <span className="text-xs font-semibold text-white/60">mm</span>
                </div>
              </div>

              {/* Card 4: Rainy Days */}
              <div className="glass-panel p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-md flex flex-col justify-between min-h-[96px] space-y-1 hover:border-white/30 transition-all">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-wider flex items-center gap-1.5">
                  <CloudRain className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> 
                  <span className="truncate">Rainy Days</span>
                </span>
                <div className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {summary.rainyDaysCount} <span className="text-xs font-semibold text-white/60">/ {summary.totalRecordedDays} Days</span>
                </div>
              </div>
            </div>
          )}

          {/* Main 2 Climate Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Chart 1: Daily / Historical Average Temperature Trend */}
            {/* Chart 1: Daily / Historical Average Temperature Trend */}
            <div className="glass-panel rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl overflow-hidden p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2 pb-2 border-b border-white/10">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-white truncate">
                  <ThermometerSun className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 shrink-0" />
                  <span className="truncate">Average Temp Trend ({selectedCity})</span>
                </h3>
                <span className="text-[11px] sm:text-xs font-semibold text-white/70 shrink-0">Unit: {tempUnitSymbol}</span>
              </div>
              <div className="pt-2">
                {tempTrendData.length < 2 ? (
                  <div className="h-[280px] sm:h-[320px] flex items-center justify-center text-xs text-white/60">
                    Not enough historical data points to display a trend line.
                  </div>
                ) : (
                  <div className="h-[280px] sm:h-[320px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tempTrendData} margin={{ top: 15, right: 15, bottom: 5, left: -15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" vertical={false} />
                        <XAxis dataKey="shortLabel" stroke="rgba(255, 255, 255, 0.6)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.6)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          domain={['auto', 'auto']}
                          tickFormatter={(val) => `${val}${tempUnitSymbol}`} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0b1528', 
                            color: '#ffffff',
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.25)', 
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                          labelFormatter={(label, items) => {
                            const pt = items?.[0]?.payload;
                            return pt?.label || label;
                          }}
                          formatter={(val: any) => [`Temperature: ${val}${tempUnitSymbol}`, '']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="temp" 
                          name="Temperature" 
                          stroke="#fb923c" 
                          strokeWidth={3} 
                          dot={{ r: 4, fill: '#fb923c', stroke: '#0b1528', strokeWidth: 2 }} 
                          activeDot={{ r: 6, fill: '#fb923c', stroke: '#ffffff', strokeWidth: 2 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Chart 2: Daily / Historical Rainfall Pattern */}
            <div className="glass-panel rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl overflow-hidden p-4 sm:p-6">
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-1 sm:gap-2 pb-2 border-b border-white/10">
                <h3 className="flex items-center gap-2 text-sm sm:text-base font-extrabold text-white truncate">
                  <Droplets className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 shrink-0" />
                  <span className="truncate">Daily Rainfall ({selectedCity})</span>
                </h3>
                <span className="text-[11px] sm:text-xs font-semibold text-white/70 shrink-0">Unit: mm</span>
              </div>
              <div className="pt-2">
                {rainTrendData.length < 1 ? (
                  <div className="h-[280px] sm:h-[320px] flex items-center justify-center text-xs text-white/60">
                    No precipitation records available for this location.
                  </div>
                ) : (
                  <div className="h-[280px] sm:h-[320px] w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rainTrendData} margin={{ top: 15, right: 15, bottom: 5, left: -15 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.12)" vertical={false} />
                        <XAxis dataKey="shortLabel" stroke="rgba(255, 255, 255, 0.6)" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis 
                          stroke="rgba(255, 255, 255, 0.6)" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={false} 
                          tickFormatter={(val) => `${val}mm`} 
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#0b1528', 
                            color: '#ffffff',
                            borderRadius: '16px', 
                            border: '1px solid rgba(255, 255, 255, 0.25)', 
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
                            fontWeight: 'bold',
                            fontSize: '12px'
                          }}
                          cursor={{ fill: 'rgba(56, 189, 248, 0.12)' }}
                          labelFormatter={(label, items) => {
                            const pt = items?.[0]?.payload;
                            return pt?.label || label;
                          }}
                          formatter={(val: any) => [`Rainfall: ${val} mm`, '']}
                        />
                        <Bar 
                          dataKey="rain" 
                          name="Rainfall" 
                          fill="#38bdf8" 
                          radius={[6, 6, 0, 0]} 
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
