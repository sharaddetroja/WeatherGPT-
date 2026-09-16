import React from 'react';
import { motion } from 'motion/react';

interface MoonPhaseCardProps {
  phaseName?: string;
  moonriseTime?: string;
  moonsetTime?: string;
  className?: string;
}

export const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
  phaseName = 'Waxing crescent',
  moonriseTime = '11:12 am',
  moonsetTime = '10:03 pm',
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className={`glass-panel rounded-3xl p-4 sm:p-5 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex items-center justify-center ${className}`}
    >
      {/* Background Subtle Lunar Glow */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Body: Left Moon Sphere & Right Telemetry without extra space */}
      <div className="flex items-center justify-center gap-6 sm:gap-9 w-full max-w-sm mx-auto">
        {/* Left: Photorealistic Moon Sphere with Waxing Crescent Shadow & Phase Name */}
        <div className="flex flex-col items-center justify-center shrink-0">
          {/* Photorealistic Moon Sphere */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl bg-[#0e1d28] border border-white/15 group cursor-pointer transition-transform hover:scale-105 duration-300">
            {/* Full Moon Base Texture with realistic craters and lunar maria */}
            <div 
              className="absolute inset-0 rounded-full opacity-90"
              style={{
                background: `
                  radial-gradient(circle at 75% 45%, rgba(255,255,255,0.98) 0%, rgba(225,235,245,0.92) 35%, rgba(160,175,190,0.85) 70%, rgba(95,115,130,0.8) 100%),
                  radial-gradient(circle at 60% 30%, rgba(70,85,95,0.4) 0%, transparent 40%),
                  radial-gradient(circle at 80% 65%, rgba(60,75,85,0.5) 0%, transparent 35%),
                  radial-gradient(circle at 65% 75%, rgba(90,105,115,0.4) 0%, transparent 30%),
                  radial-gradient(circle at 45% 40%, rgba(50,65,75,0.6) 0%, transparent 45%)
                `,
              }}
            />

            {/* Waxing Crescent Elliptical Dark Shadow (Shading left-side of moon) */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: `radial-gradient(circle at 22% 50%, rgba(12, 25, 36, 0.96) 0%, rgba(15, 32, 45, 0.93) 48%, rgba(20, 42, 58, 0.55) 62%, transparent 72%)`,
                boxShadow: 'inset 4px 0 10px rgba(8, 18, 26, 0.9)',
              }}
            />

            {/* Bright Crescent Highlight Rim on the right edge */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: 'inset -5px -2px 10px rgba(255, 255, 255, 0.75), inset -1px 0 3px rgba(255, 255, 255, 0.95)',
              }}
            />
          </div>

          {/* Phase Label directly below moon */}
          <span className="mt-2 text-xs sm:text-sm font-medium text-white/90 tracking-tight text-center whitespace-nowrap">
            {phaseName}
          </span>
        </div>

        {/* Right: Moonrise & Moonset Details with Matching Typography */}
        <div className="flex flex-col justify-center space-y-3 sm:space-y-4 text-left">
          {/* Moonrise */}
          <div>
            <span className="text-xs sm:text-sm text-white/75 font-medium block">
              Moonrise
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5 block whitespace-nowrap">
              {moonriseTime}
            </span>
          </div>

          {/* Moonset */}
          <div>
            <span className="text-xs sm:text-sm text-white/75 font-medium block">
              Moonset
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5 block whitespace-nowrap">
              {moonsetTime}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
