import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export interface WeatherAlertItem {
  id: number;
  title: string;
  severity: 'Critical' | 'High' | 'Moderate' | 'Low';
  expected: string;
  description: string;
  type: 'rain' | 'wind' | 'temp' | 'storm';
  location?: string;
  timestamp: string;
  read?: boolean;
}

export const DEFAULT_ALERTS: WeatherAlertItem[] = [
  {
    id: 1,
    title: "Heavy Rain Warning",
    severity: "Critical",
    expected: "4:00 PM – 8:00 PM Today",
    description: "Heavy rainfall and localized flooding expected in Rajkot and surrounding areas. Avoid low-lying roads and unnecessary outdoor travel.",
    type: "rain",
    location: "Rajkot, Gujarat",
    timestamp: "10 mins ago",
    read: false
  },
  {
    id: 2,
    title: "Strong Wind & Thunderstorm Advisory",
    severity: "High",
    expected: "Ongoing until 10:00 PM",
    description: "Severe wind gusts up to 45 km/h with thunderstorm activity. Secure loose rooftop objects and outdoor equipment.",
    type: "wind",
    location: "Saurashtra Coastline",
    timestamp: "45 mins ago",
    read: false
  },
  {
    id: 3,
    title: "Extreme Temperature Advisory",
    severity: "Moderate",
    expected: "Tomorrow, 12:00 PM - 3:00 PM",
    description: "Heat index expected to touch 36°C with 75% humidity. Ensure hydration during afternoon outdoor work.",
    type: "temp",
    location: "Gujarat Inland",
    timestamp: "2 hours ago",
    read: true
  }
];

interface WeatherAlertsContextType {
  alerts: WeatherAlertItem[];
  unreadCount: number;
  permissionStatus: NotificationPermission;
  activeToast: WeatherAlertItem | null;
  requestNotificationPermission: () => Promise<boolean>;
  sendAlertNotification: (alert: WeatherAlertItem) => void;
  triggerHeavyRainTestAlert: () => void;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  dismissToast: () => void;
}

const WeatherAlertsContext = createContext<WeatherAlertsContextType | undefined>(undefined);

// Synthesize pleasant two-tone weather alert chime via Web Audio API
export const playAlertChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Note 1: High alert tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5
    
    gain1.gain.setValueAtTime(0.2, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    osc1.start();
    osc1.stop(ctx.currentTime + 0.7);
  } catch (e) {
    // AudioContext blocked by user gesture policy until clicked
  }
};

export const WeatherAlertsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<WeatherAlertItem[]>(() => {
    const saved = localStorage.getItem('weathergpt_alerts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_ALERTS;
      }
    }
    return DEFAULT_ALERTS;
  });

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [activeToast, setActiveToast] = useState<WeatherAlertItem | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  // Save alerts to localStorage
  useEffect(() => {
    localStorage.setItem('weathergpt_alerts', JSON.stringify(alerts));
  }, [alerts]);

  // Request browser desktop notification permission
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Desktop notifications are not supported in this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        // Send confirmation welcome notification
        new Notification('🌧️ WeatherGPT Alerts Enabled', {
          body: 'You will receive real-time notifications for heavy rain, thunderstorms, and extreme weather warnings.',
          icon: '/favicon.ico'
        });
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  };

  // Dispatch real notification (Desktop Push + In-App Sound & Toast)
  const sendAlertNotification = (alert: WeatherAlertItem) => {
    // 1. Play audio chime
    playAlertChime();

    // 2. Show in-app animated toast banner
    setActiveToast(alert);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setActiveToast(null);
    }, 8000); // 8 seconds display

    // 3. Trigger Browser Desktop / Mobile notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(`⛈️ ${alert.title}`, {
          body: `${alert.expected}: ${alert.description}`,
          tag: `alert-${alert.id}`,
          icon: '/favicon.ico'
        });

        notif.onclick = () => {
          window.focus();
          window.location.href = '/alerts';
        };
      } catch (err) {
        console.warn('Could not launch system notification:', err);
      }
    }
  };

  // Immediate Test Trigger for Heavy Rain Alert
  const triggerHeavyRainTestAlert = () => {
    const rainAlert: WeatherAlertItem = {
      id: Date.now(),
      title: "Heavy Rain & Flash Flood Warning",
      severity: "Critical",
      expected: "Next 2 Hours (80mm expected)",
      description: "Severe downpour detected on Doppler radar over Rajkot. High risk of waterlogging on major roads. Stay indoors and carry waterproof gear!",
      type: "rain",
      location: "Rajkot Urban Area",
      timestamp: "Just now",
      read: false
    };

    setAlerts(prev => [rainAlert, ...prev]);
    sendAlertNotification(rainAlert);
  };

  // Auto-trigger sample heavy rain alert once after initial load to demonstrate
  useEffect(() => {
    const hasTriggeredInitial = sessionStorage.getItem('weathergpt_has_alerted');
    if (!hasTriggeredInitial) {
      sessionStorage.setItem('weathergpt_has_alerted', 'true');
      const timer = setTimeout(() => {
        sendAlertNotification(alerts[0]);
      }, 3500); // 3.5 seconds after page load
      return () => clearTimeout(timer);
    }
  }, []);

  const markAsRead = (id: number) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllAsRead = () => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const dismissToast = () => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setActiveToast(null);
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <WeatherAlertsContext.Provider
      value={{
        alerts,
        unreadCount,
        permissionStatus,
        activeToast,
        requestNotificationPermission,
        sendAlertNotification,
        triggerHeavyRainTestAlert,
        markAsRead,
        markAllAsRead,
        dismissToast
      }}
    >
      {children}
    </WeatherAlertsContext.Provider>
  );
};

export const useWeatherAlerts = () => {
  const context = useContext(WeatherAlertsContext);
  if (!context) {
    throw new Error('useWeatherAlerts must be used within a WeatherAlertsProvider');
  }
  return context;
};
