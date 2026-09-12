import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Search, 
  Compass, 
  Globe2, 
  Download, 
  RefreshCw, 
  AlertTriangle,
  MapPin
} from 'lucide-react';
import { getWeatherData } from '../services/weatherService';
import { format } from 'date-fns';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { WeatherGlobe3D } from '../components/3d/WeatherGlobe3D';
import { exportWeatherPDF } from '../utils/exportReports';
import { useMagnetic } from '../utils/gsapEffects';
import { motion, AnimatePresence } from 'motion/react';

// Popular cities and districts for instant search suggestions
const POPULAR_CITIES = [
  // Gujarat Cities & Districts
  { name: 'Rajkot', region: 'Gujarat', country: 'India' },
  { name: 'Ahmedabad', region: 'Gujarat', country: 'India' },
  { name: 'Surat', region: 'Gujarat', country: 'India' },
  { name: 'Vadodara', region: 'Gujarat', country: 'India' },
  { name: 'Morbi', region: 'Gujarat', country: 'India' },
  { name: 'Jamnagar', region: 'Gujarat', country: 'India' },
  { name: 'Bhavnagar', region: 'Gujarat', country: 'India' },
  { name: 'Junagadh', region: 'Gujarat', country: 'India' },
  { name: 'Gandhinagar', region: 'Gujarat', country: 'India' },
  { name: 'Anand', region: 'Gujarat', country: 'India' },
  { name: 'Bharuch', region: 'Gujarat', country: 'India' },
  { name: 'Porbandar', region: 'Gujarat', country: 'India' },
  { name: 'Mehsana', region: 'Gujarat', country: 'India' },
  { name: 'Bhuj', region: 'Gujarat', country: 'India' },
  { name: 'Navsari', region: 'Gujarat', country: 'India' },
  { name: 'Valsad', region: 'Gujarat', country: 'India' },
  { name: 'Patan', region: 'Gujarat', country: 'India' },
  { name: 'Amreli', region: 'Gujarat', country: 'India' },
  { name: 'Surendranagar', region: 'Gujarat', country: 'India' },
  { name: 'Somnath', region: 'Gujarat', country: 'India' },
  { name: 'Dwarka', region: 'Gujarat', country: 'India' },

  // Major Indian Metros & Hubs
  { name: 'Mumbai', region: 'Maharashtra', country: 'India' },
  { name: 'Delhi', region: 'Delhi', country: 'India' },
  { name: 'Bengaluru', region: 'Karnataka', country: 'India' },
  { name: 'Hyderabad', region: 'Telangana', country: 'India' },
  { name: 'Chennai', region: 'Tamil Nadu', country: 'India' },
  { name: 'Kolkata', region: 'West Bengal', country: 'India' },
  { name: 'Pune', region: 'Maharashtra', country: 'India' },
  { name: 'Jaipur', region: 'Rajasthan', country: 'India' },
  { name: 'Udaipur', region: 'Rajasthan', country: 'India' },
  { name: 'Indore', region: 'Madhya Pradesh', country: 'India' },
  { name: 'Bhopal', region: 'Madhya Pradesh', country: 'India' },
  { name: 'Lucknow', region: 'Uttar Pradesh', country: 'India' },
  { name: 'Chandigarh', region: 'Punjab', country: 'India' },
  { name: 'Goa', region: 'Goa', country: 'India' },
  { name: 'Kochi', region: 'Kerala', country: 'India' },
  { name: 'Shimla', region: 'Himachal Pradesh', country: 'India' },
  { name: 'Srinagar', region: 'Jammu & Kashmir', country: 'India' },

  // Key International Cities
  { name: 'Dubai', region: 'Dubai', country: 'UAE' },
  { name: 'London', region: 'England', country: 'UK' },
  { name: 'New York', region: 'New York', country: 'USA' },
  { name: 'Tokyo', region: 'Tokyo', country: 'Japan' },
  { name: 'Paris', region: 'Île-de-France', country: 'France' },
  { name: 'Singapore', region: 'Singapore', country: 'Singapore' },
  { name: 'Sydney', region: 'NSW', country: 'Australia' },
  { name: 'Toronto', region: 'Ontario', country: 'Canada' },
];

// New Glass Weather Components
import { WeatherHero } from '../components/weather/WeatherHero';
import { HourlyTemperatureChart } from '../components/weather/HourlyTemperatureChart';
import { DailyForecastGlass } from '../components/weather/DailyForecastGlass';
import { WeatherDetailsGrid } from '../components/weather/WeatherDetailsGrid';
import { AirQualityGlass } from '../components/weather/AirQualityGlass';
import { WeatherAlertsGlass } from '../components/weather/WeatherAlertsGlass';
import { Last7DaysHistoryGlass } from '../components/weather/Last7DaysHistoryGlass';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse text-white">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-white/15 rounded-2xl" />
          <div className="h-4 w-40 bg-white/10 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-white/15 rounded-xl" />
          <div className="h-10 w-36 bg-white/15 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-96 bg-white/15 rounded-3xl" />
        <div className="lg:col-span-8 h-96 bg-white/15 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 h-80 bg-white/15 rounded-3xl" />
        <div className="lg:col-span-6 h-80 bg-white/15 rounded-3xl" />
      </div>
    </div>
  );
}

