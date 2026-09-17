import React from 'react';
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Snowflake, CloudSun, CloudOff } from 'lucide-react';
import { motion } from 'motion/react';
import { getCityAQI } from '../../utils/airQuality';

interface WeatherHeroProps {
  locationName: string;
  region?: string;
  condition: string;
  temp: number | string;
  tempUnit: string;
  minTemp: number | string;
  maxTemp: number | string;
  feelsLike: number | string;
  pm25?: number | string;
  aqi?: number;
  isStale?: boolean;
  className?: string;
}

export const WeatherHero: React.FC<WeatherHeroProps> = ({
  locationName,
  region,
  condition,
  temp,
  tempUnit,
  minTemp,
  maxTemp,
  feelsLike,
  pm25,
  aqi,
  isStale = false,
  className = '',
}) => {
  const aqiInfo = getCityAQI(
    locationName,
    typeof aqi === 'number' ? aqi : undefined,
    typeof pm25 === 'number' ? pm25 : undefined
  );
  const activePm25 = pm25 !== undefined ? pm25 : aqiInfo.pm25;

  const getConditionIcon = (cond?: string) => {
    const c = (cond || '').toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return CloudRain;
    if (c.includes('storm') || c.includes('thunder')) return CloudLightning;
    if (c.includes('snow')) return Snowflake;
    if (c.includes('wind')) return Wind;
    if (c.includes('partly') || (c.includes('sun') && c.includes('cloud'))) return CloudSun;
    if (c.includes('sun') || c.includes('clear')) return Sun;
    return Cloud;
  };

  const ConditionIcon = getConditionIcon(condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative flex flex-col justify-between text-white select-none bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-4 xs:p-5 sm:p-6 lg:p-7 ${className}`}
    >
      {/* Top Location & Badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm truncate max-w-full">
              {locationName}
            </h1>
            {isStale && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/25 text-amber-200 border border-amber-500/40 text-[9px] xs:text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shrink-0">
                <CloudOff className="w-3 h-3 text-amber-300" /> Cached Weather
              </span>
            )}
          </div>
          {region && (
            <p className="text-xs sm:text-sm text-white/75 font-medium mt-0.5 truncate">
              {region}
            </p>
          )}
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">Live Feed</span>
          </div>
        </div>
      </div>

      {/* Main Dual Metric Display: Left = Temperature, Right = AQI (Same Styling) */}
      <div className="my-4 xs:my-5 sm:my-7 grid grid-cols-1 xs:grid-cols-2 gap-4 xs:gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* LEFT: Temperature */}
        <div className="flex flex-col items-start text-left min-w-0">
          {/* Condition Text */}
          <div className="flex items-center gap-2 mb-1.5 min-w-0">
            <ConditionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 drop-shadow-sm shrink-0" />
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-sm truncate">
              {condition}
            </span>
          </div>

          {/* Temperature Range & Feels Like */}
          <div className="flex items-center flex-wrap gap-1.5 xs:gap-2 text-[11px] xs:text-xs sm:text-sm font-medium text-white/85">
            <span>{minTemp}° ~ {maxTemp}{tempUnit}</span>
            <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
            <span>Feels {feelsLike}{tempUnit}</span>
          </div>

          {/* Huge Visually Dominant Temperature */}
          <div className="flex items-start mt-1.5 xs:mt-2">
            <span className="text-5xl xs:text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white drop-shadow-md">
              {temp}
            </span>
            <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-light text-white/80 -mt-1 ml-1">
              {tempUnit}
            </span>
          </div>
        </div>

        {/* RIGHT: AQI with Slidebar matching reference image */}
        <div className="flex flex-col items-start text-left xs:border-l xs:border-white/15 xs:pl-4 sm:pl-6 lg:pl-8 w-full min-w-0">
          {/* AQI Title Label */}
          <span className="text-xs sm:text-sm font-semibold text-white/70 uppercase tracking-wider block">
            AQI
          </span>

          {/* Quality(Score) e.g. Good(29) */}
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-0.5 drop-shadow-sm">
            {aqiInfo.label}({aqiInfo.score})
          </h3>

          {/* AQI Quality Slidebar (Good to Bad gradient track with active fill) */}
          <div className="w-full mt-2.5">
            <div className="w-full h-3 sm:h-3.5 rounded-full bg-white/20 backdrop-blur-md overflow-hidden relative border border-white/10 p-0.5 flex items-center">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  aqiInfo.category === 'good' 
                    ? 'bg-[#00E676] shadow-[0_0_10px_rgba(0,230,118,0.7)]'
                    : aqiInfo.category === 'moderate'
                    ? 'bg-[#FBBF24] shadow-[0_0_10px_rgba(251,191,36,0.7)]'
                    : aqiInfo.category === 'poor'
                    ? 'bg-[#FB923C] shadow-[0_0_10px_rgba(251,146,60,0.7)]'
                    : aqiInfo.category === 'unhealthy'
                    ? 'bg-[#F43F5E] shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                    : 'bg-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.7)]'
                }`}
                style={{ width: `${Math.min(100, Math.max(12, Math.round((aqiInfo.score / 300) * 100)))}%` }}
              />
            </div>

            {/* PM2.5 & PM10 Details */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/70 mt-1.5 font-medium">
              <span>PM 2.5: {activePm25}</span>
              <span>•</span>
              <span>PM 10: {aqiInfo.pm10}</span>
              <span className="hidden xs:inline">•</span>
              <span className={`hidden xs:inline font-bold ${aqiInfo.textColor}`}>
                {aqiInfo.category === 'good' ? 'Clean Air' : aqiInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
