import { Link, useLocation } from 'react-router-dom';
import { 
  CloudRain, 
  Map, 
  LayoutDashboard, 
  Bell, 
  BarChart2, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  Sparkles, 
  CheckCheck, 
  BellRing,
  Languages,
  ChevronDown
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useTheme } from '../hooks/useTheme';
import { useWeatherAlerts } from '../hooks/useWeatherAlerts';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLanguage, SITE_LANGUAGES } from '../hooks/useLanguage';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useMagnetic } from '../utils/gsapEffects';

export default function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { profile } = useUserProfile();
  const { currentLang, setLanguage, t } = useLanguage();
  const [notifOpen, setNotifOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const askAIBtnRef = useMagnetic<HTMLAnchorElement>(0.3);

  const mainNavItems = [
    { icon: LayoutDashboard, label: t('nav_dashboard', 'Dashboard'), path: '/' },
    { icon: CloudRain, label: t('nav_alerts', 'Alerts'), path: '/alerts' },
    { icon: Map, label: t('nav_map', 'Map'), path: '/map' },
    { icon: BarChart2, label: t('nav_climate', 'Climate'), path: '/climate' },
    { icon: Sparkles, label: t('nav_voice_ai', 'Voice AI'), path: '/assistant' },
  ];

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
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 w-full mx-auto">
        <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
          <motion.div 
            whileHover={{ rotate: 15, scale: 1.15 }}
            transition={{ type: 'spring', stiffness: 400 }}
          >
            <CloudRain className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
            WeatherGPT
          </span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center ml-6 space-x-1">
          {mainNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "relative px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors flex-shrink-0",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeNavTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="ml-auto flex items-center space-x-3">
          <div className="hidden lg:flex items-center bg-muted/50 rounded-full px-3.5 py-1 text-xs font-semibold">
            <Map className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            <span>{profile.location || 'Rajkot, Gujarat'}</span>
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 hover:bg-muted rounded-full text-xs font-extrabold transition-all border border-border/60 cursor-pointer"
              title="Change Site Language"
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline text-foreground">{currentLang.nativeName}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-muted-foreground transition-transform", langOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50 p-1.5 space-y-0.5"
                >
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 flex items-center justify-between">
                    <span>Select Language</span>
                    <Link to="/language" onClick={() => setLangOpen(false)} className="text-primary hover:underline font-extrabold">
                      View All →
                    </Link>
                  </div>

                  <div className="max-h-60 overflow-y-auto">
                    {SITE_LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => {
                          setLanguage(l);
                          setLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left",
                          currentLang.code === l.code ? "bg-primary/10 text-primary" : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span>{l.flag}</span>
                          <span>{l.nativeName}</span>
                        </div>
                        {currentLang.code === l.code && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">Active</span>}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.15, rotate: 18 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-full hover:bg-muted transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </motion.button>
          
          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setNotifOpen(!notifOpen)}
              className="p-2 rounded-full hover:bg-muted transition-colors relative cursor-pointer"
              title="Weather Alerts & Notifications"
            >
              <Bell className="w-4 h-4 text-foreground" />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.25, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-1 bg-red-500 text-white text-[9px] font-extrabold rounded-full border-2 border-background"
                >
                  {unreadCount}
                </motion.span>
              )}
            </motion.button>

            {/* Notifications Popover Dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden z-50"
                >
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

                  {/* Footer Link */}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* WeatherGPT AI Voice Assistant Link */}
          <Link
            ref={askAIBtnRef}
            to="/assistant"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105 transition-all cursor-pointer flex-shrink-0"
            title="Open WeatherGPT Voice Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Ask AI</span>
          </Link>

          {/* User Profile Avatar Link */}
          <Link 
            to="/profile" 
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all border border-primary/20 shadow-2xs hover:scale-110 flex-shrink-0"
            title={`Profile & Settings: ${profile.name}`}
          >
            {profile.avatarInitials || 'SD'}
          </Link>

          <button 
            className="md:hidden p-2 rounded-lg hover:bg-muted cursor-pointer"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav with Motion */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t p-4 bg-background overflow-hidden space-y-1"
          >
            <div className="flex flex-col space-y-1">
              {mainNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    location.pathname === item.path ? "bg-primary/10 text-primary font-bold" : "text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              ))}

              <div className="pt-2 space-y-1">
                <Link
                  to="/language"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <div className="flex items-center">
                    <Languages className="w-5 h-5 mr-3 text-primary" />
                    <span>{t('nav_language', 'Language')}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
                    {currentLang.flag} {currentLang.nativeName}
                  </span>
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <User className="w-5 h-5 mr-3" />
                  {t('nav_profile', 'Profile & Settings')}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
