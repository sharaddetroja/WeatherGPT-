import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from '../components/Navbar';
import NotificationToast from '../components/NotificationToast';
import { CommunityReportModal } from '../components/CommunityReportModal';
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
        "flex-1 w-full mx-auto max-w-[1240px]",
        isAssistantPage 
          ? "h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] p-3 md:p-4 overflow-hidden flex flex-col" 
          : "overflow-x-hidden px-4 sm:px-6 lg:px-8 py-6 sm:py-8"
      )}>
        <Outlet />
      </main>



      <CommunityReportModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
      />
    </div>
  );
}
