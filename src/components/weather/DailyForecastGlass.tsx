import React from 'react';
import { Cloud, CloudRain, CloudLightning, Snowflake, CloudSun, Calendar, Moon, CloudMoon, Droplet } from 'lucide-react';

export interface ForecastDay {
  date: string;
  day: string;
  min_temp: number;
  max_temp: number;
  condition: string;
  chance_of_rain?: number;
  rainfall_mm?: number;
  humidity?: number;
  wind_kph?: number;
}

interface DailyForecastGlassProps {
  forecastData: ForecastDay[];
  convertTemp: (val: number) => number;
  tempUnit: string;
  className?: string;
  timelineTab?: 'forecast' | 'history';
  onSelectTab?: (tab: 'forecast' | 'history') => void;
}

export const DailyForecastGlass: React.FC<DailyForecastGlassProps> = ({
  forecastData,
  convertTemp,
  tempUnit,
  className = '',
  timelineTab,
  onSelectTab,
}) => {
  // Daytime Weather Icon
  const getDayIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('storm') || c.includes('thunder')) {
      return (
        <div className="relative flex items-center justify-center">
          <CloudLightning className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]" />
        </div>
      );
    }
    if (c.includes('heavy rain') || c.includes('torrential')) {
      return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 drop-shadow-[0_2px_8px_rgba(96,165,250,0.5)]" />;
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-sky-300 drop-shadow-[0_2px_8px_rgba(125,211,252,0.4)]" />;
    }
    if (c.includes('snow')) {
      return <Snowflake className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200" />;
    }
    if (c.includes('cloud') && (c.includes('sun') || c.includes('partly'))) {
      return <CloudSun className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 drop-shadow-[0_2px_8px_rgba(252,211,77,0.4)]" />;
    }
    if (c.includes('sun') || c.includes('clear')) {
      return (
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)] border border-amber-300/60" />
      );
    }
    return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-slate-200/90 drop-shadow-[0_2px_6px_rgba(255,255,255,0.2)]" />;
  };

  // Nighttime / Secondary Forecast Icon
  const getNightIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('storm') || c.includes('thunder')) {
      return (
        <div className="relative flex items-center justify-center">
          <CloudLightning className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 drop-shadow-[0_2px_8px_rgba(251,191,36,0.5)]" />
        </div>
      );
    }
    if (c.includes('rain') || c.includes('drizzle') || c.includes('shower')) {
      return <CloudRain className="w-5 h-5 sm:w-6 sm:h-6 text-blue-300/90" />;
    }
    if (c.includes('cloud') && !c.includes('clear')) {
      return <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300/80" />;
    }
    if (c.includes('partly')) {
      return <CloudMoon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-200/90" />;
    }
    return <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-100/90 drop-shadow-[0_0_8px_rgba(165,243,252,0.4)]" />;
  };

  return (
    <div className={`glass-panel rounded-3xl p-4 sm:p-6 text-white h-full flex flex-col justify-between border border-white/20 shadow-2xl backdrop-blur-2xl ${className}`}>
      <div>
        {/* Top Header Bar & Tabs */}
        <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-2 pb-3 border-b border-white/10">
          {onSelectTab ? (
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/10 text-white border border-white/15 shadow-inner w-full sm:w-auto">
              <button
                onClick={() => onSelectTab('forecast')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  timelineTab === 'forecast'
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>🔮 7-Day Forecast</span>
              </button>
              <button
                onClick={() => onSelectTab('history')}
                className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  timelineTab === 'history'
                    ? 'bg-white text-slate-900 shadow-md scale-105'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>📜 History</span>
              </button>
            </div>
          ) : (
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-300" />
              <span>7-Day Weather Forecast</span>
            </h2>
          )}

          <span className="text-[11px] sm:text-xs font-bold text-white/60">
            High / Low ({tempUnit})
          </span>
        </div>

        {/* Forecast Rows List - Distinct Daywise Cards with Comfortable Gap */}
        <div className="space-y-2 sm:space-y-2.5">
          {forecastData.map((item, idx) => {
            const isToday = idx === 0;
            const min = convertTemp(item.min_temp);
            const max = convertTemp(item.max_temp);
            const rainChance = item.chance_of_rain ?? (item.rainfall_mm && item.rainfall_mm > 0 ? Math.min(100, Math.round(item.rainfall_mm * 15)) : 0);

            // Calculate fill percentage for droplet icon (e.g. 100%, 75%, 20%)
            const hasRain = rainChance > 0;

            return (
              <div
                key={idx}
                className={`grid grid-cols-12 items-center py-2.5 sm:py-3 px-3 sm:px-4 rounded-2xl transition-all ${
                  isToday 
                    ? 'bg-white/15 border border-sky-400/40 shadow-sm' 
                    : 'bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 shadow-2xs'
                }`}
              >
                {/* 1. Left: Day Name (e.g. "Today", "Tue", "Wed") */}
                <div className="col-span-3 sm:col-span-3 flex items-center min-w-0">
                  <span className={`text-sm sm:text-base font-bold tracking-tight truncate ${isToday ? 'text-white font-black' : 'text-white/90'}`}>
                    {isToday ? 'Today' : item.day}
                  </span>
                </div>

                {/* 2. Center-Left: Droplet Icon & Rain Probability (e.g. 💧 100%) */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-start gap-1.5">
                  {hasRain ? (
                    <div className="flex items-center gap-1.5">
                      <div className="relative flex items-center justify-center">
                        <Droplet 
                          className="w-4 h-4 text-cyan-300 fill-cyan-300 shrink-0 drop-shadow-[0_0_6px_rgba(103,232,249,0.6)]" 
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-white/90 font-mono tracking-tight">
                        {rainChance}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 opacity-40">
                      <Droplet className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-white/40 font-mono">0%</span>
                    </div>
                  )}
                </div>

                {/* 3. Center: Dual Condition Icons (Day condition + Night/Secondary condition) */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-center gap-3 sm:gap-4">
                  <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 shrink-0">
                    {getDayIcon(item.condition)}
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
