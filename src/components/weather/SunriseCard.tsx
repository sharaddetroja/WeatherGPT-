import React from 'react';
import { motion } from 'motion/react';

interface SunriseCardProps {
  sunriseTime?: string;
  sunsetTime?: string;
  className?: string;
}

export const SunriseCard: React.FC<SunriseCardProps> = ({
  sunriseTime = '6:32 am',
  sunsetTime = '6:51 pm',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className={`glass-panel rounded-3xl p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Solar Warm Glow */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-28 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Sun Arc Trajectory Visualization */}
      <div className="relative w-full h-28 sm:h-32 pt-2 flex items-center justify-center overflow-hidden">
        <svg 
          viewBox="0 0 320 120" 
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Warm Glow for the Daytime Arc */}
            <filter id="sun-arc-glow" x="-20%" y="-20%" width="140%" height="140%">
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

          {/* Full Arc Path Geometry:
              Starts at (5, 95) -> rises smoothly crossing horizon at (65, 75) -> peaks at (160, 22) ->
              crosses horizon at (255, 75) -> ends at (315, 95)
          */}

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

          {/* 2. Arc Portion ABOVE Horizon (Luminous Golden-Yellow Curve) */}
          <g clipPath="url(#above-horizon-clip)">
            <path
              d="M 65,75 C 95,62 120,22 160,22 C 200,22 225,62 255,75"
              fill="none"
              stroke="#FACC15"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#sun-arc-glow)"
            />
          </g>
        </svg>
      </div>

      {/* Bottom Row: Sunrise on Left & Sunset on Right */}
      <div className="flex items-center justify-between pt-2">
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
