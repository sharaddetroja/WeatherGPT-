import { Link, useLocation } from 'react-router-dom';
import { CloudRain, Map, LayoutDashboard, Bell, BarChart2, User, Menu, X, Sun, Moon, Sparkles, CheckCheck, BellRing } from 'lucide-react';
import { cn } from '../utils/cn';
import { useTheme } from '../hooks/useTheme';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { useState, useRef, useEffect } from 'react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CloudRain, label: 'Alerts', path: '/alerts' },
  { icon: Map, label: 'Map', path: '/map' },
  { icon: BarChart2, label: 'Climate', path: '/climate' },
  { icon: Sparkles, label: 'Voice AI', path: '/assistant' },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const { 
    alerts, 
    unreadCount, 
    permissionStatus, 
    requestNotificationPermission, 
    triggerHeavyRainTestAlert, 
    markAsRead, 
    markAllAsRead 
  } = useWeatherAlerts();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 md:px-8">
        <div className="flex items-center gap-2">
          <CloudRain className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            WeatherGPT
          </span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center ml-10 space-x-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted",
                location.pathname === item.path ? "bg-muted text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <div className="hidden md:flex items-center bg-muted/50 rounded-full px-4 py-1.5 text-sm">
            <Map className="w-4 h-4 mr-2 text-muted-foreground" />
            <span>Rajkot, Gujarat</span>
          </div>

          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors relative cursor-pointer"
              title="Weather Alerts & Notifications"
            >
              <Bell className="w-5 h-5 text-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full border-2 border-background shadow-xs animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover Dropdown */}
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="p-3.5 border-b border-border bg-muted/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="w-4 h-4 text-primary" />
                    <h3 className="font-bold text-xs text-foreground uppercase tracking-wider">Weather Alerts</h3>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Push Notification Permission Quick-Bar */}
                <div className="px-3.5 py-2.5 bg-primary/10 border-b border-primary/20 flex items-center justify-between gap-2">
                  <div className="text-[11px] font-medium text-foreground">
                    <span className="font-bold">Desktop Push Alerts: </span>
                    <span className={permissionStatus === 'granted' ? "text-emerald-600 font-semibold" : "text-amber-600 font-semibold"}>
                      {permissionStatus === 'granted' ? "Active ✓" : "Off"}
                    </span>
                  </div>
                  {permissionStatus !== 'granted' ? (
                    <button
                      onClick={requestNotificationPermission}
                      className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer shadow-2xs"
                    >
                      Enable Push
                    </button>
                  ) : (
                    <button
                      onClick={triggerHeavyRainTestAlert}
                      className="px-2.5 py-1 bg-card hover:bg-muted border border-border text-foreground text-[10px] font-bold rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      ⚡ Test Alert
                    </button>
                  )}
                </div>

                {/* Alerts List */}
                <div className="max-h-72 overflow-y-auto divide-y divide-border/60">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => markAsRead(alert.id)}
                      className={cn(
                        "p-3 hover:bg-muted/60 transition-colors cursor-pointer space-y-1",
                        !alert.read && "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                          alert.severity === 'Critical' ? "bg-red-500/15 text-red-600 border border-red-500/30" :
                          alert.severity === 'High' ? "bg-orange-500/15 text-orange-600 border border-orange-500/30" :
                          "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                        )}>
                          {alert.severity} • {alert.type}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{alert.timestamp}</span>
                      </div>

                      <h4 className={cn("text-xs font-bold text-foreground line-clamp-1", !alert.read && "text-primary")}>
                        {alert.title}
                      </h4>

                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {alert.description}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Footer Link to Alerts Page & Test Button */}
                <div className="p-2.5 bg-muted/40 border-t border-border flex items-center justify-between">
                  <button
                    onClick={triggerHeavyRainTestAlert}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                    title="Simulate a real-time heavy rain warning with sound & notification"
                  >
                    <span>⛈️ Test Heavy Rain Alert</span>
                  </button>
                  <Link
                    to="/alerts"
                    onClick={() => setNotifOpen(false)}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    View All Advisories →
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          {/* WeatherGPT AI Voice Assistant Link */}
          <Link
            to="/assistant"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-xs hover:shadow hover:scale-105 transition-all cursor-pointer"
            title="Open WeatherGPT Voice Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </Link>

          <Link to="/profile" className="hidden md:flex p-2 rounded-full hover:bg-muted transition-colors">
            <User className="w-5 h-5" />
          </Link>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background animate-in slide-in-from-top-2">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            ))}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
            >
              <User className="w-5 h-5 mr-3" />
              Profile
            </Link>
            <Link
              to="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="w-5 h-5 mr-3 text-amber-500" />
              Ask WeatherGPT Voice AI
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
