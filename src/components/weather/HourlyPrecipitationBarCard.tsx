import React, { useMemo } from 'react';
import { Droplet } from 'lucide-react';
import { motion } from 'motion/react';

export interface PrecipitationBarItem {
  timeLabel: string;
  amountMm: number;
}

interface HourlyPrecipitationBarCardProps {
  precipitationData?: PrecipitationBarItem[];
  className?: string;
}

export const HourlyPrecipitationBarCard: React.FC<HourlyPrecipitationBarCardProps> = ({
  precipitationData,
  className = '',
}) => {
  // Generate 6 time slots starting around current time + 1 hour intervals (e.g. 6:30 am, 7:30 am, ...)
  const items: PrecipitationBarItem[] = useMemo(() => {
    if (precipitationData && precipitationData.length >= 6) {
      return precipitationData.slice(0, 6);
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Exact amounts from user reference image: [1.78, 7.36, 3.94, 0.51, 0.0, 0.0]
    const baseAmounts = [1.78, 7.36, 3.94, 0.51, 0.0, 0.0];

    return baseAmounts.map((amount, idx) => {
      const h = (currentHour + idx) % 24;
      const period = h >= 12 ? 'pm' : 'am';
      const displayHour = h % 12 === 0 ? 12 : h % 12;
      return {
        timeLabel: `${displayHour}:30 ${period}`,
        amountMm: amount,
      };
    });
  }, [precipitationData]);

  const maxAmount = useMemo(() => {
    const max = Math.max(...items.map((i) => i.amountMm), 8.0);
    return Math.ceil(max * 1.15 * 10) / 10;
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`glass-panel rounded-3xl p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Times Row */}
      <div className="grid grid-cols-6 text-center text-xs sm:text-sm font-semibold text-white/90 tracking-tight pb-3">
        {items.map((item, idx) => (
          <div key={idx} className="truncate px-0.5">
            {item.timeLabel}
          </div>
        ))}
      </div>

      {/* Central Chart Area with Exact Horizontal Gridlines & Rain Drops */}
      <div className="relative my-4 sm:my-5 h-36 sm:h-40 flex items-end">
        {/* Left Indicator Droplet Icons (Upper: Two Droplets, Lower: One Droplet) */}
        <div className="absolute -left-1 top-0 bottom-0 flex flex-col justify-between items-start text-white/90 pointer-events-none z-10 py-1">
          {/* Top Guideline Spacer */}
          <div className="h-0.5" />
          
          {/* Upper Level: Two White Droplets */}
          <div className="flex -space-x-1.5 opacity-90 drop-shadow-sm">
            <Droplet className="w-3.5 h-3.5 text-white fill-white" />
            <Droplet className="w-3.5 h-3.5 text-white fill-white -mt-1" />
          </div>

          {/* Lower Level: One White Droplet */}
          <div className="opacity-90 drop-shadow-sm">
            <Droplet className="w-3.5 h-3.5 text-white fill-white" />
          </div>

          {/* Baseline Spacer */}
          <div className="h-0.5" />
        </div>

        {/* 4 Horizontal Ambient Grid Lines exactly as in photo */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-b border-white/15" />
          <div className="w-full border-b border-white/15" />
          <div className="w-full border-b border-white/15" />
          <div className="w-full border-b border-white/20" />
        </div>

        {/* 6 Vertical Rainfall Columns with Liquid Surface Tops */}
        <div className="relative w-full h-full grid grid-cols-6 gap-2 sm:gap-4 pl-6 sm:pl-8 pr-1 sm:pr-2 items-end z-10">
          {items.map((item, idx) => {
            const hasValue = item.amountMm > 0;
            const heightPercent = hasValue 
              ? Math.max(16, Math.min(92, (item.amountMm / maxAmount) * 100))
              : 0;

            return (
              <div key={idx} className="h-full flex flex-col justify-end items-center group">
                {hasValue ? (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercent}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                    className="w-full max-w-[54px] rounded-t-xl bg-gradient-to-t from-[#205b65]/60 via-[#368b91]/80 to-[#7de0d6]/95 border-t border-x border-cyan-200/50 relative shadow-md group-hover:brightness-115 transition-all cursor-pointer"
                  >
                    {/* Wavy Liquid Meniscus Cap */}
                    <div className="absolute -top-[2px] left-0 right-0 h-[4px] rounded-full bg-cyan-100/95 shadow-[0_0_8px_rgba(207,250,254,0.9)]" />
                    {/* Soft Shimmer Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/25 via-cyan-100/10 to-transparent opacity-80 rounded-t-xl" />
                  </motion.div>
                ) : (
                  <div className="w-full h-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Rainfall Quantity (mm) Row */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-2 pt-2">
        <span className="text-xs sm:text-sm font-extrabold text-white tracking-wider pl-1">
          mm
        </span>
        <div className="grid grid-cols-6 text-center text-xs sm:text-sm font-extrabold text-white tracking-tight">
          {items.map((item, idx) => (
            <div key={idx} className="truncate px-0.5">
              {item.amountMm === 0 ? '0.0' : item.amountMm.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
