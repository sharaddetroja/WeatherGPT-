import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface MoonPhaseCardProps {
  phaseName?: string;
  moonriseTime?: string;
  moonsetTime?: string;
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

export const MoonPhaseCard: React.FC<MoonPhaseCardProps> = ({
  phaseName = 'Waxing crescent',
  moonriseTime = '11:12 am',
  moonsetTime = '10:03 pm',
  className = '',
}) => {
  // Calculate moon position along trajectory based on current time or reference progress
  const { moonX, moonY, progressT } = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const mRise = parseTimeToMinutes(moonriseTime) ?? (11 * 60 + 12);
    let mSet = parseTimeToMinutes(moonsetTime) ?? (22 * 60 + 3);

    // If moonset is earlier in the day than moonrise, it sets the next day
    let totalDuration = mSet - mRise;
    let elapsed = currentMinutes - mRise;

    if (totalDuration <= 0) {
      totalDuration += 24 * 60;
      if (currentMinutes < mRise) {
        elapsed += 24 * 60;
      }
    }

    let t = 0.62; // Default elegant position along trajectory
    if (totalDuration > 0) {
      if (elapsed >= 0 && elapsed <= totalDuration) {
        t = elapsed / totalDuration;
      } else if (elapsed > totalDuration) {
        t = 0.88; // Near moonset
      } else {
        t = 0.15; // Past moonrise
      }
    }

    const clampedT = Math.max(0.06, Math.min(0.94, t));

    // Trajectory geometry identical to sun arc:
    // Moonrise at (65, 75), peak at (160, 22), Moonset at (255, 75)
    const x = 65 + clampedT * (255 - 65);
    const y = 75 - Math.sin(clampedT * Math.PI) * 53;

    return {
      moonX: Math.round(x * 10) / 10,
      moonY: Math.round(y * 10) / 10,
      progressT: clampedT,
    };
  }, [moonriseTime, moonsetTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.05 }}
      className={`glass-panel rounded-3xl p-4 xs:p-5 sm:p-6 text-white border border-white/20 shadow-2xl backdrop-blur-2xl relative select-none overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Background Lunar Cyan/Sky Ambient Glow */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-28 bg-sky-400/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Row with Phase Name Badge */}
      <div className="flex items-center justify-between z-10">
        <span className="text-[11px] sm:text-xs font-semibold text-sky-200 uppercase tracking-wider flex items-center gap-1.5">
          Moon Phase
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 shadow-xs">
          {phaseName}
        </span>
      </div>

      {/* Moon Arc Trajectory Visualization */}
      <div className="relative w-full h-28 sm:h-32 pt-1 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 320 120"
          className="w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Soft Lunar Glow Filter */}
            <filter id="moon-arc-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Clipping rect above horizon line (y: 0 to 75) */}
            <clipPath id="above-horizon-clip-moon">
              <rect x="0" y="0" width="320" height="75" />
            </clipPath>

            {/* Clipping rect below horizon line (y: 75 to 120) */}
            <clipPath id="below-horizon-clip-moon">
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

          {/* 1. Arc Portion BELOW Horizon (Muted deep sky line) */}
          <g clipPath="url(#below-horizon-clip-moon)">
            <path
              d="M 5,95 C 38,90 48,82 65,75 M 255,75 C 272,82 282,90 315,95"
              fill="none"
              stroke="#4B6B82"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </g>

          {/* 2. Arc Portion ABOVE Horizon */}
          <g clipPath="url(#above-horizon-clip-moon)">
            {/* Base Faded Lunar Path to Moonset */}
            <path
              d="M 65,75 C 95,62 120,22 160,22 C 200,22 225,62 255,75"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.32"
            />

            {/* Active Luminous Lunar Arc from Moonrise to Current Moon Position */}
            <path
              d="M 65,75 C 95,62 120,22 160,22 C 200,22 225,62 255,75"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3.5"
              strokeLinecap="round"
              filter="url(#moon-arc-glow)"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - (progressT * 100)}
            />

            {/* Vertical Moon Ray beam down to horizon */}
            <line
              x1={moonX}
              y1={moonY + 4}
              x2={moonX}
              y2="75"
              stroke="rgba(186, 230, 253, 0.25)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />

            {/* Radiant Glowing Moon Orb sitting exactly on the moon trajectory line */}
            <g>
              {/* Outer Pulsing Glow */}
              <circle
                cx={moonX}
                cy={moonY}
                r="13"
                fill="#38BDF8"
                opacity="0.35"
                filter="url(#moon-arc-glow)"
              />
              {/* Mid Cyan/Sky Aura */}
              <circle
                cx={moonX}
                cy={moonY}
                r="8.5"
                fill="#0284C7"
                opacity="0.8"
              />
              {/* Inner Radiant Moon Sphere */}
              <circle
                cx={moonX}
                cy={moonY}
                r="5.5"
                fill="#F0F9FF"
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              {/* Delicate Crescent Silhouette Accent */}
              <path
                d={`M ${moonX - 1.2} ${moonY - 4.2} A 4.2 4.2 0 0 0 ${moonX - 1.2} ${moonY + 4.2} A 3.2 3.2 0 0 1 ${moonX - 1.2} ${moonY - 4.2} Z`}
                fill="#0F2438"
                opacity="0.6"
              />
            </g>
          </g>
        </svg>
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
