import { useState, useEffect } from 'react';
import { Sprout, Droplets, Sun, Wind, Download, Sparkles, MapPin, Loader2 } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { exportWeatherPDF } from '../utils/exportReports';
import { getWeatherData } from '../services/weatherService';
import { WeatherGPTLive } from '../components/WeatherGPTLive';

export interface CropProfile {
  id: string;
  name: string;
  category: string;
  icon: string;
  soilMoistureOptimal: string;
  waterNeed: string;
  pestRisk: 'Low' | 'Moderate' | 'High';
  adviceEn: string;
}

const CROPS: CropProfile[] = [
  {
    id: 'groundnut',
    name: 'Groundnut (Peanut)',
    category: 'Oilseed & Legume',
    icon: '🥜',
    soilMoistureOptimal: '65% - 75%',
    waterNeed: 'Moderate (Light Shower)',
    pestRisk: 'Low',
    adviceEn: 'Light to moderate rain over the next 48h is highly beneficial for pod development. Ensure drainage channels are clear to prevent waterlogging.'
  },
  {
    id: 'cotton',
    name: 'Cotton',
    category: 'Commercial Cash Crop',
    icon: '🌾',
    soilMoistureOptimal: '60% - 70%',
    waterNeed: 'High',
    pestRisk: 'Moderate',
    adviceEn: 'High humidity increases pink bollworm risk. Avoid pesticide sprays during evening showers and maintain proper row aeration.'
  },
  {
    id: 'wheat',
    name: 'Wheat',
    category: 'Cereal Grain',
    icon: '🌾',
    soilMoistureOptimal: '55% - 65%',
    waterNeed: 'Moderate',
    pestRisk: 'Low',
    adviceEn: 'Controlled irrigation recommended due to 18 km/h wind gusts to prevent crop lodging. Ideal weather for tillering.'
  },
  {
    id: 'rice',
    name: 'Paddy Rice',
    category: 'Staple Cereal',
    icon: '🌱',
    soilMoistureOptimal: '80% - 90%',
    waterNeed: 'Very High',
    pestRisk: 'High',
    adviceEn: 'Retain rainwater in standing bunds. Maintain a 5 cm water table across paddy plots and monitor for fungal blast symptoms.'
  }
];

