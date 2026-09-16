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
      className={`glass-panel rounded-3xl p-4 xs:p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Unified Main Layout: Left Axis Column + 6 Equal Data Columns */}
      <div className="flex items-stretch gap-2 xs:gap-2.5 sm:gap-3 h-full">
        
        {/* Left Axis Column: Droplets and 'mm' Label */}
        <div className="w-6 xs:w-7 sm:w-8 shrink-0 flex flex-col justify-between items-start text-white/90 select-none pb-0.5">
          {/* Top spacer matching time row height */}
          <div className="h-4 xs:h-5 sm:h-5.5" />

          {/* Chart Height Area for Droplet Icons aligned with gridlines */}
          <div className="relative h-32 xs:h-36 sm:h-40 w-full my-2 sm:my-3 flex flex-col justify-between py-1">
            {/* Upper Level: Two White Droplets */}
            <div className="flex -space-x-1.5 opacity-90 drop-shadow-sm pt-0.5">
              <Droplet className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white fill-white" />
              <Droplet className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white fill-white -mt-1" />
            </div>

            {/* Lower Level: One White Droplet */}
            <div className="opacity-90 drop-shadow-sm pb-1">
              <Droplet className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-white fill-white" />
            </div>
          </div>

          {/* Baseline Label: mm */}
          <div className="h-4 xs:h-5 sm:h-5.5 flex items-center">
            <span className="text-[11px] xs:text-xs sm:text-sm font-extrabold text-white tracking-wider">
              mm
            </span>
          </div>
        </div>

        {/* 6 Data Columns Container: Perfectly Aligned Time, Bar, and Value */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          
          {/* 1. Top Header Times Row */}
          <div className="grid grid-cols-6 gap-1 xs:gap-2 sm:gap-3 text-center text-[10px] xs:text-xs sm:text-sm font-semibold text-white/90 tracking-tight h-4 xs:h-5 sm:h-5.5 items-center">
            {items.map((item, idx) => (
              <div key={idx} className="truncate px-0.5" title={item.timeLabel}>
                {item.timeLabel}
              </div>
            ))}
          </div>

          {/* 2. Central Chart Area with Gridlines and 6 Pillars */}
          <div className="relative h-32 xs:h-36 sm:h-40 my-2 sm:my-3 flex items-end">
            {/* 4 Horizontal Ambient Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              <div className="w-full border-b border-white/15" />
              <div className="w-full border-b border-white/15" />
              <div className="w-full border-b border-white/15" />
              <div className="w-full border-b border-white/20" />
            </div>

            {/* 6 Vertical Pillars: Exactly matching the column grid */}
            <div className="relative w-full h-full grid grid-cols-6 gap-1 xs:gap-2 sm:gap-3 items-end z-10">
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
                        className="w-full max-w-[36px] xs:max-w-[44px] sm:max-w-[52px] rounded-t-xl bg-gradient-to-t from-[#205b65]/60 via-[#368b91]/80 to-[#7de0d6]/95 border-t border-x border-cyan-200/50 relative shadow-md group-hover:brightness-115 transition-all cursor-pointer"
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

          {/* 3. Bottom Rainfall Quantity (mm) Row */}
          <div className="grid grid-cols-6 gap-1 xs:gap-2 sm:gap-3 text-center text-[10px] xs:text-xs sm:text-sm font-extrabold text-white tracking-tight h-4 xs:h-5 sm:h-5.5 items-center">
            {items.map((item, idx) => (
              <div key={idx} className="truncate px-0.5">
                {item.amountMm === 0 ? '0.0' : item.amountMm.toFixed(2)}
              </div>
            ))}
          </div>

        </div>
      </div>
    </motion.div>
  );
};
