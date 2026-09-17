import React from 'react';
import { motion } from 'motion/react';
import { Moon } from 'lucide-react';

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
      {/* Background Subtle Lunar Atmospheric Glow */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-28 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row with Moon Status Badge */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[11px] sm:text-xs font-semibold text-sky-200/90 uppercase tracking-wider flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-sky-300" />
          <span>Moon Phase</span>
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border shadow-xs bg-sky-500/20 text-sky-200 border-sky-400/30">
          {phaseName}
        </span>
      </div>

      {/* Centered Photorealistic Moon Sphere Visualization */}
      <div className="relative w-full h-28 sm:h-32 pt-1 flex flex-col items-center justify-center">
        {/* Photorealistic 3D Moon Sphere */}
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden shadow-[0_0_24px_rgba(56,189,248,0.22)] bg-[#0e1d28] border border-white/20 group cursor-pointer transition-transform hover:scale-105 duration-300">
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

        {/* Phase name label under the moon */}
        <span className="mt-1 text-[11px] sm:text-xs font-medium text-white/80 tracking-tight text-center">
          {phaseName}
        </span>
      </div>

      {/* Bottom Row: Moonrise on Left & Moonset on Right */}
      <div className="flex items-center justify-between pt-1">
        {/* Moonrise */}
        <div className="flex flex-col">
          <span className="text-xs sm:text-sm text-white/75 font-medium">
            Moonrise
          </span>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5">
            {moonriseTime}
          </span>
        </div>

        {/* Moonset */}
        <div className="flex flex-col items-end">
          <span className="text-xs sm:text-sm text-white/75 font-medium">
            Moonset
          </span>
          <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm mt-0.5">
            {moonsetTime}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
