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
          className="fixed bottom-5 left-5 bg-card/90 hover:bg-card border border-border/80 text-foreground px-3.5 py-2 rounded-full shadow-md transition-all z-40 flex items-center gap-2 text-xs font-semibold backdrop-blur-md cursor-pointer hover:border-primary/50"
          title="Report current local weather conditions"
        >
          <ShieldAlert className="w-4 h-4 text-primary" />
          <span className="hidden sm:inline">Report Weather</span>
        </button>
      )}

      <CommunityReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
