import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Map, Sparkles, SlidersHorizontal } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../utils/cn';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      path: '/',
      isActive: location.pathname === '/',
    },
    {
      id: 'calendar',
      label: 'Forecast',
      icon: Calendar,
      path: '/alerts',
      isActive: location.pathname === '/alerts' || location.pathname === '/climate',
    },
    {
      id: 'map',
      label: 'Radar',
      icon: Map,
      path: '/map',
      isActive: location.pathname === '/map',
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: Sparkles,
      path: '/assistant',
      isActive: location.pathname.startsWith('/assistant') || location.pathname.startsWith('/chat'),
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: SlidersHorizontal,
      path: '/profile',
      isActive: location.pathname === '/profile' || location.pathname === '/language',
    },
  ];

  return (
    <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-full glass-panel border border-white/20 shadow-2xl backdrop-blur-2xl text-white max-w-fit mx-auto"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={item.path}
              className={cn(
                "relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all select-none cursor-pointer",
                item.isActive
                  ? "bg-white/20 text-white border border-white/30 shadow-md backdrop-blur-md"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
              title={item.label}
            >
              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              {item.isActive && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block text-xs font-bold tracking-tight text-white whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
