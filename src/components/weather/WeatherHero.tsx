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

        {/* Live Status Pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-[10px] sm:text-xs font-semibold text-white/80 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wide">Live Feed</span>
          </div>
        </div>
      </div>

      {/* Main Dual Metric Display: Left = Temperature, Right = AQI (Same Styling) */}
      <div className="my-5 xs:my-6 sm:my-7 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-6 lg:gap-8 items-start">
        {/* LEFT: Temperature */}
        <div className="flex flex-col items-start text-left">
          {/* Condition Text */}
          <div className="flex items-center gap-2 mb-1.5">
            <ConditionIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white/90 drop-shadow-sm" />
            <span className="text-xl xs:text-2xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-sm truncate">
              {condition}
            </span>
          </div>

          {/* Temperature Range & Feels Like */}
          <div className="flex items-center flex-wrap gap-2 xs:gap-2.5 text-xs xs:text-sm font-medium text-white/85">
            <span>{minTemp}° ~ {maxTemp}{tempUnit}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>Feels like {feelsLike}{tempUnit}</span>
          </div>

          {/* Huge Visually Dominant Temperature */}
          <div className="flex items-start mt-2">
            <span className="text-6xl xs:text-7xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none text-white drop-shadow-md">
              {temp}
            </span>
            <span className="text-2xl xs:text-3xl sm:text-3xl lg:text-4xl font-light text-white/80 -mt-1 ml-1">
              {tempUnit}
            </span>
          </div>
        </div>

        {/* RIGHT: AQI (Displayed with identical typographic prominence) */}
        <div className="flex flex-col items-start text-left sm:border-l sm:border-white/15 sm:pl-6 lg:pl-8">
          {/* AQI Quality Status */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${aqiInfo.dotColor} animate-pulse shadow-sm`} />
            <span className={`text-xl xs:text-2xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${aqiInfo.textColor} drop-shadow-sm truncate`}>
              {aqiInfo.label} Air
            </span>
          </div>

          {/* PM2.5 & PM10 Details */}
          <div className="flex items-center flex-wrap gap-2 xs:gap-2.5 text-xs xs:text-sm font-medium text-white/85">
            <span>PM 2.5: {activePm25}</span>
            <span className="w-1 h-1 rounded-full bg-white/50" />
            <span>PM 10: {aqiInfo.pm10}</span>
          </div>

          {/* Huge Visually Dominant AQI Score */}
          <div className="flex items-start mt-2">
            <span className={`text-6xl xs:text-7xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-none ${aqiInfo.textColor} drop-shadow-md`}>
              {aqiInfo.score}
            </span>
            <span className="text-2xl xs:text-3xl sm:text-3xl lg:text-4xl font-light text-white/80 -mt-1 ml-1.5">
              AQI
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
