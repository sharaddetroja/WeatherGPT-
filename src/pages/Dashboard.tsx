import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Activity, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Clock, 
  CloudRain, 
  Sun, 
  Droplets, 
  Wind, 
  Eye, 
  CloudLightning, 
  Sparkles, 
  Download,
  Send,
  ArrowRight,
  Compass,
  TrendingUp,
  History
} from 'lucide-react';
import { getWeatherData } from '../services/weatherService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { WeatherStatCard } from '../components/WeatherStatCard';
import { format } from 'date-fns';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { WeatherOrb3D } from '../components/3d/WeatherOrb3D';
import { exportWeatherPDF } from '../utils/exportReports';
import { motion } from 'motion/react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { convertTemp, tempUnitSymbol, profile } = useUserProfile();
  const { t } = useLanguage();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [aiPrompt, setAiPrompt] = useState('');

  useEffect(() => {
    getWeatherData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  const handleAiSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) return;
    navigate(`/assistant?prompt=${encodeURIComponent(aiPrompt.trim())}`);
  };

  const handleQuickPillClick = (promptText: string) => {
    navigate(`/assistant?prompt=${encodeURIComponent(promptText)}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[65vh]">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, repeat: Infinity, repeatType: 'reverse' }}
          className="flex flex-col items-center gap-3 text-primary"
        >
          <CloudRain className="w-12 h-12 animate-bounce text-primary" />
          <p className="text-sm font-semibold text-muted-foreground">Loading WeatherGPT...</p>
        </motion.div>
      </div>
    );
  }

  const displayLocation = profile.location || `${data.location.name}, ${data.location.country}`;

  const quickPrompts = [
    "Will it rain today?",
    "7-Day Weather Outlook",
    "What should I wear?",
    "Air Quality & Outdoor advice"
  ];

  // Useful High-Level Summary Metrics
  const summaryMetrics = [
    {
      title: 'Total Users',
      value: '14,280+',
      change: '+12% this month',
      icon: Users,
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      title: 'Weather Queries',
      value: '128,450+',
      change: 'Real-time AI queries',
      icon: MessageSquare,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
    {
      title: 'Active Users',
      value: '1,840',
      change: 'Live online now',
      icon: Activity,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'System Health',
      value: '99.9%',
      change: 'Operational',
      icon: ShieldCheck,
      color: 'text-primary bg-primary/10',
    },
  ];

  // Small useful recent activity data
  const recentActivities = [
    { title: 'Rain Radar Check', location: 'Rajkot, Gujarat', time: '2 mins ago', type: 'Radar' },
    { title: 'AI Forecast Query', location: 'Ahmedabad, Gujarat', time: '8 mins ago', type: 'AI Chat' },
    { title: 'Severe Wind Alert', location: 'Saurashtra Coast', time: '15 mins ago', type: 'Advisory' },
    { title: 'Temperature Search', location: 'Mumbai, Maharashtra', time: '28 mins ago', type: 'Search' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-8 animate-in fade-in duration-400">
      
      {/* 1. Header & Location Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2 text-foreground font-bold text-xl sm:text-2xl tracking-tight">
            <MapPin className="w-5 h-5 text-primary" />
            <span>{displayLocation}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{format(new Date(), 'EEEE, do MMMM')}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>{format(new Date(), 'h:mm a')}</span>
            </div>
          </div>
        </div>

        {/* Utility Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <button 
            onClick={() => navigate('/map?locate=true')}
            className="px-3.5 py-2 bg-muted/60 hover:bg-muted text-foreground font-semibold rounded-xl text-xs transition-colors border border-border/60 flex items-center gap-1.5 cursor-pointer"
            title="Use current GPS location"
          >
            <Compass className="w-3.5 h-3.5 text-primary" />
            <span>Detect Location</span>
          </button>

          <button
            onClick={() => exportWeatherPDF({
              location: displayLocation,
              date: format(new Date(), 'EEEE, do MMM yyyy'),
              temp: `${convertTemp(data.current.temp_c)}°${tempUnitSymbol}`,
              condition: data.current.condition.text,
              humidity: data.current.humidity,
              wind: `${data.current.wind_kph} km/h`,
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
            className="px-3.5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-xs font-semibold transition-colors border border-primary/20 flex items-center gap-1.5 cursor-pointer"
            title="Download PDF report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. High-Level Summary Metrics Cards (Total Users, Total Queries, Active Users, System Health) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryMetrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <Card key={idx} className="shadow-2xs hover:shadow-xs transition-all">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className={`p-3 rounded-2xl flex-shrink-0 ${metric.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground truncate">{metric.title}</p>
                  <h3 className="text-lg font-bold text-foreground tracking-tight">{metric.value}</h3>
                  <span className="text-[10px] text-muted-foreground font-semibold">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 3. Prominent AI Weather Chat Bar */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-blue-500/10 border-primary/20 shadow-xs overflow-hidden">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Ask WeatherGPT AI Assistant</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">
              Instant AI Weather Answers
            </span>
          </div>

          <form onSubmit={handleAiSubmit} className="relative flex items-center">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Ask about the weather, forecasts, clothing recommendations..."
              className="w-full bg-background border border-border focus:border-primary rounded-2xl py-3 pl-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all shadow-xs"
            />
            <button
              type="submit"
              disabled={!aiPrompt.trim()}
              className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-xl disabled:opacity-40 hover:bg-primary/90 transition-all cursor-pointer shadow-2xs"
              title="Ask AI"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Prompt Suggestions */}
          <div className="flex items-center gap-2 overflow-x-auto pt-0.5 pb-0.5 hide-scrollbar">
            <span className="text-[11px] text-muted-foreground font-semibold flex-shrink-0">Suggestions:</span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPillClick(prompt)}
                className="px-3 py-1 bg-background hover:bg-muted border border-border/70 rounded-full text-xs font-medium text-foreground hover:text-primary transition-all flex-shrink-0 cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 4. Main Weather Overview Card & Key Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Primary Current Weather Card */}
        <Card className="lg:col-span-1 bg-card border-border shadow-xs relative overflow-hidden flex flex-col justify-between">
          <CardContent className="p-6 relative z-10 flex flex-col h-full justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Conditions
                </span>
                <span className="text-xs px-2.5 py-0.5 bg-muted rounded-full font-bold text-foreground">
                  {tempUnitSymbol}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 my-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-black text-foreground tracking-tighter">
                      {convertTemp(data.current.temp_c)}°
                    </span>
                    <span className="text-2xl font-bold text-muted-foreground">{tempUnitSymbol}</span>
                  </div>
                  <p className="text-lg font-bold text-foreground mt-1">
                    {data.current.condition.text}
                  </p>
                </div>

                <WeatherOrb3D condition={data.current.condition.text} />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/60 text-xs font-medium text-muted-foreground">
              <span>High: <strong className="text-foreground">{convertTemp(data.forecast[0].max_temp)}°</strong></span>
              <span>Low: <strong className="text-foreground">{convertTemp(data.forecast[0].min_temp)}°</strong></span>
              <span>Feels like: <strong className="text-foreground">{convertTemp(data.current.feelslike_c)}°</strong></span>
            </div>
          </CardContent>
        </Card>

        {/* 6 Useful Weather Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <WeatherStatCard 
            index={0}
            icon={Droplets} 
            label={t('humidity', 'Humidity')} 
            value={data.current.humidity} 
            unit="%" 
            description="Moisture level" 
          />
          <WeatherStatCard 
            index={1}
            icon={Wind} 
            label={t('wind_speed', 'Wind Speed')} 
            value={data.current.wind_kph} 
            unit="km/h" 
            description="Wind direction NW" 
          />
          <WeatherStatCard 
            index={2}
            icon={CloudRain} 
            label={t('rain_prob', 'Rain Chance')} 
            value={data.forecast[0].chance_of_rain} 
            unit="%" 
            description="Precipitation probability" 
          />
          <WeatherStatCard 
            index={3}
            icon={Eye} 
            label={t('visibility', 'Visibility')} 
            value={data.current.visibility_km} 
            unit="km" 
            description="Atmospheric clarity" 
          />
          <WeatherStatCard 
            index={4}
            icon={Sun} 
            label={t('uv_index', 'UV Index')} 
            value={data.current.uv} 
            unit="" 
            description="Solar radiation level" 
          />
          <WeatherStatCard 
            index={5}
            icon={CloudLightning} 
            label={t('pressure', 'Pressure')} 
            value={data.current.pressure_mb} 
            unit="mb" 
            description="Barometric reading" 
          />
        </div>
      </div>

      {/* 5. Weather Activity & Recent Activity Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Weather Activity */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>{t('hourly_forecast', 'Weather Activity')}</span>
              </CardTitle>
              <span className="text-xs text-muted-foreground font-semibold">Today's Hourly Trend</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto pb-2 gap-3 hide-scrollbar snap-x">
              {data.hourly.map((hour: any, idx: number) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center justify-center p-3.5 bg-muted/40 hover:bg-muted rounded-xl min-w-[95px] snap-center border border-border/40 transition-colors"
                >
                  <span className="text-xs font-medium text-muted-foreground">{hour.time}</span>
                  <div className="my-2">
                    {hour.icon.includes('rain') ? (
                      <CloudRain className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Sun className="w-6 h-6 text-amber-500" />
                    )}
                  </div>
                  <span className="text-base font-bold text-foreground">{convertTemp(hour.temp_c)}°</span>
                  <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-500 font-semibold">
                    <Droplets className="w-3 h-3" />
                    <span>{hour.chance_of_rain}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Small Useful Recent Activity */}
        <Card className="shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <History className="w-4 h-4 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivities.map((act, idx) => (
              <div 
                key={idx} 
                className="p-3 rounded-xl border border-border/60 bg-muted/30 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-foreground">{act.title}</div>
                  <div className="text-[11px] text-muted-foreground">{act.location}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[10px]">
                    {act.type}
                  </span>
                  <div className="text-[10px] text-muted-foreground mt-1">{act.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 6. 7-Day Weather Forecast */}
      <Card className="shadow-xs">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">{t('seven_day_forecast', '7-Day Forecast')}</CardTitle>
            <button 
              onClick={() => navigate('/map')} 
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View Interactive Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border/50">
            {data.forecast.map((day: any, idx: number) => (
              <div 
                key={idx} 
                className="py-3 flex items-center justify-between px-1 hover:bg-muted/30 rounded-lg transition-colors text-sm"
              >
                <div className="flex items-center gap-3 w-1/3">
                  <span className="font-bold text-foreground w-16">{day.day}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{day.date.split('-').reverse().slice(0,2).join('/')}</span>
                </div>
                <div className="flex items-center gap-2 w-1/3 justify-center">
                  {day.condition.includes('Rain') ? (
                    <CloudRain className="w-5 h-5 text-blue-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <span className="text-xs font-medium text-foreground hidden md:inline">{day.condition}</span>
                </div>
                <div className="flex items-center gap-1.5 w-1/6 justify-center text-blue-500 text-xs font-semibold">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>{day.chance_of_rain}%</span>
                </div>
                <div className="flex items-center gap-3 w-1/6 justify-end text-xs font-bold">
                  <span className="text-foreground">{convertTemp(day.max_temp)}°</span>
                  <span className="text-muted-foreground font-normal">{convertTemp(day.min_temp)}°</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
