import React from 'react';
import { AlertTriangle, BellRing, CloudRain, ShieldAlert, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { WeatherAlertItem } from '../../hooks/useWeatherAlerts';

interface WeatherAlertsGlassProps {
  alerts: WeatherAlertItem[];
  className?: string;
}

export const WeatherAlertsGlass: React.FC<WeatherAlertsGlassProps> = ({
  alerts,
  className = '',
}) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          border: 'border-rose-400/40',
          bg: 'bg-rose-500/15',
          badge: 'bg-rose-500/25 text-rose-200 border-rose-400/40',
          icon: AlertTriangle,
          iconColor: 'text-rose-300',
        };
      case 'High':
        return {
          border: 'border-amber-400/40',
          bg: 'bg-amber-500/15',
          badge: 'bg-amber-500/25 text-amber-200 border-amber-400/40',
          icon: ShieldAlert,
          iconColor: 'text-amber-300',
        };
      case 'Moderate':
        return {
          border: 'border-sky-400/30',
          bg: 'bg-sky-500/15',
          badge: 'bg-sky-500/25 text-sky-200 border-sky-400/40',
          icon: CloudRain,
          iconColor: 'text-sky-300',
        };
      default:
        return {
          border: 'border-white/20',
          bg: 'bg-white/10',
          badge: 'bg-white/20 text-white border-white/30',
          icon: BellRing,
          iconColor: 'text-white/80',
        };
    }
  };

  const displayAlerts = alerts.slice(0, 3);

  return (
    <div className={`glass-panel rounded-3xl p-5 sm:p-6 text-white ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellRing className="w-4 h-4 text-amber-300" />
          <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
            Weather Alerts
          </h2>
        </div>
        <Link
          to="/alerts"
          className="text-xs font-semibold text-white/70 hover:text-white flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {displayAlerts.length === 0 ? (
        <div className="p-4 rounded-2xl glass-panel text-center text-xs text-white/70">
          No active severe weather warnings for your area.
        </div>
      ) : (
        <div className="space-y-3">
          {displayAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`p-3.5 rounded-2xl border backdrop-blur-md transition-all ${style.bg} ${style.border}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-xs text-white">
                    <Icon className={`w-4 h-4 ${style.iconColor} flex-shrink-0`} />
                    <span className="truncate">{alert.title}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex-shrink-0 ${style.badge}`}>
                    {alert.severity}
                  </span>
                </div>
                <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2">
                  {alert.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-white/60 mt-2 pt-1.5 border-t border-white/10">
                  <span>{alert.expected}</span>
                  <span>{alert.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
