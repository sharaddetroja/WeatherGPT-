import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Clock, CloudRain, Sun, Cloud, Droplets, Wind, Eye, CloudLightning, Leaf, Car, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';
import { getWeatherData } from '../services/weatherService';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import { WeatherStatCard } from '../components/WeatherStatCard';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeatherData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4 text-primary animate-pulse">
          <CloudRain className="w-16 h-16" />
          <p className="text-lg font-medium text-muted-foreground">Analyzing weather patterns...</p>
        </div>
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

  return (
    <div className="space-y-6 pb-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-medium text-lg">
            <MapPin className="w-5 h-5" />
            <h2>{data.location.name}, {data.location.country}</h2>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(), 'EEEE, do MMM')}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{format(new Date(), 'h:mm a')}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate('/map?locate=true')}
          className="px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-medium rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer group"
          title="Detect location and shift to interactive map"
        >
          <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Use my location</span>
        </button>
      </div>

      {/* Real-time Specific Area Weather Effects Banner (Incoming Rain & Fast Wind) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Incoming Rainfront Alert Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600/15 via-blue-500/10 to-indigo-600/10 border border-blue-500/30 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-500 text-white shadow-md flex-shrink-0">
              <CloudRain className="w-6 h-6 animate-bounce" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Incoming Rainfront
                </span>
                <span className="text-[10px] bg-red-500/15 text-red-600 font-bold px-1.5 py-0.5 rounded-md border border-red-500/20">
                  ETA 25m
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">Rajkot & Central Saurashtra (1.89 in/hr)</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Heavy monsoon precipitation band arriving shortly (3.45 in 24h total).</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/map?effect=rain&zone=rain-rajkot')}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-105 flex-shrink-0 cursor-pointer"
          >
            Inspect Rain Radar
          </button>
        </div>

        {/* Fast Wind Gale Advisory Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-600/15 via-emerald-500/10 to-teal-500/10 border border-teal-500/30 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-teal-600 text-white shadow-md flex-shrink-0">
              <Wind className="w-6 h-6 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                  Fast Wind Gale Warning
                </span>
                <span className="text-[10px] bg-amber-500/15 text-amber-600 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/20">
                  62 km/h NW
                </span>
              </div>
              <h4 className="text-sm font-bold text-foreground">Saurashtra Coast & Gulf of Khambhat</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Sustained gale squalls & rough sea conditions.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/map?effect=wind&zone=wind-saurashtra-coast')}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs hover:scale-105 flex-shrink-0 cursor-pointer"
          >
            Inspect Wind Flow
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Weather Card */}
        <Card className="lg:col-span-1 bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-20">
            <Sun className="w-48 h-48" />
          </div>
          <CardContent className="p-8 relative z-10 flex flex-col h-full justify-between">
            <div>
              <p className="text-primary-foreground/80 font-medium mb-1">Current Weather</p>
              <div className="flex items-center gap-4">
                <Cloud className="w-12 h-12" />
                <h1 className="text-6xl font-bold tracking-tighter">{data.current.temp_c}°</h1>
              </div>
              <p className="text-2xl font-medium mt-4">{data.current.condition.text}</p>
              <div className="flex items-center gap-4 mt-2 text-primary-foreground/80">
                <span>H: {data.forecast[0].max_temp}°</span>
                <span>L: {data.forecast[0].min_temp}°</span>
                <span>Feels like {data.current.feelslike_c}°</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          <WeatherStatCard icon={Droplets} label="Humidity" value={data.current.humidity} unit="%" description="The dew point is 22° right now" />
          <WeatherStatCard icon={Wind} label="Wind Speed" value={data.current.wind_kph} unit="km/h" description="Wind direction is NW" />
          <WeatherStatCard icon={CloudRain} label="Rain Prob." value={data.forecast[0].chance_of_rain} unit="%" description="Expected in afternoon" />
          <WeatherStatCard icon={Eye} label="Visibility" value={data.current.visibility_km} unit="km" description="It's clear right now" />
          <WeatherStatCard icon={Sun} label="UV Index" value={data.current.uv} unit="" description="Moderate level today" />
          <WeatherStatCard icon={CloudLightning} label="Pressure" value={data.current.pressure_mb} unit="mb" description="Rising slowly" />
        </div>
      </div>

      {/* AI Insights & Hourly Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hourly Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar snap-x">
              {data.hourly.map((hour: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-2xl min-w-[100px] snap-center">
                  <span className="text-sm font-medium text-muted-foreground">{hour.time}</span>
                  <div className="my-3">
                    {hour.icon.includes('rain') ? <CloudRain className="w-8 h-8 text-blue-500" /> : <Sun className="w-8 h-8 text-amber-500" />}
                  </div>
                  <span className="text-xl font-bold">{hour.temp_c}°</span>
                  <div className="flex items-center gap-1 mt-1 text-xs text-blue-500 font-medium">
                    <Droplets className="w-3 h-3" />
                    <span>{hour.chance_of_rain}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.insights.map((insight: any, idx: number) => {
              const Icon = getInsightIcon(insight.icon);
              return (
                <div key={idx} className={cn("p-4 rounded-xl border", getInsightColor(insight.type))}>
                  <div className="flex items-center gap-2 font-semibold mb-1">
                    <Icon className="w-4 h-4" />
                    {insight.title}
                  </div>
                  <p className="text-sm opacity-90">{insight.message}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* 7 Day Forecast */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {data.forecast.map((day: any, idx: number) => (
              <div key={idx} className="py-4 flex items-center justify-between">
                <div className="flex items-center gap-4 w-1/4">
                  <span className="font-medium min-w-[3rem]">{day.day}</span>
                  <span className="text-sm text-muted-foreground hidden sm:block">{day.date.split('-').reverse().slice(0,2).join('/')}</span>
                </div>
                <div className="flex items-center gap-3 w-1/4 justify-center">
                  {day.condition.includes('Rain') ? <CloudRain className="w-6 h-6 text-blue-500" /> : <Sun className="w-6 h-6 text-amber-500" />}
                  <span className="text-sm font-medium hidden md:block">{day.condition}</span>
                </div>
                <div className="flex items-center gap-2 w-1/4 justify-center text-blue-500 text-sm font-medium">
                  <Droplets className="w-4 h-4" />
                  <span>{day.chance_of_rain}%</span>
                </div>
                <div className="flex items-center gap-3 w-1/4 justify-end font-medium">
                  <span>{day.max_temp}°</span>
                  <span className="text-muted-foreground">{day.min_temp}°</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
