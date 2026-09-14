import React from 'react';
import { 
  Droplets, 
  Wind, 
  Sun, 
  Eye, 
  Gauge, 
  CloudRain, 
  Thermometer, 
  Compass,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { getCityAQI } from '../../utils/airQuality';

interface WeatherDetailsGridProps {
  feelsLike: number | string;
  tempUnit: string;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  uvIndex: number;
  visibilityKm: number;
  pressureMb: number;
  precipMm?: number;
  rainProbability?: number;
  aqi?: number;
  locationName?: string;
  className?: string;
}

export const WeatherDetailsGrid: React.FC<WeatherDetailsGridProps> = ({
  feelsLike,
  tempUnit,
  humidity,
  windSpeed,
  windDirection = 'NW',
  uvIndex,
  visibilityKm,
  pressureMb,
  precipMm = 0.0,
  rainProbability = 10,
  aqi,
  locationName,
  className = '',
}) => {
  const aqiInfo = getCityAQI(locationName, typeof aqi === 'number' ? aqi : undefined);
  const getUVDescription = (uv: number) => {
    if (uv <= 2) return 'Low';
    if (uv <= 5) return 'Moderate';
    if (uv <= 7) return 'High';
    if (uv <= 10) return 'Very High';
    return 'Extreme';
  };

  const getHumidityDescription = (hum: number) => {
    if (hum < 30) return 'Dry';
    if (hum <= 60) return 'Comfortable';
    if (hum <= 80) return 'Humid';
    return 'Very Humid';
  };

  const formattedUnit = tempUnit.startsWith('°') ? tempUnit : `°${tempUnit}`;

  const metrics = [
    {
      label: 'Feels Like',
      value: `${feelsLike}${formattedUnit}`,
      subtext: 'Similar to actual temp',
      icon: Thermometer,
      accent: 'text-orange-300',
    },
    {
      label: 'Humidity',
      value: `${humidity}%`,
      subtext: getHumidityDescription(humidity),
      icon: Droplets,
      accent: 'text-sky-300',
    },
    {
      label: 'Wind',
      value: `${windSpeed} km/h`,
      subtext: `${windDirection} Direction`,
      icon: Wind,
      accent: 'text-teal-300',
    },
    {
      label: 'UV Index',
      value: `${uvIndex}`,
      subtext: getUVDescription(uvIndex),
      icon: Sun,
      accent: 'text-amber-300',
    },
    {
      label: 'Visibility',
      value: `${visibilityKm} km`,
      subtext: visibilityKm >= 10 ? 'Clear distance' : 'Hazy',
      icon: Eye,
      accent: 'text-emerald-300',
    },
    {
      label: 'Pressure',
      value: `${pressureMb} hPa`,
      subtext: 'Steady barometric',
      icon: Gauge,
      accent: 'text-purple-300',
    },
    {
      label: 'Precipitation',
      value: `${precipMm} mm`,
      subtext: 'In last 24 hours',
      icon: CloudRain,
      accent: 'text-blue-300',
    },
    {
      label: 'Rain Probability',
      value: `${rainProbability}%`,
      subtext: rainProbability > 50 ? 'Rain expected' : 'Low chance',
      icon: Compass,
      accent: 'text-cyan-300',
    },
  ];

  return (
    <div className={`glass-panel rounded-3xl p-3.5 xs:p-4 sm:p-6 text-white h-full flex flex-col justify-between ${className}`}>
      <div>
        <h2 className="text-sm sm:text-base font-bold text-white tracking-wide mb-4 flex items-center justify-between">
          <span>Weather Details</span>
          <span className="text-[11px] sm:text-xs font-semibold text-white/60">Live Sensor Feed</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2.5 xs:gap-3 sm:gap-3.5">
          {metrics.map((m, idx) => {
            const Icon = m.icon;
            return (
              <div
                key={idx}
                className="glass-panel glass-panel-hover p-2.5 xs:p-3 sm:p-3.5 rounded-2xl flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-white/70">
                  <span className="text-[11px] xs:text-xs font-semibold text-white/75 truncate pr-1">{m.label}</span>
                  <Icon className={`w-3.5 h-3.5 xs:w-4 xs:h-4 shrink-0 ${m.accent}`} />
                </div>
                <div className="mt-2 xs:mt-2.5">
                  <div className="text-base xs:text-lg sm:text-xl font-extrabold text-white tracking-tight">
                    {m.value}
                  </div>
                  <div className="text-[10px] xs:text-[11px] font-medium text-white/60 truncate mt-0.5">
                    {m.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Integrated City Air Quality Summary Pill Banner */}
      <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-xl ${aqiInfo.badgeBg} border ${aqiInfo.badgeBorder} shrink-0`}>
            <Activity className={`w-4 h-4 ${aqiInfo.textColor}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-white">City Air Quality</span>
              <span className={`px-2 py-0.2 rounded-full text-[10px] font-extrabold ${aqiInfo.badgeBg} ${aqiInfo.textColor} border ${aqiInfo.badgeBorder}`}>
                AQI {aqiInfo.score} • {aqiInfo.label}
              </span>
            </div>
            <p className="text-[10px] text-white/65 truncate mt-0.5">
              PM 2.5: {aqiInfo.pm25} µg/m³ · PM 10: {aqiInfo.pm10} µg/m³
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[11px] text-white/75 font-medium shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>{aqiInfo.category === 'good' || aqiInfo.category === 'moderate' ? 'Safe outdoors' : 'Caution outdoors'}</span>
        </div>
      </div>
    </div>
  );
};
