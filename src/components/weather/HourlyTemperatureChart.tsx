import React, { useMemo } from 'react';
import { Cloud, Sun, CloudRain, CloudSun, Wind, Droplets } from 'lucide-react';

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
  // Map and convert temps
  const items = useMemo(() => {
    return hourlyData.slice(0, 10).map((h, i) => ({
      ...h,
      displayTime: i === 0 ? 'Now' : h.time,
      temp: convertTemp(h.temp_c),
      isCurrent: i === 0,
    }));
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

  // SVG dimensions
  const svgWidth = Math.max(560, items.length * 75);
  const svgHeight = 110;
  const paddingX = 40;
  const paddingTop = 28;
  const paddingBottom = 16;
  const chartHeight = svgHeight - paddingTop - paddingBottom;
  const stepX = (svgWidth - paddingX * 2) / Math.max(1, items.length - 1);

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
  const renderWeatherIcon = (icon: string) => {
    const i = icon.toLowerCase();
    if (i.includes('rain')) return <CloudRain className="w-5 h-5 text-blue-200" />;
    if (i.includes('sun') && i.includes('cloud')) return <CloudSun className="w-5 h-5 text-amber-200" />;
    if (i.includes('sun') || i.includes('clear')) return <Sun className="w-5 h-5 text-amber-300" />;
    return <Cloud className="w-5 h-5 text-white/80" />;
  };

  const currentPoint = points[0];
  const maxPoint = points[maxIndex];

  return (
    <div className={`w-full glass-panel rounded-3xl p-5 sm:p-6 overflow-hidden ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
          <span>Hourly Forecast</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-medium">
            Next 10 Hours
          </span>
        </h2>
        <span className="text-xs font-semibold text-white/60">
          Temperature Curve (°{tempUnit})
        </span>
      </div>

      {/* Horizontal Scrollable Container */}
      <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 py-2">
        <div style={{ minWidth: `${svgWidth}px` }} className="relative select-none">
          {/* Active Hour Vertical Glass Highlight Column */}
          {currentPoint && (
            <div 
              className="absolute top-0 bottom-0 rounded-2xl pointer-events-none transition-all"
              style={{
                left: `${currentPoint.x - 34}px`,
                width: '68px',
                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.18) 0%, rgba(255, 255, 255, 0.05) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.22)',
              }}
            />
          )}

          {/* SVG Smooth Temperature Curve */}
          <svg width={svgWidth} height={svgHeight} className="overflow-visible block">
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
                x2={svgWidth - paddingX}
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

            {/* Peak Max Marker */}
            {maxPoint && maxIndex !== 0 && (
              <g>
                <circle cx={maxPoint.x} cy={maxPoint.y} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                <text
                  x={maxPoint.x}
                  y={maxPoint.y - 10}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="12"
                  fontWeight="bold"
                  className="select-none"
                >
                  {maxPoint.temp}°
                </text>
              </g>
            )}

            {/* Current Hour Badge Marker (matching screenshot e.g. 28) */}
            {currentPoint && (
              <g>
                <circle
                  cx={currentPoint.x}
                  cy={currentPoint.y}
                  r="14"
                  fill="rgba(255, 255, 255, 0.95)"
                  stroke="#83C78C"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                <text
                  x={currentPoint.x}
                  y={currentPoint.y + 4}
                  textAnchor="middle"
                  fill="#1E3A8A"
                  fontSize="11"
                  fontWeight="900"
                  className="select-none"
                >
                  {currentPoint.temp}
                </text>
              </g>
            )}
          </svg>

          {/* Hourly Column Items Aligned Directly Below Points */}
          <div className="flex pt-3 pb-1" style={{ width: `${svgWidth}px` }}>
            {points.map((pt, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-between text-center transition-all group"
                style={{
                  width: `${stepX}px`,
                  marginLeft: idx === 0 ? `${paddingX - stepX / 2}px` : '0px',
                }}
              >
                {/* Weather Condition Icon */}
                <div className="my-1.5 transition-transform group-hover:scale-110">
                  {renderWeatherIcon(pt.icon)}
                </div>

                {/* Wind Propeller / Speed */}
                <div className="flex items-center gap-1 text-[11px] text-white/70 font-medium my-1">
                  <Wind className="w-3 h-3 text-white/60" />
                  <span>{pt.wind_kph ? `${Math.round(pt.wind_kph)}k` : '3k'}</span>
                </div>

                {/* Rain Probability % */}
                <div className="flex items-center gap-0.5 text-[10px] text-[#A795ED] font-bold my-0.5">
                  <Droplets className="w-2.5 h-2.5 text-[#A795ED]" />
                  <span>{pt.chance_of_rain || 0}%</span>
                </div>

                {/* Time Label */}
                <span className={`text-xs font-bold mt-2 ${pt.isCurrent ? 'text-white' : 'text-white/75'}`}>
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