function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="my-16 p-8 sm:p-12 glass-panel rounded-4xl max-w-md mx-auto text-center space-y-5 text-white">
      <div className="w-16 h-16 bg-white/15 text-rose-300 rounded-3xl flex items-center justify-center mx-auto border border-white/20">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-white">Weather data unavailable</h3>
        <p className="text-sm text-white/70 mt-1 leading-relaxed">
          Unable to fetch latest forecast details. Please try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-white text-[#1D4ED8] font-bold rounded-2xl hover:bg-white/90 transition-all shadow-md cursor-pointer inline-flex items-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry</span>
      </button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { convertTemp, tempUnitSymbol, profile, updateProfile } = useUserProfile();
  const { alerts } = useWeatherAlerts();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [show3DGlobe, setShow3DGlobe] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [timelineTab, setTimelineTab] = useState<'forecast' | 'history'>('forecast');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Filter suggestions dynamically
  const filteredSuggestions = citySearch.trim()
    ? POPULAR_CITIES.filter((c) =>
        c.name.toLowerCase().includes(citySearch.trim().toLowerCase()) ||
        c.region.toLowerCase().includes(citySearch.trim().toLowerCase()) ||
        c.country.toLowerCase().includes(citySearch.trim().toLowerCase())
      ).slice(0, 6)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Magnetic button hook via GSAP
  const locationBtnRef = useMagnetic(0.25);

  const fetchWeather = () => {
    setLoading(true);
    setError(false);
    const city = profile.location || 'Rajkot';
    getWeatherData(city)
      .then((res) => {
        if (!res || !res.current) {
          setError(true);
          setLoading(false);
          return;
        }
        setData(res);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWeather();
  }, [profile.location]);

  const handleSelectCity = (cityName: string) => {
    updateProfile({ location: cityName });
    setCitySearch('');
    setShowSuggestions(false);
  };

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    if (filteredSuggestions.length > 0) {
      handleSelectCity(filteredSuggestions[0].name);
    } else {
      updateProfile({ location: citySearch.trim() });
      setCitySearch('');
      setShowSuggestions(false);
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return <DashboardErrorState onRetry={fetchWeather} />;
  }

  const displayLocation = profile.location || `${data.location.name}, ${data.location.region || data.location.country}`;
  const currentLocationName = profile.location?.split(',')[0] || data.location.name || 'Morvi';

  return (
    <div className="relative space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Top Header & Search Bar Row */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-white"
      >
        {/* Date, Time & Coordinates */}
        <div className="flex items-center gap-4 text-xs sm:text-sm text-white/80 font-medium">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-white/70" />
            <span>{format(new Date(), 'EEEE, do MMM')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-white/70" />
            <span>{format(new Date(), 'h:mm a')}</span>
          </div>
        </div>

        {/* Action Controls: Search, My Location, 3D Radar, Export PDF */}
        <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto justify-start md:justify-end">
          {/* Quick City Search Bar with Suggestions */}
          <div ref={searchContainerRef} className="relative flex-1 sm:flex-initial">
            <form onSubmit={handleCitySearchSubmit} className="relative flex items-center">
              <Search className="absolute left-3.5 w-3.5 h-3.5 text-white/50 pointer-events-none" />
              <input
                type="text"
                value={citySearch}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setCitySearch(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder="Search city..."
                className="w-full sm:w-44 lg:w-56 pl-9 pr-3 py-1.5 text-xs rounded-full glass-input transition-all"
              />
            </form>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-2 py-1.5 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden z-50 min-w-[200px]"
                >
                  <div className="px-3 py-1 text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                    Suggestions
                  </div>
                  {filteredSuggestions.map((item) => (
                    <button
                      key={`${item.name}-${item.region}`}
                      type="button"
                      onClick={() => handleSelectCity(item.name)}
                      className="w-full px-3 py-2 text-left text-xs text-white/90 hover:bg-white/15 flex items-center justify-between transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-white truncate">{item.name}</span>
                      </div>
                      <span className="text-[10px] text-white/50 ml-2 shrink-0 truncate">
                        {item.region}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Detect Current Location Button */}
          <button
            ref={locationBtnRef}
            onClick={() => navigate('/map?locate=true')}
            className="px-3.5 py-1.5 rounded-full text-xs font-bold transition-all glass-pill hover:bg-white/20 text-white flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Detect current location"
          >
            <Compass className="w-3.5 h-3.5 text-sky-200" />
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Toggle 3D Globe Radar */}
          <button
            onClick={() => setShow3DGlobe(!show3DGlobe)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              show3DGlobe
                ? 'bg-white text-[#1D4ED8] shadow-md'
                : 'glass-pill hover:bg-white/20 text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{show3DGlobe ? 'Hide Globe' : '3D Radar'}</span>
          </button>

          {/* Export PDF Weather Report */}
          <button
            onClick={() => exportWeatherPDF({
              location: displayLocation,
              date: format(new Date(), 'EEEE, do MMM yyyy'),
              temp: `${convertTemp(data.current.temp_c)}°${tempUnitSymbol}`,
              condition: data.current.condition.text,
              humidity: data.current.humidity,
              wind: `${data.current.wind_kph} km/h NW`,
              pressure: `${data.current.pressure_mb} mb`,
              uv: data.current.uv,
              rainChance: data.forecast[0].chance_of_rain,
              forecast: data.forecast.map((f: any) => ({
                day: f.day,
                date: f.date,
                maxTemp: `${convertTemp(f.max_temp)}°`,
                minTemp: `${convertTemp(f.min_temp)}°`,
                condition: f.condition,
                rainChance: f.chance_of_rain
              }))
            })}
            className="px-3.5 py-1.5 glass-pill hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download formatted PDF weather report"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </motion.div>

      {/* 3D Global Weather Globe Visualizer Modal / Drawer */}
      <AnimatePresence>
        {show3DGlobe && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.95 }}
            animate={{ opacity: 1, height: 'auto', scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.95 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <WeatherGlobe3D className="mb-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================================== */}
      {/* ROW 1: CURRENT WEATHER HERO & HOURLY FORECAST + TEMPERATURE CHART     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* LEFT: Current Weather Hero (Seamless Sky Blend) */}
        <div className="lg:col-span-4 h-full">
          <WeatherHero
            className="h-full"
            locationName={currentLocationName}
            region={data.location.region || data.location.country}
            condition={data.current.condition.text}
            temp={convertTemp(data.current.temp_c)}
            tempUnit={tempUnitSymbol}
            minTemp={convertTemp(data.forecast[0].min_temp)}
            maxTemp={convertTemp(data.forecast[0].max_temp)}
            feelsLike={convertTemp(data.current.feelslike_c)}
            pm25={13}
          />
        </div>

        {/* CENTER / RIGHT: Hourly Forecast & Smooth Temperature Spline Curve */}
        <div className="lg:col-span-8 h-full">
          <HourlyTemperatureChart
            className="h-full"
            hourlyData={data.hourly}
            convertTemp={convertTemp}
            tempUnit={tempUnitSymbol}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ROW 2: TIMELINE (7-DAY FORECAST / LAST 7 DAYS HISTORY) & METRICS      */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 7-Day Forecast or Past 7 Days History with Pill Toggle Switcher */}
        <div className="lg:col-span-7 space-y-3">
          {/* Timeline Tab Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl glass-panel text-white w-fit border border-white/10 shadow-xs">
            <button
              onClick={() => setTimelineTab('forecast')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                timelineTab === 'forecast'
                  ? 'bg-white text-[#1D4ED8] shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>🔮 7-Day Forecast</span>
            </button>

            <button
              onClick={() => setTimelineTab('history')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                timelineTab === 'history'
                  ? 'bg-white text-[#1D4ED8] shadow-md'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>📜 Last 7 Days History</span>
            </button>
          </div>

          {/* Conditional Animation View */}
          <AnimatePresence mode="wait">
            {timelineTab === 'forecast' ? (
              <motion.div
                key="forecast"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <DailyForecastGlass
                  forecastData={data.forecast}
                  convertTemp={convertTemp}
                  tempUnit={tempUnitSymbol}
                />
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <Last7DaysHistoryGlass
                  historyData={data.history7Days || []}
                  convertTemp={convertTemp}
                  tempUnit={tempUnitSymbol}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Weather Details, Air Quality & Weather Alerts Stack */}
        <div className="lg:col-span-5 space-y-6">
          {/* 8 Compact Glass Metric Details */}
          <WeatherDetailsGrid
            feelsLike={convertTemp(data.current.feelslike_c)}
            tempUnit={tempUnitSymbol}
            humidity={data.current.humidity}
            windSpeed={data.current.wind_kph}
            windDirection="NW"
            uvIndex={data.current.uv}
            visibilityKm={data.current.visibility_km}
            pressureMb={data.current.pressure_mb}
            precipMm={data.current.precip_mm || 0.0}
            rainProbability={data.forecast[0].chance_of_rain}
          />

        </div>
      </div>

      {/* ===================================================================== */}
      {/* ROW 3: AIR QUALITY & WEATHER ALERTS                                   */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AirQualityGlass
          score={50}
          pm25={9.4}
          pm10={18.1}
          statusText="Satisfactory"
          className="h-full"
        />

        <WeatherAlertsGlass alerts={alerts} className="h-full" />
      </div>



    </div>
  );
}
