
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ChatInterface from '@/components/ChatInterface';
import ChatHistory from '@/components/ChatHistory';
import ProgressPanel from '@/components/ProgressPanel';
import DashboardHeader from '@/components/DashboardHeader';

const Dashboard = () => {
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progressOpen, setProgressOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('habitforge_session');
    if (!session) {
      navigate('/auth');
      return;
    }

    // Check if session is expired
    try {
      const parsed = JSON.parse(session);
      if (Date.now() > parsed.expires) {
        localStorage.removeItem('habitforge_session');
        navigate('/auth');
        return;
      }
    } catch {
      localStorage.removeItem('habitforge_session');
      navigate('/auth');
      return;
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [navigate]);

  const handleNewChat = () => {
    setCurrentChat(null);
  };

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white flex flex-col overflow-hidden">
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
              className="w-80 border-r border-gray-700"
            >
              <ChatHistory 
                currentChat={currentChat}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Chat Interface */}
        <div className="flex-1 flex flex-col">
          <ChatInterface 
            chatId={currentChat}
            onNewMessage={() => {
              // Trigger updates to other components
            }}
          />
        </div>

        {/* Progress Panel */}
        <AnimatePresence>
          {(progressOpen && !isMobile) && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-80 border-l border-gray-700"
            >
              <ProgressPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-700 p-4">
          <div className="flex justify-around">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-3 rounded-xl transition-colors ${sidebarOpen ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              History
            </button>
            <button
              onClick={() => setProgressOpen(!progressOpen)}
              className={`p-3 rounded-xl transition-colors ${progressOpen ? 'bg-blue-600' : 'bg-gray-700'}`}
            >
              Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
