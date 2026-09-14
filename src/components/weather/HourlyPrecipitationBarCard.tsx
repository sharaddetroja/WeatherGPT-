import React, { useMemo } from 'react';
import { Droplets } from 'lucide-react';
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
  // Generate 6 time slots starting around current time + 30m intervals (e.g. 7:30 pm, 8:30 pm, ...)
  const items: PrecipitationBarItem[] = useMemo(() => {
    if (precipitationData && precipitationData.length >= 6) {
      return precipitationData.slice(0, 6);
    }

    const now = new Date();
    const currentHour = now.getHours();
    
    // Sample fallback amounts resembling realistic rain radar (e.g. 1.58, 1.94, 2.74, 3.01, 1.23, 0.54)
    const baseAmounts = [1.58, 1.94, 2.74, 3.01, 1.23, 0.54];

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
    const max = Math.max(...items.map((i) => i.amountMm), 3.5);
    return Math.ceil(max * 1.15 * 10) / 10;
  }, [items]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`relative select-none overflow-hidden rounded-3xl p-5 sm:p-6 text-white border border-white/15 bg-gradient-to-b from-[#244353]/90 via-[#1c3846]/90 to-[#142d3a]/90 backdrop-blur-xl shadow-xl flex flex-col justify-between ${className}`}
    >
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Times Row */}
      <div className="grid grid-cols-6 text-center text-[11px] sm:text-xs md:text-sm font-medium text-white/85 tracking-tight border-b border-white/10 pb-3">
        {items.map((item, idx) => (
          <div key={idx} className="truncate px-0.5 font-semibold">
            {item.timeLabel}
          </div>
        ))}
      </div>

      {/* Central Chart Area with Horizontal Guideline Grid & Rain Drops */}
      <div className="relative my-4 sm:my-6 h-36 sm:h-40 flex items-end">
        {/* Left Indicator Droplet Icons */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between items-center pr-2 text-white/60 pointer-events-none z-10">
          <div className="flex -space-x-1">
            <Droplets className="w-3.5 h-3.5 text-sky-200/80" />
            <Droplets className="w-3 h-3 text-sky-300/80 -mt-1" />
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-sky-300/60" />
        </div>

        {/* Horizontal Ambient Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="w-full border-b border-white/5" />
          <div className="w-full border-b border-white/10" />
          <div className="w-full border-b border-white/10" />
          <div className="w-full border-b border-white/15" />
        </div>

        {/* 6 Vertical Rainfall Columns with Liquid Surface Tops */}
        <div className="relative w-full h-full grid grid-cols-6 gap-2 sm:gap-3.5 px-2 sm:px-3 items-end z-10">
          {items.map((item, idx) => {
            const heightPercent = Math.max(18, Math.min(94, (item.amountMm / maxAmount) * 100));

            return (
              <div key={idx} className="h-full flex flex-col justify-end items-center group">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPercent}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.08, ease: 'easeOut' }}
                  className="w-full max-w-[56px] rounded-t-lg sm:rounded-t-xl bg-gradient-to-t from-[#2a6882]/70 via-[#459ab5]/85 to-[#87d3e6]/95 border-t border-x border-sky-200/40 relative shadow-sm group-hover:brightness-110 transition-all cursor-pointer"
                >
                  {/* Subtle Curved Liquid Meniscus Cap */}
                  <div className="absolute -top-[2px] left-0 right-0 h-[4px] rounded-full bg-white/75 blur-[0.5px]" />
                  {/* Vertical Rain Strands Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent opacity-60 rounded-t-lg" />
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Rainfall Quantity (mm) Row */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-2 border-t border-white/10 pt-3">
        <span className="text-[11px] sm:text-xs font-bold text-white/70 tracking-wider uppercase pl-1">
          mm
        </span>
        <div className="grid grid-cols-6 text-center text-xs sm:text-sm font-bold text-white tracking-tight">
          {items.map((item, idx) => (
            <div key={idx} className="truncate px-0.5">
              {item.amountMm.toFixed(2)}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
