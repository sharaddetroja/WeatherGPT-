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
      className={`glass-panel rounded-3xl p-4 xs:p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Subtle Lunar Glow */}
      <div className="absolute top-2 left-8 w-44 h-44 bg-sky-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Body: Left Moon Sphere & Right Telemetry */}
      <div className="flex items-center justify-between gap-4 xs:gap-5 sm:gap-8 h-full my-auto">
        {/* Left: Realistic 3D Moon Sphere & Phase Name */}
        <div className="flex flex-col items-center justify-center shrink-0">
          {/* Detailed Photorealistic Moon Sphere with Waxing Crescent Shadow */}
          <div className="relative w-20 h-20 xs:w-24 xs:h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shadow-2xl bg-[#11242e] border border-white/15 group cursor-pointer transition-transform hover:scale-105 duration-300">
            {/* Full Moon Base Texture with realistic craters and lunar maria */}
            <div 
              className="absolute inset-0 rounded-full opacity-90"
              style={{
                background: `
                  radial-gradient(circle at 75% 45%, rgba(255,255,255,0.95) 0%, rgba(220,230,238,0.9) 35%, rgba(160,175,188,0.85) 70%, rgba(100,120,135,0.8) 100%),
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
                background: `radial-gradient(circle at 25% 50%, rgba(15, 30, 38, 0.96) 0%, rgba(18, 36, 46, 0.94) 48%, rgba(25, 48, 60, 0.5) 60%, transparent 72%)`,
                boxShadow: 'inset 4px 0 12px rgba(10, 20, 28, 0.9)',
              }}
            />

            {/* Bright Crescent Highlight Rim on the right edge */}
            <div 
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                boxShadow: 'inset -5px -2px 10px rgba(255, 255, 255, 0.7), inset -1px 0 3px rgba(255, 255, 255, 0.9)',
              }}
            />
          </div>

          {/* Phase Label below moon */}
          <span className="mt-2.5 text-xs sm:text-sm font-medium text-white/90 tracking-tight text-center">
            {phaseName}
          </span>
        </div>

        {/* Right: Moonrise & Moonset Details with Matching Typography */}
        <div className="flex flex-col justify-center space-y-3.5 sm:space-y-4 text-left flex-1 min-w-0">
          {/* Moonrise */}
          <div>
            <span className="text-xs sm:text-sm text-white/75 font-medium block">
              Moonrise
            </span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5 block truncate">
              {moonriseTime}
            </span>
          </div>

          {/* Moonset */}
          <div>
            <span className="text-xs sm:text-sm text-white/75 font-medium block">
              Moonset
            </span>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5 block truncate">
              {moonsetTime}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
