import { useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert, CloudRain, Wind, ThermometerSun, Bell, Volume2, CheckCircle2 } from 'lucide-react';
import { cn } from '../utils/cn';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';

export default function AlertsPage() {
  const { t } = useLanguage();
  const { profile } = useUserProfile();
  const { 
    alerts, 
    apiMessage,
    activeLocation,
    permissionStatus, 
    requestNotificationPermission, 
    triggerHeavyRainTestAlert, 
    sendAlertNotification,
    updateAlertsForLocation
  } = useWeatherAlerts();

  useEffect(() => {
    if (profile.location) {
      updateAlertsForLocation(profile.location);
    }
  }, [profile.location]);


  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'rain': return CloudRain;
      case 'wind': return Wind;
      case 'temp': return ThermometerSun;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('alerts_title', 'Weather Alerts')}</h1>
            <p className="text-xs text-muted-foreground">{t('alerts_subtitle', 'Real-time severe weather warnings and area advisories')}</p>
          </div>
        </div>
      </div>

      {/* Push Notification Setup Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-sky-400/20 bg-sky-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 sm:p-3 bg-primary text-white rounded-2xl shadow-md shrink-0 border border-white/20">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm text-white">Heavy Rain & Severe Weather Push Alerts</h3>
              {permissionStatus === 'granted' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  Not Allowed
                </span>
              )}
            </div>
            <p className="text-xs text-white/70 mt-0.5 max-w-xl leading-relaxed">
              Receive instant sound chimes and desktop notifications when heavy rain, cyclones or thunderstorms threaten your area.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:scale-105 cursor-pointer text-center border border-white/20"
            >
              Enable Notifications
            </button>
          ) : (
            <button
              onClick={() => triggerHeavyRainTestAlert(profile.location)}
              className="w-full sm:w-auto px-4 py-2 glass-pill border border-white/20 text-white hover:bg-white/20 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs text-center"
            >
              Send Test Alert
            </button>
          )}
        </div>
      </div>
      
      {/* Alerts Grid List */}
      {alerts.length === 0 ? (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-3 shadow-lg">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-300 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">
            No Active Weather Warnings for {activeLocation || profile.location || 'your area'}
          </h3>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            {apiMessage || `Weather conditions remain clear with no severe weather advisories issued by weather providers.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
        {alerts.map((alert) => {
          const Icon = getTypeIcon(alert.type);
          return (
            <div 
              key={alert.id} 
              className={cn(
                "glass-panel rounded-3xl p-4 sm:p-6 border transition-all hover:border-white/35 shadow-lg",
                alert.severity === 'Critical' ? "border-l-4 border-l-red-500 bg-red-950/15" :
                alert.severity === 'High' ? "border-l-4 border-l-orange-500 bg-orange-950/15" :
                alert.severity === 'Moderate' ? "border-l-4 border-l-amber-500 bg-amber-950/15" : "border-l-4 border-l-blue-500 bg-blue-950/15"
              )}
            >
              <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-6 items-start">
                <div className={cn("p-3 sm:p-4 rounded-2xl flex-shrink-0 shadow-md border", 
                  alert.severity === 'Critical' ? "bg-red-500/20 text-red-300 border-red-500/40" :
                  alert.severity === 'High' ? "bg-orange-500/20 text-orange-300 border-orange-500/40" :
                  alert.severity === 'Moderate' ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                )}>
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <h3 className="text-base sm:text-xl font-bold text-white">{alert.title}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border", 
                        alert.severity === 'Critical' ? "bg-red-500/25 text-red-200 border-red-500/40" :
                        alert.severity === 'High' ? "bg-orange-500/25 text-orange-200 border-orange-500/40" :
                        alert.severity === 'Moderate' ? "bg-amber-500/25 text-amber-200 border-amber-500/40" : "bg-blue-500/25 text-blue-200 border-blue-500/40"
                      )}>
                        {alert.severity}
                      </span>
                    </div>
                    
                    {/* Send notification test for this specific card */}
                    <button
                      onClick={() => sendAlertNotification(alert)}
                      className="flex items-center gap-1.5 px-3 py-1.5 glass-pill hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer border border-white/20 shadow-xs"
                      title="Play audio chime and send notification for this alert"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-sky-300" />
                      <span>Notify Me</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70">
                    <Info className="w-4 h-4 text-sky-300" />
                    <span>Expected: {alert.expected}</span>
                  </div>

                  <p className="text-white/90 leading-relaxed mt-2 text-xs sm:text-sm">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
}
