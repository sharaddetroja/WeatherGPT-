import React, { useMemo } from 'react';
import { Cloud, Sun, CloudRain, CloudSun, Wind, Droplets } from 'lucide-react';
import { generateDynamicHourlyForecast } from '../../services/weatherService';

export interface HourlyItem {
  time: string;
  temp_c: number;
  icon: string;
  chance_of_rain?: number;
  wind_kph?: number;
}

interface HourlyTemperatureChartProps {
  hourlyData: HourlyItem[];
  convertTemp: (val: number) => number;
  tempUnit: string;
  className?: string;
}

export const HourlyTemperatureChart: React.FC<HourlyTemperatureChartProps> = ({
  hourlyData,
  convertTemp,
  tempUnit,
  className = '',
}) => {
  // Map and convert temps for all available forecast hours (up to 12 hours)
  // Highlights according to current time as shown in photo
  const items = useMemo(() => {
    const rawList = (hourlyData && hourlyData.length > 0) 
      ? hourlyData 
      : generateDynamicHourlyForecast(28, 'Partly Cloudy');
    
    const currentHour = new Date().getHours();
    const currentHourPrefix = String(currentHour).padStart(2, '0');

    // Find if any item matches the current hour
    const activeIdx = rawList.findIndex(h => {
      const hStr = h.time.split(':')[0];
      return hStr === currentHourPrefix || h.time === 'Now';
    });

    let displayList = rawList;
    if (activeIdx > 0 && rawList.length >= 20) {
      // If 24-hour cycle provided, rotate so current hour starts first
      displayList = [...rawList.slice(activeIdx), ...rawList.slice(0, activeIdx)];
    }

    return displayList.slice(0, 12).map((h, i) => {
      const isCurrent = i === 0;
      return {
        ...h,
        displayTime: isCurrent ? 'Now' : h.time,
        temp: convertTemp(h.temp_c),
        isCurrent,
      };
    });
  }, [hourlyData, convertTemp]);

  // Find min and max for chart scaling
  const { minTemp, maxTemp, maxIndex } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    let maxIdx = 0;
    items.forEach((item, idx) => {
      if (item.temp < min) min = item.temp;
      if (item.temp > max) {
        max = item.temp;
        maxIdx = idx;
      }
    });
    return { minTemp: min - 1, maxTemp: max + 2, maxIndex: maxIdx };
  }, [items]);

  // Fluid responsive viewBox metrics (stretches 100% across card without right gap)
  const VIEWBOX_WIDTH = 1000;
  const svgHeight = 110;
  const paddingX = 45;
  const paddingTop = 28;
  const paddingBottom = 16;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const stepX = (VIEWBOX_WIDTH - paddingX * 2) / Math.max(1, items.length - 1);

  // Compute (x, y) coordinates for each point
  const points = useMemo(() => {
    return items.map((item, idx) => {
      const x = paddingX + idx * stepX;
      const normalized = (item.temp - minTemp) / (maxTemp - minTemp || 1);
      const y = paddingTop + chartHeight - normalized * chartHeight;
      return { x, y, ...item };
    });
  }, [items, minTemp, maxTemp, stepX, chartHeight]);

  // Generate smooth cubic Bezier path string
  const pathD = useMemo(() => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i === 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      // Catmull-Rom to Cubic Bezier control points
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d;
  }, [points]);

  // Area fill under the curve
  const areaD = useMemo(() => {
    if (points.length === 0) return '';
    const last = points[points.length - 1];
    const first = points[0];
    return `${pathD} L ${last.x} ${svgHeight} L ${first.x} ${svgHeight} Z`;
  }, [pathD, points, svgHeight]);

  // Weather icon helper
  const renderWeatherIcon = (icon?: string) => {
    const i = (icon || '').toLowerCase();
    if (i.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-200" />;
    if (i.includes('sun') && i.includes('cloud')) return <CloudSun className="w-5 h-5 text-amber-200" />;
    if (i.includes('sun') || i.includes('clear')) return <Sun className="w-5 h-5 text-amber-300" />;
    return <Cloud className="w-5 h-5 text-white/80" />;
  };

  const currentPoint = points[0];

  // Clean unit string without double degree symbol (e.g. °C instead of °°C)
  const formattedUnit = tempUnit.startsWith('°') ? tempUnit : `°${tempUnit}`;

  return (
    <div className={`w-full glass-panel rounded-3xl p-4 xs:p-5 sm:p-6 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-3 xs:mb-4 gap-2 flex-wrap">
        <h2 className="text-xs xs:text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-1.5 xs:gap-2">
          <span>Hourly Forecast</span>
          <span className="text-[10px] xs:text-xs px-2 xs:px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 font-medium">
            Next {items.length} Hours
          </span>
        </h2>

        <span className="text-[10px] xs:text-xs font-semibold text-white/70">
          Temperature Curve ({formattedUnit})
        </span>
      </div>

      {/* Responsive Horizontal Scroll Container on mobile, 100% fluid on desktop */}
      <div className="w-full overflow-x-auto overflow-y-hidden pb-1 -mx-1 px-1 scrollbar-none">
        <div className="min-w-[620px] sm:min-w-0 w-full relative select-none">
        
        {/* Active Hour Vertical Glass Highlight Column - EXACTLY matching iOS photo */}
        {currentPoint && (
          <div 
            className="absolute top-1 bottom-1 rounded-[28px] pointer-events-none transition-all duration-300 z-0"
            style={{
              left: `${(currentPoint.x / VIEWBOX_WIDTH) * 100}%`,
              transform: 'translateX(-50%)',
              width: `${Math.max(7.2, (74 / VIEWBOX_WIDTH) * 100)}%`,
              minWidth: '58px',
              maxWidth: '76px',
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.05) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              boxShadow: '0 8px 24px -4px rgba(0, 0, 0, 0.20)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
        )}

        {/* SVG Smooth Temperature Curve (Scales 100% width) */}
        <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${svgHeight}`} className="w-full h-auto overflow-visible block z-10 relative">
          <defs>
            {/* Curve Gradient: Solid Soft Green */}
            <linearGradient id="tempGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#83C78C" />
              <stop offset="100%" stopColor="#83C78C" />
            </linearGradient>

            {/* Area fill gradient */}
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.20)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.00)" />
            </linearGradient>
          </defs>

          {/* Dotted horizontal baseline through current temperature */}
          {currentPoint && (
            <line
              x1={paddingX}
              y1={currentPoint.y}
              x2={VIEWBOX_WIDTH - paddingX}
              y2={currentPoint.y}
              stroke="rgba(255, 255, 255, 0.35)"
              strokeDasharray="4 4"
              strokeWidth="1.2"
            />
          )}

          {/* Area under curve */}
          <path d={areaD} fill="url(#areaGradient)" />

          {/* Smooth Spline Curve */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#tempGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Render Data Point Markers & Temperature Labels for EVERY Point */}
          {points.map((pt, idx) => {
            const isMax = idx === maxIndex;
            const isNow = idx === 0;

            return (
              <g key={idx}>
                {/* Node Dot on Spline Curve */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isNow ? "6" : isMax ? "5" : "4.5"}
                  fill={isNow ? "#22C55E" : isMax ? "#EF4444" : "#83C78C"}
                  stroke="#FFFFFF"
                  strokeWidth={isNow ? "2.5" : "2"}
                  className="drop-shadow-xs"
                />
                {/* Temperature Text Label Above Point - EXACTLY like 29° in photo */}
                <text
                  x={pt.x}
                  y={pt.y - 10}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize={isNow ? "13" : "12"}
                  fontWeight={isNow ? "800" : "700"}
                  className="select-none tracking-tight"
                >
                  {pt.temp}°
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hourly Column Items Aligned Directly Below Points Across 100% Width */}
        <div className="relative w-full pt-3 pb-1 h-28 z-20">
          {points.map((pt, idx) => (
            <div
              key={idx}
              className="absolute flex flex-col items-center justify-between text-center transition-all group"
              style={{
                left: `${(pt.x / VIEWBOX_WIDTH) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {/* Weather Condition Icon */}
              <div className="my-1 transition-transform group-hover:scale-110">
                {renderWeatherIcon(pt.icon)}
              </div>

              {/* Wind Propeller / Speed */}
              <div className="flex items-center gap-1 text-[11px] text-white/80 font-medium my-0.5">
                <Wind className="w-3 h-3 text-white/70" />
                <span>{pt.wind_kph ? `${Math.round(pt.wind_kph)}k` : '3k'}</span>
              </div>

              {/* Rain Probability % */}
              <div className="flex items-center gap-0.5 text-[10px] text-[#A795ED] font-bold my-0.5">
                <Droplets className="w-2.5 h-2.5 text-[#A795ED]" />
                <span>{pt.chance_of_rain || 0}%</span>
              </div>

              {/* Time Label */}
              <span className={`text-xs mt-1 tracking-tight ${pt.isCurrent ? 'text-white font-black' : 'text-white/70 font-bold'}`}>
                {pt.displayTime}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
  );
};
