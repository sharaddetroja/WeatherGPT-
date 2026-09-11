import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import NotificationToast from '../components/NotificationToast';
import { CommunityReportModal } from '../components/CommunityReportModal';
import { ShieldAlert } from 'lucide-react';
import { cn } from '../utils/cn';

export default function MainLayout() {
  const location = useLocation();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const isAssistantPage = location.pathname.startsWith('/assistant') || location.pathname.startsWith('/chat');

  return (
    <div className={cn("min-h-screen flex flex-col bg-background", isAssistantPage && "h-screen max-h-screen overflow-hidden")}>
      <Navbar />
      <NotificationToast />
      <main className={cn(
        "flex-1 w-full mx-auto",
        isAssistantPage 
          ? "h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] p-2 md:p-3 overflow-hidden flex flex-col" 
          : "overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6"
      )}>
        <Outlet />
      </main>

      {!isAssistantPage && (
        <button
          onClick={() => setIsReportModalOpen(true)}
          className="fixed bottom-6 left-6 lg:bottom-8 lg:left-8 bg-gradient-to-r from-red-600 to-rose-600 text-white px-4 py-3 rounded-full shadow-xl hover:shadow-2xl hover:shadow-red-500/40 transition-all transform hover:-translate-y-0.5 hover:scale-105 z-50 flex items-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer"
        >
          <ShieldAlert className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide hidden sm:inline">Report Local Weather</span>
        </button>
      )}

      <CommunityReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
