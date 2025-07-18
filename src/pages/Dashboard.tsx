
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';
import ProgressPanel from '@/components/ProgressPanel';
import DashboardHeader from '@/components/DashboardHeader';
import ReactGA from 'react-ga4';

const Dashboard = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progressOpen, setProgressOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNewChat = () => {
    // DEBUG: Log new chat creation
    console.log('[Dashboard] New Chat button clicked. Resetting current chat.');
    setCurrentChat(null);
  };

  const handleSelectChat = (chatId: string) => {
    // DEBUG: Log chat selection in Dashboard
    console.log(`[Dashboard] Setting current chat to: ${chatId}`);
    setCurrentChat(chatId);
  };

  return (
    <div className="h-screen cosmic-aurora text-white flex flex-col overflow-hidden relative">
      {/* Cosmic overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-black/40 via-cosmic-navy/30 to-cosmic-dark-blue/20 pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 h-full flex flex-col"
      >
        <DashboardHeader 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onToggleProgress={() => setProgressOpen(!progressOpen)}
          onNewChat={handleNewChat}
        />
        
        <div className="flex flex-1 overflow-hidden">
          {/* Chat History Sidebar */}
          <AnimatePresence>
            {(sidebarOpen && !isMobile) && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-80 border-r border-cosmic-cyan/20 relative"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-cosmic-cyan/50 via-cosmic-blue/30 to-cosmic-orange/20" />
                <ChatHistory 
                  currentChat={currentChat}
                  onSelectChat={handleSelectChat}
                  onNewChat={handleNewChat}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Chat Interface */}
          <motion.div 
            className="flex-1 flex flex-col relative"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChatInterface 
              chatId={currentChat}
              setCurrentChat={setCurrentChat}
              onNewMessage={() => {
                // This is now handled by react-query invalidation
                console.log('[Dashboard] onNewMessage triggered. Chat history should refresh automatically.');
              }}
            />
          </motion.div>

          {/* Progress Panel */}
          <AnimatePresence>
            {(progressOpen && !isMobile) && (
              <motion.div
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="w-80 border-l border-cosmic-cyan/20 relative"
              >
                {/* Gradient border effect */}
                <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-cosmic-orange/50 via-cosmic-yellow/30 to-cosmic-cyan/20" />
                <ProgressPanel />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Navigation */}
        {isMobile && (
          <motion.div 
            className="fixed bottom-0 left-0 right-0 glass-effect border-t border-cosmic-cyan/30 p-4"
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-around">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  sidebarOpen 
                    ? 'button-cosmic glow-effect' 
                    : 'bg-cosmic-navy/60 hover:bg-cosmic-blue/40 border border-cosmic-cyan/20'
                }`}
              >
                History
              </button>
              <button
                onClick={() => setProgressOpen(!progressOpen)}
                className={`p-3 rounded-xl transition-all duration-300 ${
                  progressOpen 
                    ? 'button-cosmic glow-effect' 
                    : 'bg-cosmic-navy/60 hover:bg-cosmic-blue/40 border border-cosmic-cyan/20'
                }`}
              >
                Progress
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
