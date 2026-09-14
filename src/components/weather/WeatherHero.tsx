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
      className={`relative flex flex-col justify-between text-white select-none bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl p-4 xs:p-5 sm:p-8 lg:p-10 ${className}`}
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

        {/* Air Quality & PM2.5 Badges */}
        <div className="flex items-center gap-1.5 xs:gap-2 shrink-0 flex-wrap justify-end">
          {/* Dynamic AQI Indicator Pill */}
          <div 
            className={`flex items-center gap-1.5 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-full ${aqiInfo.badgeBg} border ${aqiInfo.badgeBorder} backdrop-blur-md text-xs font-semibold text-white shadow-xs`}
            title={`Air Quality Index: ${aqiInfo.score} (${aqiInfo.label}) - ${aqiInfo.advice}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${aqiInfo.dotColor} animate-pulse`} />
            <span className="text-[9px] xs:text-[10px] uppercase font-bold tracking-wider text-white/80">AQI</span>
            <span className={`font-black ${aqiInfo.textColor}`}>{aqiInfo.score}</span>
            <span className="hidden xs:inline text-[10px] font-medium text-white/70">
              • {aqiInfo.label}
            </span>
          </div>

          {/* PM2.5 Glass Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 xs:px-3 xs:py-1.5 rounded-full bg-white/15 border border-white/25 backdrop-blur-md text-xs font-semibold text-white shadow-xs">
            <span className="text-[9px] xs:text-[10px] uppercase font-bold tracking-wider text-white/80">PM 2.5</span>
            <span className="font-extrabold">{activePm25}</span>
          </div>
        </div>
      </div>

      {/* Main Center Temperature & Condition Display */}
      <div className="my-5 xs:my-6 sm:my-8 flex flex-col items-center sm:items-start text-center sm:text-left">
        {/* Condition Text */}
        <div className="flex items-center gap-2 mb-1.5">
          <ConditionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 drop-shadow-sm" />
          <span className="text-xl xs:text-2xl sm:text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            {condition}
          </span>
        </div>

        {/* Temperature Range & Feels Like */}
        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-2 xs:gap-3 text-xs xs:text-sm sm:text-base font-medium text-white/85">
          <span>{minTemp}° ~ {maxTemp}{tempUnit}</span>
          <span className="w-1 h-1 rounded-full bg-white/50" />
          <span>Feels like {feelsLike}{tempUnit}</span>
        </div>

        {/* Huge Visually Dominant Temperature */}
        <div className="flex items-start justify-center sm:justify-start mt-2">
          <span className="text-6xl xs:text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter leading-none text-white drop-shadow-md">
            {temp}
          </span>
          <span className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-light text-white/80 -mt-1 ml-1">
            {tempUnit}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
