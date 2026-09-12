import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Search, 
  Compass, 
  Globe2, 
  Download, 
  RefreshCw, 
  AlertTriangle 
} from 'lucide-react';
import { getWeatherData } from '../services/weatherService';
import { format } from 'date-fns';
import { useUserProfile } from '../hooks/useUserProfile';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { WeatherGlobe3D } from '../components/3d/WeatherGlobe3D';
import { exportWeatherPDF } from '../utils/exportReports';
import { useMagnetic } from '../utils/gsapEffects';
import { motion, AnimatePresence } from 'motion/react';

// New Glass Weather Components
import { WeatherHero } from '../components/weather/WeatherHero';
import { HourlyTemperatureChart } from '../components/weather/HourlyTemperatureChart';
import { DailyForecastGlass } from '../components/weather/DailyForecastGlass';
import { WeatherDetailsGrid } from '../components/weather/WeatherDetailsGrid';
import { AirQualityGlass } from '../components/weather/AirQualityGlass';
import { WeatherAlertsGlass } from '../components/weather/WeatherAlertsGlass';
import { YesterdayWeatherGlass } from '../components/weather/YesterdayWeatherGlass';

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

  const handleCitySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citySearch.trim()) return;
    updateProfile({ location: citySearch.trim() });
    setCitySearch('');
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
          {/* Quick City Search Bar */}
          <form onSubmit={handleCitySearchSubmit} className="relative flex items-center flex-1 sm:flex-initial">
            <Search className="absolute left-3.5 w-3.5 h-3.5 text-white/50 pointer-events-none" />
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="Search city..."
              className="w-full sm:w-44 lg:w-56 pl-9 pr-3 py-1.5 text-xs rounded-full glass-input transition-all"
            />
          </form>

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
        <div className="lg:col-span-4 flex flex-col justify-between py-2 sm:py-4">
          <WeatherHero
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
        <div className="lg:col-span-8 flex flex-col justify-center">
          <HourlyTemperatureChart
            hourlyData={data.hourly}
            convertTemp={convertTemp}
            tempUnit={tempUnitSymbol}
          />
        </div>
      </div>

      {/* ===================================================================== */}
      {/* ROW 2: DAILY FORECAST (LEFT) & WEATHER DETAILS + AQI + ALERTS (RIGHT) */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* 7-Day Glass Daily Forecast */}
        <div className="lg:col-span-7">
          <DailyForecastGlass
            forecastData={data.forecast}
            convertTemp={convertTemp}
            tempUnit={tempUnitSymbol}
          />
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
      {/* ROW 3: YESTERDAY'S WEATHER & HISTORICAL COMPARISON TELEMETRY          */}
      {/* ===================================================================== */}
      {data.yesterday && (
        <YesterdayWeatherGlass
          yesterdayData={data.yesterday}
          todayTempC={data.current.temp_c}
          todayHumidity={data.current.humidity}
          todayPrecipMm={data.current.precip_mm || 0.0}
          todayWindKph={data.current.wind_kph}
          convertTemp={convertTemp}
          tempUnit={tempUnitSymbol}
        />
      )}

      {/* ===================================================================== */}
      {/* ROW 4: AIR QUALITY & WEATHER ALERTS                                   */}
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
