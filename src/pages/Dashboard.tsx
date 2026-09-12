import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  CloudRain, 
  Sun, 
  Droplets, 
  Wind, 
  Eye, 
  CloudLightning, 
  Leaf, 
  Car, 
  AlertTriangle,
  Globe2,
  Sparkles,
  Download,
  RefreshCw,
  Compass
} from 'lucide-react';
import { cn } from '../utils/cn';
import { getWeatherData } from '../services/weatherService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { WeatherStatCard } from '../components/WeatherStatCard';
import { format } from 'date-fns';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { Weather3DCanvas, type Weather3DMode } from '../components/3d/Weather3DCanvas';
import { WeatherGlobe3D } from '../components/3d/WeatherGlobe3D';
import { WeatherOrb3D } from '../components/3d/WeatherOrb3D';
import { AQICard } from '../components/AQICard';
import { LightningTracker } from '../components/LightningTracker';
import { exportWeatherPDF } from '../utils/exportReports';
import { useMagnetic } from '../utils/gsapEffects';
import { motion, AnimatePresence } from 'motion/react';
import { CircularGauge } from '../components/ui/CircularGauge';

function DashboardSkeleton() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-muted rounded-2xl" />
          <div className="h-4 w-40 bg-muted/80 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 bg-muted rounded-xl" />
          <div className="h-10 w-36 bg-muted rounded-xl" />
        </div>
      </div>

      {/* Grid: Hero Skeleton & Stat Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 h-80 bg-muted rounded-4xl" />
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-36 bg-muted rounded-3xl" />
          ))}
        </div>
      </div>

      {/* Forecast Skeleton */}
      <div className="h-56 bg-muted rounded-4xl" />
    </div>
  );
}

function DashboardErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="my-16 p-8 sm:p-12 bg-card border border-border/80 rounded-4xl shadow-sm max-w-md mx-auto text-center space-y-5">
      <div className="w-16 h-16 bg-red-500/10 text-red-600 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-xl font-bold text-foreground">Weather data unavailable</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
          Unable to fetch latest forecast details. Please try again.
        </p>
      </div>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 bg-[#123F2B] dark:bg-[#1E4D37] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xs cursor-pointer inline-flex items-center gap-2 text-sm"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Retry</span>
      </button>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { convertTemp, tempUnitSymbol, profile } = useUserProfile();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [active3DMode, setActive3DMode] = useState<Weather3DMode>('rain');
  const [show3DGlobe, setShow3DGlobe] = useState(false);

  // Magnetic button hooks via GSAP
  const locationBtnRef = useMagnetic(0.25);

  const fetchWeather = () => {
    setLoading(true);
    setError(false);
    getWeatherData()
      .then(res => {
        if (!res || !res.current) {
          setError(true);
          setLoading(false);
          return;
        }
        setData(res);
        const cond = res?.current?.condition?.text?.toLowerCase() || '';
        if (cond.includes('sun') || cond.includes('clear')) setActive3DMode('sun');
        else if (cond.includes('cloud')) setActive3DMode('clouds');
        else if (cond.includes('wind')) setActive3DMode('wind');
        else if (cond.includes('snow')) setActive3DMode('snow');
        else setActive3DMode('rain');
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return <DashboardErrorState onRetry={fetchWeather} />;
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'rain': return CloudRain;
      case 'car': return Car;
      case 'leaf': return Leaf;
      default: return AlertTriangle;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const displayLocation = profile.location || `${data.location.name}, ${data.location.region || data.location.country}`;

  // Condition-adaptive background gradient for Hero card
  const getWeatherHeroGradient = (condition: string) => {
    const cond = condition.toLowerCase();
    if (cond.includes('sun') || cond.includes('clear')) {
      return 'bg-gradient-to-br from-[#FAF8EE] via-[#F3ECD9] to-[#E8D9B6] dark:from-[#1D2218] dark:to-[#141810] text-[#101226] dark:text-[#F5F7F3] border-[#E2D6BA] dark:border-[#283020]';
    } else if (cond.includes('rain') || cond.includes('drizzle')) {
      return 'bg-gradient-to-br from-[#123F2B] via-[#1A4B36] to-[#255C44] text-white border-[#2A6147] shadow-xl';
    } else if (cond.includes('storm') || cond.includes('thunder')) {
      return 'bg-gradient-to-br from-[#0B2F20] via-[#101226] to-[#162332] text-white border-[#1F3E32] shadow-xl';
    } else {
      // Cloudy / Default
      return 'bg-gradient-to-br from-[#EEF2EA] via-[#E2EBE0] to-[#D5E3D2] dark:from-[#14251C] dark:to-[#182E22] text-[#101226] dark:text-[#F5F7F3] border-[#CBDBC7] dark:border-[#1E3A2B]';
    }
  };

  return (
    <div className="relative space-y-6 sm:space-y-8 pb-8 animate-in fade-in duration-500">
      {/* Ambient 3D WebGL Canvas (Optional/Collapsible style) */}
      <Weather3DCanvas 
        initialMode={active3DMode} 
        showControls={false}
        className="rounded-4xl border border-border/60 shadow-xs mb-2"
      />

      {/* Top Header & Quick Actions */}
      <motion.div 
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-foreground font-extrabold text-2xl tracking-tight">
            <MapPin className="w-5 h-5 text-[#123F2B] dark:text-emerald-400" />
            <h2>{displayLocation}</h2>
          </div>
          <div className="flex items-center gap-4 mt-1 text-xs sm:text-sm text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{format(new Date(), 'EEEE, do MMM')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{format(new Date(), 'h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Location button with GSAP magnetic physics */}
          <button 
            ref={locationBtnRef}
            onClick={() => navigate('/map?locate=true')}
            className="px-4 py-2 bg-muted hover:bg-accent text-foreground font-bold rounded-2xl transition-all shadow-2xs flex items-center gap-2 text-xs cursor-pointer"
            title="Detect current location"
          >
            <Compass className="w-4 h-4 text-[#123F2B] dark:text-emerald-400" />
            <span>Current location</span>
          </button>

          {/* Toggle 3D Globe Visualizer */}
          <button
            onClick={() => setShow3DGlobe(!show3DGlobe)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer ${
              show3DGlobe 
                ? 'bg-[#123F2B] text-white shadow-md' 
                : 'bg-card hover:bg-muted border border-border/80 text-foreground'
            }`}
          >
            <Globe2 className="w-4 h-4" />
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
            className="px-3.5 py-2 bg-card hover:bg-muted border border-border/80 text-foreground rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
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

      {/* HERO SECTION & METRICS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Large Rounded Hero Weather Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="lg:col-span-1"
        >
          <div className={cn(
            "h-full rounded-4xl border p-7 sm:p-8 flex flex-col justify-between relative overflow-hidden transition-all duration-300",
            getWeatherHeroGradient(data.current.condition.text)
          )}>
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">{data.location.name}</h3>
                  <p className="text-xs opacity-75 font-medium">{data.location.region || data.location.country}</p>
                </div>
                <span className="text-xs px-3 py-1 bg-black/10 dark:bg-white/10 rounded-full font-bold border border-black/10 dark:border-white/10">
                  {tempUnitSymbol}
                </span>
              </div>

              {/* Temperature & Orb */}
              <div className="flex items-center justify-between gap-4 my-6">
                <div>
                  <div className="flex items-baseline gap-1">
                    <h1 className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-xs">
                      {convertTemp(data.current.temp_c)}°
                    </h1>
                  </div>
                  <p className="text-xl font-bold mt-1 opacity-90">
                    {data.current.condition.text}
                  </p>
                </div>

                <WeatherOrb3D condition={data.current.condition.text} />
              </div>
            </div>

            {/* Weather Metrics Footer inside Hero */}
            <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/15 text-xs font-semibold opacity-90">
              <span>Feels like {convertTemp(data.current.feelslike_c)}°</span>
              <div className="flex gap-2">
                <span>H: {convertTemp(data.forecast[0].max_temp)}°</span>
                <span>L: {convertTemp(data.forecast[0].min_temp)}°</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6 WEATHER METRICS GRID */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <WeatherStatCard 
            index={0}
            icon={Droplets} 
            label={t('rain_prob', 'Rain probability')} 
            value={data.forecast[0].chance_of_rain} 
            unit="%" 
            description="Afternoon chance" 
          />
          <WeatherStatCard 
            index={1}
            icon={Droplets} 
            label={t('humidity', 'Humidity')} 
            value={data.current.humidity} 
            unit="%" 
            description={`Dew point ${convertTemp(22)}°`} 
          />
          <WeatherStatCard 
            index={2}
            icon={Wind} 
            label={t('wind_speed', 'Wind')} 
            value={data.current.wind_kph} 
            unit="km/h" 
            description="NW Direction" 
          />
          <WeatherStatCard 
            index={3}
            icon={CloudLightning} 
            label={t('pressure', 'Pressure')} 
            value={data.current.pressure_mb} 
            unit="mb" 
            description="Rising slowly" 
          />
          <WeatherStatCard 
            index={4}
            icon={Eye} 
            label={t('visibility', 'Visibility')} 
            value={data.current.visibility_km} 
            unit="km" 
            description="Clear view" 
          />
          <WeatherStatCard 
            index={5}
            icon={Sun} 
            label={t('uv_index', 'UV Index')} 
            value={data.current.uv} 
            unit="" 
            description="Moderate" 
          />
        </div>
      </div>

      {/* Live AQI Score & Lightning Radar Proximity Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AQICard score={64} />
        <LightningTracker />
      </div>

      {/* HOURLY FORECAST SECTION */}
      <Card className="rounded-4xl border border-border/70 shadow-xs">
        <CardHeader className="p-6 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-foreground">Hourly forecast</CardTitle>
            <span className="text-xs font-semibold text-muted-foreground">{tempUnitSymbol}</span>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="flex overflow-x-auto pb-3 gap-3.5 hide-scrollbar snap-x">
            {data.hourly.map((hour: any, idx: number) => {
              const isCurrentHour = idx === 1; // Highlight active hour cleanly
              return (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  whileHover={{ y: -3 }}
                  className={cn(
                    "flex flex-col items-center justify-between p-4 rounded-3xl min-w-[100px] snap-center transition-all cursor-pointer",
                    isCurrentHour 
                      ? "bg-[#123F2B] text-white shadow-md" 
                      : "bg-muted/50 hover:bg-muted text-foreground border border-border/40"
                  )}
                >
                  <span className={cn("text-xs font-bold", isCurrentHour ? "text-emerald-100" : "text-muted-foreground")}>{hour.time}</span>
                  <div className="my-3">
                    {hour.icon.includes('rain') ? (
                      <CloudRain className={cn("w-7 h-7", isCurrentHour ? "text-emerald-300 animate-pulse" : "text-[#6FA8C9]")} />
                    ) : (
                      <Sun className={cn("w-7 h-7", isCurrentHour ? "text-amber-300" : "text-[#E7B85C]")} />
                    )}
                  </div>
                  <span className="text-lg font-extrabold">{convertTemp(hour.temp_c)}°</span>
                  <div className={cn("flex items-center gap-1 mt-1 text-[11px] font-bold", isCurrentHour ? "text-emerald-200" : "text-[#6FA8C9]")}>
                    <Droplets className="w-3 h-3" />
                    <span>{hour.chance_of_rain}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI INSIGHTS & DAILY FORECAST GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TODAY'S INSIGHT SECTION */}
        <Card className="lg:col-span-1 rounded-4xl border border-border/70 shadow-xs">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Sparkles className="w-4 h-4 text-[#123F2B] dark:text-emerald-400" />
              <span>Today's insight</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-2 space-y-3">
            {data.insights.map((insight: any, idx: number) => {
              const Icon = getInsightIcon(insight.icon);
              return (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.01 }}
                  className={cn("p-4 rounded-2xl border transition-all", getInsightColor(insight.type))}
                >
                  <div className="flex items-center gap-2 font-bold text-xs mb-1">
                    <Icon className="w-4 h-4" />
                    {insight.title}
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">{insight.message}</p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>

        {/* CLEAN 7-DAY FORECAST */}
        <Card className="lg:col-span-2 rounded-4xl border border-border/70 shadow-xs">
          <CardHeader className="p-6 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-foreground">7-Day forecast</CardTitle>
              <span className="text-xs font-semibold text-muted-foreground">{tempUnitSymbol}</span>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-2">
            <div className="divide-y divide-border/50">
              {data.forecast.map((day: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="py-3.5 flex items-center justify-between px-2 hover:bg-muted/40 rounded-2xl transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-1/4">
                    <span className="font-bold text-sm text-foreground">{day.day}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{day.date.split('-').reverse().slice(0,2).join('/')}</span>
                  </div>
                  <div className="flex items-center gap-2.5 w-1/4 justify-center">
                    {day.condition.includes('Rain') ? (
                      <CloudRain className="w-5 h-5 text-[#6FA8C9]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#E7B85C]" />
                    )}
                    <span className="text-xs font-medium hidden md:inline text-foreground">{day.condition}</span>
                  </div>
                  <div className="flex items-center gap-1 w-1/4 justify-center text-[#6FA8C9] text-xs font-bold">
                    <Droplets className="w-3.5 h-3.5" />
                    <span>{day.chance_of_rain}%</span>
                  </div>
                  <div className="flex items-center gap-3 w-1/4 justify-end font-bold text-sm">
                    <span className="text-foreground">{convertTemp(day.max_temp)}°</span>
                    <span className="text-muted-foreground text-xs">{convertTemp(day.min_temp)}°</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Risk & Vulnerability Gauges */}
      <Card className="rounded-4xl border border-border/70 shadow-xs">
        <CardHeader className="p-6 pb-2">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Weather Risk & Safety Indicators
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-2">
            <CircularGauge value={85} max={100} title="Overall Risk" color="text-amber-600" icon={<AlertTriangle className="w-5 h-5" />} size={110} strokeWidth={7} />
            <CircularGauge value={70} max={100} title="Flood Risk" color="text-blue-500" icon={<Droplets className="w-5 h-5" />} size={110} strokeWidth={7} />
            <CircularGauge value={45} max={100} title="Heat Index" color="text-amber-500" icon={<Sun className="w-5 h-5" />} size={110} strokeWidth={7} />
            <CircularGauge value={90} max={100} title="Wind Gusts" color="text-teal-600" icon={<Wind className="w-5 h-5" />} size={110} strokeWidth={7} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
