import React from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Snowflake, CloudSun, Calendar } from 'lucide-react';

export interface ForecastDay {
  date: string;
  day: string;
  min_temp: number;
  max_temp: number;
  condition: string;
  chance_of_rain?: number;
}

interface DailyForecastGlassProps {
  forecastData: ForecastDay[];
  convertTemp: (val: number) => number;
  tempUnit: string;
  className?: string;
}

export const DailyForecastGlass: React.FC<DailyForecastGlassProps> = ({
  forecastData,
  convertTemp,
  tempUnit,
  className = '',
}) => {
  const getConditionIcon = (cond: string) => {
    const c = cond.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-blue-200" />;
    if (c.includes('storm') || c.includes('thunder')) return <CloudLightning className="w-5 h-5 text-amber-300" />;
    if (c.includes('snow')) return <Snowflake className="w-5 h-5 text-cyan-200" />;
    if (c.includes('partly') || (c.includes('sun') && c.includes('cloud'))) return <CloudSun className="w-5 h-5 text-amber-200" />;
    if (c.includes('sun') || c.includes('clear')) return <Sun className="w-5 h-5 text-amber-300" />;
    return <Cloud className="w-5 h-5 text-white/80" />;
  };

  // Find min/max across all days for normalized temperature range bars
  const globalMin = Math.min(...forecastData.map(d => convertTemp(d.min_temp)));
  const globalMax = Math.max(...forecastData.map(d => convertTemp(d.max_temp)));
  const globalRange = globalMax - globalMin || 1;

  return (
    <div className={`glass-panel rounded-3xl p-5 sm:p-6 text-white ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
          <Calendar className="w-4 h-4 text-white/75" />
          <span>7-Day Forecast</span>
        </h2>
        <span className="text-xs font-semibold text-white/60">
          Daily High / Low (°{tempUnit})
        </span>
      </div>

      <div className="space-y-2">
        {forecastData.map((item, idx) => {
          const isToday = idx === 0;
          const min = convertTemp(item.min_temp);
          const max = convertTemp(item.max_temp);
          
          // Calculate percentage bar width and left offset
          const leftPercent = Math.max(0, Math.min(100, ((min - globalMin) / globalRange) * 100));
          const widthPercent = Math.max(15, Math.min(100 - leftPercent, ((max - min) / globalRange) * 100));

          // Format date string for display (e.g., 09/12)
          const dateLabel = item.date ? item.date.slice(5).replace('-', '/') : '';

          return (
            <div
              key={idx}
              className={`flex items-center justify-between py-2.5 px-3.5 rounded-2xl transition-all ${
                isToday 
                  ? 'bg-white/18 border border-white/25 shadow-xs font-semibold' 
                  : 'hover:bg-white/8 border border-transparent'
              }`}
            >
              {/* Day & Date */}
              <div className="w-24 sm:w-28 flex items-center gap-2">
                <span className="text-xs text-white/60 font-mono hidden sm:inline">
                  {dateLabel}
                </span>
                <span className={`text-xs sm:text-sm font-bold ${isToday ? 'text-white' : 'text-white/90'}`}>
                  {isToday ? 'Today' : item.day}
                </span>
              </div>

              {/* Weather Icon & Condition */}
              <div className="flex items-center gap-2 w-32 sm:w-40">
                {getConditionIcon(item.condition)}
                <span className="text-xs font-medium text-white/85 truncate hidden xs:inline">
                  {item.condition}
                </span>
                {item.chance_of_rain !== undefined && item.chance_of_rain > 0 && (
                  <span className="text-[10px] font-bold text-sky-200">
                    {item.chance_of_rain}%
                  </span>
                )}
              </div>

              {/* Temperature Bar & Min/Max */}
              <div className="flex items-center justify-end gap-3 flex-1 max-w-[200px] sm:max-w-[240px]">
                <span className="text-xs font-medium text-white/70 w-7 text-right">
                  {min}°
                </span>

                {/* Visual Temperature Gradient Bar */}
                <div className="hidden sm:block flex-1 h-1.5 bg-black/20 rounded-full relative overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-300 via-amber-300 to-orange-400"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />
                </div>

                <span className="text-xs font-bold text-white w-7 text-right">
                  {max}°
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
