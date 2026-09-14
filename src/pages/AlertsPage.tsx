import { useEffect } from 'react';
import { AlertTriangle, Info, ShieldAlert, CloudRain, Wind, ThermometerSun, Bell, Volume2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
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

  const getSeverityColor = (severity: string) => {
    switch(severity) {
      case 'Critical': return 'bg-red-500/10 text-red-600 border-red-500/30';
      case 'High': return 'bg-orange-500/10 text-orange-600 border-orange-500/30';
      case 'Moderate': return 'bg-amber-500/10 text-amber-600 border-amber-500/30';
      case 'Low': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
      default: return 'bg-muted';
    }
  };

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
      <Card className="bg-gradient-to-r from-primary/10 via-blue-500/10 to-indigo-500/10 border-primary/20">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 sm:p-3 bg-primary text-primary-foreground rounded-2xl shadow-xs shrink-0">
              <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-foreground">Heavy Rain & Severe Weather Push Alerts</h3>
                {permissionStatus === 'granted' ? (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" /> Enabled
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-500/15 px-2 py-0.5 rounded-full border border-amber-500/20">
                    Not Allowed
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Receive instant sound chimes and desktop notifications when heavy rain, cyclones or thunderstorms threaten your area.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto flex-shrink-0">
            {permissionStatus !== 'granted' ? (
              <button
                onClick={requestNotificationPermission}
                className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-xl text-xs hover:bg-primary/90 transition-all shadow-xs cursor-pointer text-center"
              >
                Enable Notifications
              </button>
            ) : (
              <button
                onClick={() => triggerHeavyRainTestAlert(profile.location)}
                className="w-full sm:w-auto px-4 py-2 glass-pill border border-white/20 text-white hover:bg-white/10 font-semibold rounded-xl text-xs transition-colors cursor-pointer shadow-2xs text-center"
              >
                Send Test Alert
              </button>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Alerts Grid List */}
      {alerts.length === 0 ? (
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-6 sm:p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-500/15 text-emerald-500 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              No Active Weather Warnings for {activeLocation || profile.location || 'your area'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {apiMessage || `Weather conditions remain clear with no severe weather advisories issued by weather providers.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
        {alerts.map((alert) => {
          const Icon = getTypeIcon(alert.type);
          return (
            <Card key={alert.id} className={cn("border-l-4 transition-all hover:shadow-md", 
              alert.severity === 'Critical' ? "border-l-red-500" :
              alert.severity === 'High' ? "border-l-orange-500" :
              alert.severity === 'Moderate' ? "border-l-amber-500" : "border-l-blue-500"
            )}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-6 items-start">
                  <div className={cn("p-3 sm:p-4 rounded-2xl flex-shrink-0 shadow-xs", getSeverityColor(alert.severity))}>
                    <Icon className="w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
                      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        <h3 className="text-base sm:text-xl font-bold text-foreground">{alert.title}</h3>
                        <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider border", getSeverityColor(alert.severity))}>
                          {alert.severity}
                        </span>
                      </div>
                      
                      {/* Send notification test for this specific card */}
                      <button
                        onClick={() => sendAlertNotification(alert)}
                        className="flex items-center gap-1.5 px-3 py-1 glass-pill hover:bg-white/20 rounded-lg text-xs font-semibold text-white transition-all cursor-pointer"
                        title="Play audio chime and send notification for this alert"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Notify Me</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                      <Info className="w-4 h-4" />
                      <span>Expected: {alert.expected}</span>
                    </div>

                    <p className="text-foreground leading-relaxed mt-2 text-xs sm:text-sm">
                      {alert.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      )}
    </div>
  );
}
