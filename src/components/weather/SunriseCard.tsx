import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface SunriseCardProps {
  sunriseTime?: string;
  sunsetTime?: string;
  isDay?: boolean;
  className?: string;
}

function parseTimeToMinutes(timeStr?: string): number | null {
  if (!timeStr) return null;
  const cleaned = timeStr.trim().toLowerCase();
  const match = cleaned.match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3];
  if (period === 'pm' && hours < 12) hours += 12;
  if (period === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

export const SunriseCard: React.FC<SunriseCardProps> = ({
  sunriseTime = '6:32 am',
  sunsetTime = '6:51 pm',
  isDay: propIsDay,
  className = '',
}) => {
  // Dynamically calculate sun position and daytime presence
  const { sunX, sunY, progressT, isDaytime, statusLabel } = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const sMin = parseTimeToMinutes(sunriseTime) ?? (6 * 60 + 32);
    const eMin = parseTimeToMinutes(sunsetTime) ?? (18 * 60 + 51);

    const isDay = propIsDay !== undefined 
      ? propIsDay 
      : (eMin > sMin ? (currentMinutes >= sMin && currentMinutes <= eMin) : true);

    let t = 0.5;
    if (eMin > sMin) {
      if (currentMinutes >= sMin && currentMinutes <= eMin) {
        t = (currentMinutes - sMin) / (eMin - sMin);
      } else if (currentMinutes > eMin) {
        t = 1.0;
      } else {
        t = 0.0;
      }
    }

    const clampedT = Math.max(0.06, Math.min(0.94, t));
    
    // Arc geometry: sunrise at (65, 75), peak at (160, 22), sunset at (255, 75)
    const x = 65 + clampedT * (255 - 65);
    const y = 75 - Math.sin(clampedT * Math.PI) * 53;

    let label = 'Daylight';
    if (!isDay) {
      label = currentMinutes > eMin ? 'Sun has set' : 'Night';
    }

    return { 
      sunX: Math.round(x * 10) / 10, 
      sunY: Math.round(y * 10) / 10, 
      progressT: clampedT,
      isDaytime: isDay,
      statusLabel: label
    };
  }, [sunriseTime, sunsetTime, propIsDay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className={`glass-panel rounded-3xl p-4 xs:p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Solar Warm Glow (active during daytime) */}
      <div 
        className={`absolute top-2 left-1/2 -translate-x-1/2 w-48 h-28 rounded-full blur-2xl pointer-events-none transition-opacity duration-500 ${
          isDaytime ? 'bg-amber-400/15 opacity-100' : 'bg-indigo-950/20 opacity-40'
        }`} 
      />

      {/* Top Header Row with Sun Status Badge */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[11px] sm:text-xs font-semibold text-amber-200/90 uppercase tracking-wider flex items-center gap-1.5">
          Sun Position
        </span>
        <span className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs transition-colors ${
          isDaytime 
            ? 'bg-amber-500/20 text-amber-200 border-amber-400/30' 
            : 'bg-white/10 text-white/70 border-white/15'
        }`}>
          {statusLabel}
        </span>
      </div>

      {/* Sun Arc Trajectory Visualization */}
      <div className="relative w-full h-28 sm:h-32 pt-1 flex items-center justify-center overflow-hidden">
        <svg 
          viewBox="0 0 320 120" 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Warm Glow for the Daytime Arc */}
            <filter id="sun-arc-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clipping rect above horizon line (y: 0 to 75) */}
            <clipPath id="above-horizon-clip">
              <rect x="0" y="0" width="320" height="75" />
            </clipPath>

            {/* Clipping rect below horizon line (y: 75 to 120) */}
            <clipPath id="below-horizon-clip">
              <rect x="0" y="75" width="320" height="45" />
            </clipPath>
          </defs>

          {/* Subtle Darkened Overlay Below Horizon Line */}
          <rect 
            x="0" 
            y="75" 
            width="320" 
            height="45" 
            fill="rgba(8, 24, 34, 0.22)" 
          />

          {/* Horizontal Horizon Guideline */}
          <line
            x1="0"
            y1="75"
            x2="320"
            y2="75"
            stroke="rgba(255, 255, 255, 0.18)"
            strokeWidth="1.5"
          />

          {/* 1. Arc Portion BELOW Horizon (Muted sage/slate line on left and right) */}
          <g clipPath="url(#below-horizon-clip)">
            <path
              d="M 5,95 C 38,90 48,82 65,75 M 255,75 C 272,82 282,90 315,95"
              fill="none"
              stroke="#839789"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.85"
            />
          </g>

          {/* 2. Arc Portion ABOVE Horizon */}
          <g clipPath="url(#above-horizon-clip)">
            {/* Base Faded Daytime Path to Sunset */}
            <path
              d="M 65,75 C 95,62 120,22 160,22 C 200,22 225,62 255,75"
              fill="none"
              stroke="#FACC15"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.3"
            />

            {/* Active Luminous Golden Arc from Sunrise to Current Sun Position (Daytime only) */}
            {isDaytime && (
              <path
                d="M 65,75 C 95,62 120,22 160,22 C 200,22 225,62 255,75"
                fill="none"
                stroke="#FACC15"
                strokeWidth="3.5"
                strokeLinecap="round"
                filter="url(#sun-arc-glow)"
                pathLength="100"
                strokeDasharray="100"
                strokeDashoffset={100 - (progressT * 100)}
              />
            )}

            {/* Vertical Sun Ray beam down to horizon (Daytime only) */}
            {isDaytime && (
              <line 
                x1={sunX} 
                y1={sunY + 4} 
                x2={sunX} 
                y2="75" 
                stroke="rgba(254, 240, 138, 0.22)" 
                strokeWidth="1.5" 
                strokeDasharray="2 2" 
              />
            )}

            {/* Radiant Glowing Sun Orb sitting exactly on the sunset trajectory line (Daytime only) */}
            {isDaytime && (
              <g>
                {/* Outer Pulsing Glow */}
                <circle 
                  cx={sunX} 
                  cy={sunY} 
                  r="13" 
                  fill="#FBBF24" 
                  opacity="0.3" 
                  filter="url(#sun-arc-glow)" 
                />
                {/* Mid Golden Aura */}
                <circle 
                  cx={sunX} 
                  cy={sunY} 
                  r="8.5" 
                  fill="#F59E0B" 
                  opacity="0.8" 
                />
                {/* Inner Radiant Core */}
                <circle 
                  cx={sunX} 
                  cy={sunY} 
                  r="5.5" 
                  fill="#FEF08A" 
                  stroke="#FFFFFF" 
                  strokeWidth="1" 
                />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Bottom Row: Sunrise on Left & Sunset on Right */}
      <div className="flex items-center justify-between pt-1">
        {/* Sunrise */}
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm text-white/75 font-medium">
            Sunrise
          </span>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5">
            {sunriseTime}
          </span>
        </div>

        {/* Sunset */}
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm text-white/75 font-medium">
            Sunset
          </span>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5">
            {sunsetTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
