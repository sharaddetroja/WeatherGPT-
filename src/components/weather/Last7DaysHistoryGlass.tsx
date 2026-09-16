import React, { useState } from 'react';
import { 
  History, 
  CloudRain, 
  Droplets, 
  Sun, 
  Cloud, 
  CloudSun, 
  CloudLightning, 
  Snowflake, 
  TrendingUp, 
  TrendingDown, 
  Gauge
} from 'lucide-react';
import type { HistoricalWeatherDay } from '../../services/weatherService';

interface Last7DaysHistoryGlassProps {
  historyData: HistoricalWeatherDay[];
  convertTemp: (val: number) => number;
  tempUnit: string;
  className?: string;
  timelineTab?: 'forecast' | 'history';
  onSelectTab?: (tab: 'forecast' | 'history') => void;
}

export const Last7DaysHistoryGlass: React.FC<Last7DaysHistoryGlassProps> = ({
  historyData,
  convertTemp,
  tempUnit,
  className = '',
  timelineTab,
  onSelectTab,
}) => {
  const [selectedDay, setSelectedDay] = useState<HistoricalWeatherDay | null>(null);

  if (!historyData || historyData.length === 0) return null;

  const formattedUnit = tempUnit.startsWith('°') ? tempUnit : `°${tempUnit}`;

  const getConditionIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-blue-200 shrink-0" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-amber-300 shrink-0" />;
    if (c.includes('snow')) return <Snowflake className="w-5 h-5 text-cyan-200 shrink-0" />;
    if (c.includes('partly') || (c.includes('sun') && c.includes('cloud'))) return <CloudSun className="w-5 h-5 text-amber-200 shrink-0" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-5 h-5 text-amber-300 shrink-0" />;
    return <Cloud className="w-5 h-5 text-white/80 shrink-0" />;
  };

  // Statistical calculations
  const totalRainfall = historyData.reduce((acc, d) => acc + (d.rainfall_mm || 0), 0);
  const maxTemps = historyData.map(d => convertTemp(d.max_temp));
  const minTemps = historyData.map(d => convertTemp(d.min_temp));
  const highestTemp = Math.max(...maxTemps);
  const lowestTemp = Math.min(...minTemps);
  const avgTemp = Math.round((historyData.reduce((acc, d) => acc + convertTemp(d.avg_temp), 0) / historyData.length) * 10) / 10;
  

  return (
    <div className={`glass-panel rounded-3xl p-3.5 xs:p-4 sm:p-6 text-white transition-all shadow-xl h-full flex flex-col justify-between ${className}`}>
      <div>
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 xs:mb-5">
          {onSelectTab ? (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/10 text-white border border-white/10 shadow-xs w-full sm:w-auto">
              <button
                onClick={() => onSelectTab('forecast')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  timelineTab === 'forecast'
                    ? 'bg-white text-[#1D4ED8] shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🔮 7-Day Forecast</span>
              </button>
              <button
                onClick={() => onSelectTab('history')}
                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  timelineTab === 'history'
                    ? 'bg-white text-[#1D4ED8] shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📜 History</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-sky-300 border border-white/15">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                  <span>Past 7 Days History</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30">
                    Recorded
                  </span>
                </h2>
                <p className="text-xs text-white/60">Historical observed weather & precipitation telemetry</p>
              </div>
            </div>
          )}

          {/* 7-Day Quick Metric Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/8 border border-white/10 flex items-center gap-1.5 text-[11px] sm:text-xs" title="Total Rainfall in past 7 days">
              <CloudRain className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-white/70">Rain:</span>
              <span className="font-bold text-white">{totalRainfall.toFixed(1)} mm</span>
            </div>

            <div className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-white/8 border border-white/10 flex items-center gap-1.5 text-[11px] sm:text-xs" title="7-Day Mean Temperature">
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-white/70">Mean:</span>
              <span className="font-bold text-white">{avgTemp}{formattedUnit}</span>
            </div>
          </div>
        </div>

        {/* Summary KPI Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 xs:gap-3 mb-4 xs:mb-5">
          <div className="p-2.5 xs:p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] xs:text-[11px] text-white/60 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-red-300" /> Peak High
            </div>
            <div className="text-base xs:text-lg font-black text-white mt-0.5">{highestTemp}{formattedUnit}</div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] xs:text-[11px] text-white/60 font-medium flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-cyan-300" /> Low Point
            </div>
            <div className="text-base xs:text-lg font-black text-white mt-0.5">{lowestTemp}{formattedUnit}</div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] xs:text-[11px] text-white/60 font-medium flex items-center gap-1">
              <Droplets className="w-3 h-3 text-sky-300" /> Wettest Day
            </div>
            <div className="text-base xs:text-lg font-black text-white mt-0.5 truncate">
              {historyData.reduce((prev, curr) => (prev.rainfall_mm > curr.rainfall_mm ? prev : curr)).day}
            </div>
          </div>

          <div className="p-2.5 xs:p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-[10px] xs:text-[11px] text-white/60 font-medium flex items-center gap-1">
              <Gauge className="w-3 h-3 text-emerald-300" /> Avg Wind
            </div>
            <div className="text-base xs:text-lg font-black text-white mt-0.5">
              {Math.round(historyData.reduce((acc, d) => acc + d.wind_kph, 0) / historyData.length)} <span className="text-[10px] xs:text-xs font-normal text-white/60">km/h</span>
            </div>
          </div>
        </div>

        {/* Day by Day Historical Table/Cards with Comfortable Gap */}
        <div className="space-y-2 sm:space-y-2.5">
          {historyData.map((item, idx) => {
            const min = convertTemp(item.min_temp);
            const max = convertTemp(item.max_temp);
            const isYesterday = idx === 0;
            const rainChance = item.rainfall_mm > 0 ? Math.min(100, Math.max(20, Math.round(item.rainfall_mm * 20))) : 0;
            const hasRain = rainChance > 0;

            const getNightIcon = (cond?: string) => {
              const c = (cond || '').toLowerCase();
              if (c.includes('storm') || c.includes('thunder')) {
                return <CloudLightning className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]" />;
              }
              if (c.includes('rain') || c.includes('drizzle')) {
                return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300" />;
              }
              if (c.includes('partly')) {
                return <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />;
              }
              return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300/80" />;
            };

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(selectedDay?.date === item.date ? null : item)}
                className={`grid grid-cols-12 items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl transition-all cursor-pointer ${
                  selectedDay?.date === item.date
                    ? 'bg-white/20 border border-sky-400 shadow-md'
                    : isYesterday
                    ? 'bg-white/12 border border-white/20 shadow-xs'
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 shadow-2xs'
                }`}
              >
                {/* 1. Left: Day Label (e.g. "Yesterday", "Sun", "Sat") */}
                <div className="col-span-3 sm:col-span-3 flex items-center min-w-0">
                  <span className={`text-sm sm:text-base font-bold tracking-tight truncate ${isYesterday ? 'text-white font-black' : 'text-white/90'}`}>
                    {isYesterday ? 'Yesterday' : item.day}
                  </span>
                </div>

                {/* 2. Center-Left: Droplet Icon & Rain Probability / Precipitation */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-start gap-1.5">
                  {hasRain ? (
                    <div className="flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-cyan-300 fill-cyan-300 shrink-0 drop-shadow-[0_0_6px_rgba(103,232,249,0.6)]" />
                      <span className="text-xs sm:text-sm font-bold text-white/90 font-mono tracking-tight">
                        {rainChance}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 opacity-40">
                      <Droplets className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-white/40 font-mono">0%</span>
                    </div>
                  )}
                </div>

                {/* 3. Center: Dual Condition Icons (Day condition + Night/Secondary condition) */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                    {getConditionIcon(item.condition)}
                  </div>
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                    {getNightIcon(item.condition)}
                  </div>
                </div>

                {/* 4. Right: High and Low Temperatures (e.g. 27° 25°) */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-end gap-2 sm:gap-3 text-right">
                  <span className="text-sm sm:text-base font-black text-white tracking-tight">
                    {max}°
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white/60 tracking-tight">
                    {min}°
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
