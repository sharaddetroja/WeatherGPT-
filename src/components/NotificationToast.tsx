import { useNavigate } from 'react-router-dom';
import { CloudRain, Wind, ThermometerSun, AlertTriangle, X, ChevronRight, BellRing } from 'lucide-react';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { cn } from '../utils/cn';
import { useLanguage } from '../hooks/useLanguage';

export default function NotificationToast() {
  const { activeToast, dismissToast, markAsRead } = useWeatherAlerts();
  const navigate = useNavigate();
  const { t } = useLanguage();

  if (!activeToast) return null;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'rain': return CloudRain;
      case 'wind': return Wind;
      case 'temp': return ThermometerSun;
      default: return AlertTriangle;
    }
  };

  const Icon = getTypeIcon(activeToast.type);

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return {
          bg: 'bg-red-500/15 border-red-500/40 text-red-600 dark:text-red-400',
          badge: 'bg-red-500 text-white',
          pulse: 'bg-red-500'
        };
      case 'High':
        return {
          bg: 'bg-orange-500/15 border-orange-500/40 text-orange-600 dark:text-orange-400',
          badge: 'bg-orange-500 text-white',
          pulse: 'bg-orange-500'
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-500 text-white',
          pulse: 'bg-amber-500'
        };
      default:
        return {
          bg: 'bg-blue-500/15 border-blue-500/40 text-blue-600 dark:text-blue-400',
          badge: 'bg-blue-500 text-white',
          pulse: 'bg-blue-500'
        };
    }
  };

  const styles = getSeverityStyles(activeToast.severity);

  const handleOpenAlerts = () => {
    markAsRead(activeToast.id);
    dismissToast();
    navigate('/alerts');
  };

  return (
    <aside 
      aria-label="Weather Alert Notification"
      className="fixed top-18 sm:top-20 left-3 right-3 sm:left-auto sm:right-6 md:right-8 z-[120] sm:w-[420px] max-w-[calc(100vw-1.5rem)] sm:max-w-md animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className={cn(
        "relative rounded-2xl sm:rounded-3xl border backdrop-blur-2xl shadow-2xl p-3.5 xs:p-4 sm:p-5 transition-all glass-panel text-white overflow-hidden",
        styles.bg
      )}>
        {/* Animated Accent Top Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-amber-500 to-sky-400 animate-pulse" />

        <div className="flex items-start gap-2.5 sm:gap-3.5">
          {/* Pulsing Icon */}
          <div className="relative p-2 sm:p-2.5 rounded-2xl bg-white/10 shadow-xs border border-white/20 shrink-0">
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 animate-bounce shrink-0" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", styles.pulse)}></span>
              <span className={cn("relative inline-flex rounded-full h-3 w-3", styles.pulse)}></span>
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1 flex-wrap">
              <span className={cn("px-2 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider shadow-2xs border shrink-0", styles.badge)}>
                {activeToast.severity} ALERT
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-white/75 flex items-center gap-1 min-w-0 truncate">
                <BellRing className="w-3 h-3 text-sky-300 shrink-0" />
                <span className="truncate">{activeToast.expected}</span>
              </span>
            </div>

            <h4 className="font-bold text-xs sm:text-sm text-white tracking-tight break-words line-clamp-1 xs:line-clamp-2">
              {activeToast.title}
            </h4>

            <p className="text-[11px] sm:text-xs text-white/80 mt-1 line-clamp-2 sm:line-clamp-3 leading-relaxed break-words">
              {activeToast.description}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 mt-3 w-full">
              <button
                onClick={handleOpenAlerts}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white transition-all shadow-xs cursor-pointer border border-white/20 whitespace-nowrap active:scale-95"
              >
                <span>{t('toast_view_advisory', 'View Full Advisory')}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </button>
              <button
                onClick={() => {
                  dismissToast();
                  navigate('/map');
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold glass-pill border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer shadow-2xs whitespace-nowrap active:scale-95"
              >
                {t('toast_radar_map', 'Radar Map')}
              </button>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={dismissToast}
            className="shrink-0 p-1.5 -mr-1 -mt-1 rounded-xl text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer active:scale-95 focus:outline-none"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