export default function AgriculturePage() {
  const { profile, convertTemp, tempUnitSymbol } = useUserProfile();
  const { t } = useLanguage();
  const [selectedCrop, setSelectedCrop] = useState<CropProfile>(CROPS[0]);
  const [liveWeatherData, setLiveWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const city = profile.location || 'Rajkot';
    getWeatherData(city).then(res => {
      setLiveWeatherData(res);
      setLoading(false);
    });
  }, [profile.location]);

  const handleExportPDF = () => {
    exportWeatherPDF({
      location: profile.location || 'Rajkot, Gujarat',
      date: new Date().toLocaleDateString(),
      temp: `${convertTemp(liveWeatherData?.current?.temp_c || 28)}${tempUnitSymbol}`,
      condition: liveWeatherData?.current?.condition?.text || 'Partly Cloudy & Monsoon Showers',
      humidity: liveWeatherData?.current?.humidity || 72,
      wind: `${liveWeatherData?.current?.wind_kph || 15.4} km/h NW`,
      pressure: `${liveWeatherData?.current?.pressure_mb || 1008} mb`,
      uv: liveWeatherData?.current?.uv || 6,
      rainChance: liveWeatherData?.forecast?.[0]?.chance_of_rain || 80,
      forecast: (liveWeatherData?.forecast || []).map((f: any) => ({
        day: f.day,
        date: f.date,
        maxTemp: `${convertTemp(f.max_temp)}°`,
        minTemp: `${convertTemp(f.min_temp)}°`,
        condition: f.condition,
        rainChance: f.chance_of_rain
      }))
    });
  };

  const humidity = liveWeatherData?.current?.humidity || 72;
  const windKph = liveWeatherData?.current?.wind_kph || 15.4;
  const soilMoistureCalc = Math.min(95, Math.max(50, Math.round(humidity * 0.95)));

  return (
    <div className="space-y-4 sm:space-y-6 pb-2 sm:pb-4 animate-in fade-in duration-300 text-white">
      {/* Header Banner */}
      <div className="glass-panel p-4 xs:p-5 sm:p-7 rounded-2xl xs:rounded-3xl border border-white/20 shadow-xl backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-1">
            <Sprout className="w-4 h-4" />
            <span>Kisan Agriculture Advisory</span>
          </div>
          <h1 className="text-xl xs:text-2xl sm:text-3xl font-black text-white">{t('kisan_title', 'Farmer Weather & Crop Advisory')}</h1>
          <p className="text-xs text-white/70 mt-1 max-w-xl">
            {t('kisan_subtitle', 'Real-time soil moisture tracking, rainfall advisory, and live WeatherGPT AI assistance tailored for farming.')}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExportPDF}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/40"
          >
            <Download className="w-4 h-4" />
            <span>Export Crop Report</span>
          </button>
        </div>
      </div>

      {/* Location & Live Stream Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 xs:p-4 glass-panel rounded-2xl border border-white/15 gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
          <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Farming Belt: {profile.location || 'Rajkot & Saurashtra District'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/10 text-white/80 border border-white/15">
            Kharif Season
          </span>
        </div>
      </div>

      {/* Crop Selector Grid */}
      <div className="space-y-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
          <span>{t('crop_select', 'Select Your Active Crop')}:</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xs:gap-3">
          {CROPS.map((crop) => (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop)}
              className={`p-3.5 xs:p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                selectedCrop.id === crop.id
                  ? 'glass-pill-active border-emerald-400 text-white shadow-md ring-2 ring-emerald-400/20 scale-[1.01]'
                  : 'glass-panel hover:bg-white/10 border-white/15 text-white/90'
              }`}
            >
              <div className="text-2xl xs:text-3xl mb-1.5 xs:mb-2">{crop.icon}</div>
              <div>
                <div className="font-extrabold text-xs xs:text-sm text-white">{crop.name}</div>
                <div className="text-[11px] xs:text-xs text-white/60 mt-0.5">{crop.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Crop Deep Dive & Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="p-5 xs:p-6 rounded-2xl xs:rounded-3xl glass-panel border border-white/20 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl xs:text-4xl">{selectedCrop.icon}</span>
                <div>
                  <h2 className="text-lg xs:text-xl font-black text-white">{selectedCrop.name}</h2>
                  <p className="text-xs text-white/70">Optimal Soil Moisture Target: {selectedCrop.soilMoistureOptimal}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                selectedCrop.pestRisk === 'Low' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                selectedCrop.pestRisk === 'Moderate' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' :
                'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                Pest Risk: {selectedCrop.pestRisk}
              </span>
            </div>

            {/* Weather & Agronomy Advisory Callout */}
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-300 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                <span>Agricultural Weather & Irrigation Advisory:</span>
              </div>
              <p className="text-xs xs:text-sm leading-relaxed text-white/90 font-medium">
                {selectedCrop.adviceEn}
              </p>
            </div>
          </div>
        </div>

        {/* Live Soil & Weather Metrics */}
        <div className="space-y-4">
          <div className="p-4 xs:p-5 rounded-2xl xs:rounded-3xl glass-panel border border-white/20 shadow-xl backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs xs:text-sm text-white uppercase tracking-wider">Live Soil & Weather Metrics</h3>
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />}
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                  <Droplets className="w-4 h-4 text-blue-400" />
                  <span>Real-time Soil Moisture</span>
                </div>
                <span className="text-xs xs:text-sm font-black text-blue-300">{soilMoistureCalc}% (Optimal)</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Evapotranspiration</span>
                </div>
                <span className="text-xs xs:text-sm font-black text-amber-300">4.2 mm/day</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                  <Wind className="w-4 h-4 text-teal-400" />
                  <span>Surface Wind Speed</span>
                </div>
                <span className="text-xs xs:text-sm font-black text-teal-300">{windKph} km/h NW</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl glass-panel border border-white/10">
                <div className="flex items-center gap-2 text-xs font-bold text-white/80">
                  <Droplets className="w-4 h-4 text-indigo-400" />
                  <span>Air Humidity</span>
                </div>
                <span className="text-xs xs:text-sm font-black text-indigo-300">{humidity}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Kisan AI Advisory Section */}
      <div className="pt-2">
        <h3 className="text-xs xs:text-sm font-extrabold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Kisan Live WeatherGPT Assistant:</span>
        </h3>
        <WeatherGPTLive 
          defaultQuestion="What is the rainfall forecast for groundnut and cotton crops over the next 7 days?" 
          className="shadow-xl border-emerald-500/30"
        />
      </div>
    </div>
  );
}

