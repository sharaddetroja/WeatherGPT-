import { useEffect, useState } from 'react';
import { AlertTriangle, Info, ShieldAlert, CloudRain, Wind, ThermometerSun, Bell, Volume2, CheckCircle2, PhoneCall, Check, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage } from '../hooks/useLanguage';
import { getEmergencyGuide } from '../services/weatherGptApi';
import { getLocalEmergencyProtocol } from '../data/emergencyProtocols';

export default function AlertsPage() {
  const { t, currentLang } = useLanguage();
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

  const [selectedDisaster, setSelectedDisaster] = useState<'cyclone' | 'flood' | 'heatwave' | 'lightning'>('cyclone');
  const [guideData, setGuideData] = useState<any>(null);
  const [guideLoading, setGuideLoading] = useState(false);

  useEffect(() => {
    setGuideLoading(true);
    getEmergencyGuide(selectedDisaster, currentLang?.code || 'en')
      .then(res => {
        if (res && res.success && res.guidance) {
          setGuideData(res.guidance);
        } else {
          setGuideData(getLocalEmergencyProtocol(selectedDisaster));
        }
      })
      .catch(e => {
        console.warn('Could not fetch emergency guide:', e);
        setGuideData(getLocalEmergencyProtocol(selectedDisaster));
      })
      .finally(() => setGuideLoading(false));
  }, [selectedDisaster, currentLang?.code]);

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
    <div className="space-y-4 sm:space-y-6 w-full animate-in fade-in duration-500 pb-2 sm:pb-4 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 rounded-2xl bg-sky-500/20 text-sky-300 border border-sky-400/30 shrink-0 shadow-xs">
            <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-black tracking-tight text-white">{t('alerts_title', 'Weather Alerts')}</h1>
            <p className="text-xs text-white/70 mt-0.5">{t('alerts_subtitle', 'Real-time severe weather warnings and area advisories')}</p>
          </div>
        </div>
      </div>

      {/* Push Notification Setup Banner */}
      <div className="glass-panel p-4 sm:p-5 rounded-3xl border border-sky-400/20 bg-sky-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-start sm:items-center gap-3 sm:gap-3.5 min-w-0">
          <div className="p-2.5 sm:p-3 bg-primary text-white rounded-2xl shadow-md shrink-0 border border-white/20">
            <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-sm sm:text-base text-white">Heavy Rain & Severe Weather Push Alerts</h3>
              {permissionStatus === 'granted' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/40 shadow-2xs shrink-0">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40 shrink-0">
                  Not Allowed
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-white/70 mt-1 max-w-xl leading-relaxed">
              Receive instant sound chimes and desktop notifications when heavy rain, cyclones or thunderstorms threaten your area.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          {permissionStatus !== 'granted' ? (
            <button
              onClick={requestNotificationPermission}
              className="w-full md:w-auto px-4 py-2 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl text-xs transition-all shadow-md hover:scale-105 cursor-pointer text-center border border-white/20 active:scale-95"
            >
              Enable Notifications
            </button>
          ) : (
            <button
              onClick={() => triggerHeavyRainTestAlert(profile.location)}
              className="w-full md:w-auto px-4 py-2 glass-pill border border-white/20 text-white hover:bg-white/20 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs text-center active:scale-95"
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
        <div className="grid gap-3.5 sm:gap-4">
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
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-5 items-start">
                <div className={cn("p-2.5 sm:p-3.5 rounded-2xl shrink-0 shadow-md border self-start", 
                  alert.severity === 'Critical' ? "bg-red-500/20 text-red-300 border-red-500/40" :
                  alert.severity === 'High' ? "bg-orange-500/20 text-orange-300 border-orange-500/40" :
                  alert.severity === 'Moderate' ? "bg-amber-500/20 text-amber-300 border-amber-500/40" : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                )}>
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <div className="flex-1 min-w-0 space-y-2 w-full">
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                      <h3 className="text-base sm:text-xl font-bold text-white break-words">{alert.title}</h3>
                      <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border shrink-0", 
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
                      className="self-start xs:self-auto flex items-center justify-center gap-1.5 px-3 py-1.5 glass-pill hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer border border-white/20 shadow-xs shrink-0 active:scale-95"
                      title="Play audio chime and send notification for this alert"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-sky-300 shrink-0" />
                      <span>Notify Me</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-white/70">
                    <Info className="w-4 h-4 text-sky-300 shrink-0" />
                    <span className="break-words">Expected: {alert.expected}</span>
                  </div>

                  <p className="text-white/90 leading-relaxed text-xs sm:text-sm break-words">
                    {alert.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Live Backend Emergency Protocols & Helplines */}
      <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-white/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">{t('emergency_protocols_title', 'Emergency Safety Protocols & Helplines')}</h2>
              <p className="text-xs text-white/70">{t('emergency_protocols_subtitle', 'Verified response guidelines synced from NDMA disaster engine')}</p>
            </div>
          </div>

          {/* Disaster Type Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-white/10 rounded-2xl border border-white/15 overflow-x-auto max-w-full no-scrollbar self-start sm:self-auto">
            {(['cyclone', 'flood', 'heatwave', 'lightning'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDisaster(type)}
                className={cn(
                  "px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer whitespace-nowrap shrink-0",
                  selectedDisaster === type
                    ? "bg-primary text-white shadow-xs"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                {type === 'cyclone' ? t('disaster_cyclone', 'Cyclone') :
                 type === 'flood' ? t('disaster_flood', 'Flood') :
                 type === 'heatwave' ? t('disaster_heatwave', 'Heatwave') :
                 t('disaster_lightning', 'Lightning')}
              </button>
            ))}
          </div>
        </div>

        {guideLoading ? (
          <div className="py-8 text-center text-xs text-white/60 animate-pulse">
            {t('loading_protocols', 'Loading disaster safety protocols...')}
          </div>
        ) : guideData ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">{guideData.title}</h3>
              <p className="text-xs text-white/80 mt-0.5">{guideData.summary}</p>
            </div>

            {/* Do's and Don'ts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Do's */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 space-y-2">
                <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" /> {t('what_to_do', 'What to Do')}
                </div>
                <ul className="space-y-1.5 text-xs text-white/90">
                  {guideData.dos?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-400/30 space-y-2">
                <div className="text-xs font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                  <X className="w-3.5 h-3.5" /> {t('what_to_avoid', 'What to Avoid')}
                </div>
                <ul className="space-y-1.5 text-xs text-white/90">
                  {guideData.donts?.map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-400 font-bold shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Official Helplines */}
            {Array.isArray(guideData.helplines) && guideData.helplines.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-sky-200">
                  {t('emergency_directory', 'Emergency Speed-Dial Directory')}
                </span>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                  {guideData.helplines.map((line: any, idx: number) => (
                    <a
                      key={idx}
                      href={`tel:${line.number}`}
                      className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-center group cursor-pointer block shadow-xs"
                    >
                      <div className="text-[10px] text-white/70 truncate group-hover:text-white">
                        {line.name}
                      </div>
                      <div className="text-sm font-extrabold text-amber-300 mt-0.5">
                        📞 {line.number}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
