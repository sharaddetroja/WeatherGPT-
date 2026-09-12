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
  Download
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
import { KisanAdvisoryCard } from '../components/KisanAdvisoryCard';
import { CircularGauge } from '../components/ui/CircularGauge';
import { HourlyCurveChart } from '../components/HourlyCurveChart';

export default function Dashboard() {
  const navigate = useNavigate();
  const { convertTemp, tempUnitSymbol, profile } = useUserProfile();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active3DMode, setActive3DMode] = useState<Weather3DMode>('rain');
  const [show3DGlobe, setShow3DGlobe] = useState(false);

  // Magnetic button hooks via GSAP
  const locationBtnRef = useMagnetic(0.25);
  const radarBtnRef = useMagnetic(0.3);
  const windBtnRef = useMagnetic(0.3);

  useEffect(() => {
    getWeatherData().then(res => {
      setData(res);
      const cond = res?.current?.condition?.text?.toLowerCase() || '';
      if (cond.includes('sun') || cond.includes('clear')) setActive3DMode('sun');
      else if (cond.includes('cloud')) setActive3DMode('clouds');
      else if (cond.includes('wind')) setActive3DMode('wind');
      else if (cond.includes('snow')) setActive3DMode('snow');
      else setActive3DMode('rain');
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="flex flex-col items-center gap-4 text-primary"
        >
          <CloudRain className="w-16 h-16 animate-bounce" />
          <p className="text-lg font-bold text-muted-foreground">Initializing 3D Weather Environment...</p>
        </motion.div>
      </div>
    );
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
      case 'warning': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'info': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'success': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const displayLocation = profile.location || `${data.location.name}, ${data.location.country}`;

  return (
    <div className="relative space-y-6 pb-8 animate-in fade-in duration-500">
      {/* ========================================================================= */}
      {/* 3D WebGL Atmospheric Canvas Engine (Three.js)                             */}
      {/* ========================================================================= */}
      <Weather3DCanvas 
        initialMode={active3DMode} 
        showControls={false}
        className="rounded-3xl border border-border/60 shadow-xl mb-4"
      />

      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <MapPin className="w-6 h-6 animate-pulse" />
            <h2>{displayLocation}</h2>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary/70" />
              <span>{format(new Date(), 'EEEE, do MMM')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary/70" />
              <span>{format(new Date(), 'h:mm a')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
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
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            title="Download formatted PDF weather report"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          {/* Toggle 3D Globe Visualizer */}
          <button
            onClick={() => setShow3DGlobe(!show3DGlobe)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
              show3DGlobe 
                ? 'bg-primary text-primary-foreground shadow-md scale-105' 
                : 'bg-card hover:bg-muted border border-border text-foreground'
            }`}
          >
            <Globe2 className="w-4 h-4 text-primary" />
            <span>{show3DGlobe ? 'Hide 3D Globe' : '3D Global Radar'}</span>
          </button>

          {/* Location button with GSAP magnetic physics */}
          <button 
            ref={locationBtnRef}
            onClick={() => navigate('/map?locate=true')}
            className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
            title="Detect location and shift to interactive map"
          >
            <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Use my location</span>
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
            transition={{ duration: 0.45, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <WeatherGlobe3D className="mb-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time Advisory Banners (Clean, minimal design) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rainfront Alert Card */}
        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Monsoon Rainfront</span>
                <span className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold px-2 py-0.5 rounded-full">Rain Expected</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Moderate precipitation in Saurashtra region.</p>
            </div>
          </div>
          <button
            ref={radarBtnRef}
            onClick={() => navigate('/map?effect=rain&zone=rain-rajkot')}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer"
          >
            Rain Radar
          </button>
        </div>

        {/* Wind Advisory Card */}
        <div className="p-4 rounded-2xl bg-teal-500/5 border border-teal-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">Wind Advisory</span>
                <span className="text-[10px] bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold px-2 py-0.5 rounded-full">62 km/h</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">Coastal wind squalls reported nearby.</p>
            </div>
          </div>
          <button
            ref={windBtnRef}
            onClick={() => navigate('/map?effect=wind&zone=wind-saurashtra-coast')}
            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold transition-all flex-shrink-0 cursor-pointer"
          >
            Wind Flow
          </button>
        </div>
      </div>

      {/* Kisan / Smart Crop Advisory Tab */}
      <KisanAdvisoryCard location={displayLocation} language="gu" />

      {/* Main Grid: Hero 3D Card & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Weather Card with 3D Holographic Object */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300 } }}
          className="lg:col-span-1"
        >
          <Card className="h-full bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground border-none shadow-2xl relative overflow-hidden">
            <CardContent className="p-7 relative z-10 flex flex-col h-full justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-primary-foreground/90 font-semibold text-xs tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Live 3D Hologram</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 bg-primary-foreground/20 rounded-full font-extrabold border border-primary-foreground/30">
                    {tempUnitSymbol}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 my-2">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <h1 className="text-6xl sm:text-7xl font-black tracking-tighter drop-shadow-md">
                        {convertTemp(data.current.temp_c)}°
                      </h1>
                      <span className="text-2xl font-bold text-primary-foreground/80">{tempUnitSymbol}</span>
                    </div>
                    <p className="text-xl font-bold mt-2 text-primary-foreground drop-shadow-xs">
                      {data.current.condition.text}
                    </p>
                  </div>

                  {/* 3D Holographic Condition Object */}
                  <WeatherOrb3D condition={data.current.condition.text} />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-primary-foreground/20 text-primary-foreground/90 text-xs font-semibold">
                  <span className="px-2 py-1 bg-black/15 rounded-lg">H: {convertTemp(data.forecast[0].max_temp)}°</span>
                  <span className="px-2 py-1 bg-black/15 rounded-lg">L: {convertTemp(data.forecast[0].min_temp)}°</span>
                  <span className="px-2 py-1 bg-black/15 rounded-lg">Feels like {convertTemp(data.current.feelslike_c)}°</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Grid with Motion Spring Physics */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <WeatherStatCard 
            index={0}
            icon={Droplets} 
            label={t('humidity', 'Humidity')} 
            value={data.current.humidity} 
            unit="%" 
            description={`The dew point is ${convertTemp(22)}° right now`} 
          />
          <WeatherStatCard 
            index={1}
            icon={Wind} 
            label={t('wind_speed', 'Wind Speed')} 
            value={data.current.wind_kph} 
            unit="km/h" 
            description="Wind direction is NW" 
          />
          <WeatherStatCard 
            index={2}
            icon={CloudRain} 
            label={t('rain_prob', 'Rain Prob.')} 
            value={data.forecast[0].chance_of_rain} 
            unit="%" 
            description="Expected in afternoon" 
          />
          <WeatherStatCard 
            index={3}
            icon={Eye} 
            label={t('visibility', 'Visibility')} 
            value={data.current.visibility_km} 
            unit="km" 
            description="It's clear right now" 
          />
          <WeatherStatCard 
            index={4}
            icon={Sun} 
            label={t('uv_index', 'UV Index')} 
            value={data.current.uv} 
            unit="" 
            description="Moderate level today" 
          />
          <WeatherStatCard 
            index={5}
            icon={CloudLightning} 
            label={t('pressure', 'Pressure')} 
            value={data.current.pressure_mb} 
            unit="mb" 
            description="Rising slowly" 
          />
        </div>
      </div>

      {/* AI Risk Dashboard */}
      <Card className="shadow-lg border-red-500/10 bg-gradient-to-tr from-background to-red-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            AI Risk & Vulnerability Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 py-4">
            <CircularGauge value={85} max={100} title="Overall Risk" color="text-red-500" icon={<AlertTriangle className="w-5 h-5" />} size={120} strokeWidth={8} />
            <CircularGauge value={70} max={100} title="Flood Risk" color="text-blue-500" icon={<Droplets className="w-5 h-5" />} size={120} strokeWidth={8} />
            <CircularGauge value={45} max={100} title="Heat Wave" color="text-amber-500" icon={<Sun className="w-5 h-5" />} size={120} strokeWidth={8} />
            <CircularGauge value={90} max={100} title="Wind Gale" color="text-teal-500" icon={<Wind className="w-5 h-5" />} size={120} strokeWidth={8} />
          </div>
        </CardContent>
      </Card>

      {/* Live AQI Score & Lightning Radar Proximity Tracker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AQICard score={64} />
        <LightningTracker />
      </div>

      {/* AI Insights & Hourly Curve Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HourlyCurveChart hourly={data.hourly} className="lg:col-span-2 shadow-lg" />

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">{t('ai_insights', 'AI Insights')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.insights.map((insight: any, idx: number) => {
              const Icon = getInsightIcon(insight.icon);
              return (
                <motion.div 
                  key={idx} 
                  whileHover={{ scale: 1.02 }}
                  className={cn("p-4 rounded-2xl border transition-all shadow-2xs", getInsightColor(insight.type))}
                >
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <Icon className="w-4 h-4" />
                    {insight.title}
                  </div>
                  <p className="text-xs leading-relaxed opacity-95">{insight.message}</p>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 7 Day Forecast */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('seven_day_forecast', '7-Day Forecast')}</CardTitle>
            <span className="text-xs font-bold text-muted-foreground">Unit: {tempUnitSymbol}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/60">
            {data.forecast.map((day: any, idx: number) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.04 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)', x: 4 }}
                className="py-4 flex items-center justify-between px-2 rounded-xl transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4 w-1/4">
                  <span className="font-bold min-w-[3rem] text-foreground">{day.day}</span>
                  <span className="text-xs text-muted-foreground hidden sm:block">{day.date.split('-').reverse().slice(0,2).join('/')}</span>
                </div>
                <div className="flex items-center gap-3 w-1/4 justify-center">
                  {day.condition.includes('Rain') ? (
                    <CloudRain className="w-6 h-6 text-blue-500 animate-pulse" />
                  ) : (
                    <Sun className="w-6 h-6 text-amber-500" />
                  )}
                  <span className="text-sm font-semibold hidden md:block text-foreground">{day.condition}</span>
                </div>
                <div className="flex items-center gap-2 w-1/4 justify-center text-blue-500 text-sm font-bold">
                  <Droplets className="w-4 h-4" />
                  <span>{day.chance_of_rain}%</span>
                </div>
                <div className="flex items-center gap-3 w-1/4 justify-end font-bold text-sm">
                  <span className="text-foreground">{convertTemp(day.max_temp)}°</span>
                  <span className="text-muted-foreground">{convertTemp(day.min_temp)}°</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
