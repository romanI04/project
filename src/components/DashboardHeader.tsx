
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Menu, 
  BarChart3, 
  Plus, 
  Sun, 
  Moon, 
  LogOut,
  Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { signOut } from '@/lib/supabaseClient';

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
  onToggleProgress: () => void;
  onNewChat: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onToggleSidebar,
  onToggleProgress,
  onNewChat
}) => {
  const [isDark, setIsDark] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error logging out',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      navigate('/');
    }
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    // In a real app, this would update the global theme
  };

  return (
    <motion.header 
      className="glass-effect border-b border-cosmic-cyan/30 p-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cosmic-navy/20 via-cosmic-blue/10 to-cosmic-orange/20 pointer-events-none" />
      
      <div className="flex items-center justify-between relative z-10">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="text-cosmic-cyan hover:text-cosmic-orange transition-colors duration-300"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="w-8 h-8 bg-gradient-to-r from-cosmic-blue to-cosmic-orange rounded-lg flex items-center justify-center"
              animate={{ 
                boxShadow: [
                  "0 0 10px rgba(0, 255, 255, 0.3)",
                  "0 0 20px rgba(255, 165, 0, 0.5)",
                  "0 0 10px rgba(0, 255, 255, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold hidden sm:block cosmic-text">HabitForge AI</span>
          </motion.div>
        </div>

        {/* Center Section */}
        <div className="flex items-center space-x-2">
          <Button
            onClick={onNewChat}
            className="button-cosmic px-4 py-2 rounded-lg font-semibold transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="text-cosmic-cyan hover:text-cosmic-yellow transition-colors duration-300"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleProgress}
            className="text-cosmic-cyan hover:text-cosmic-orange transition-colors duration-300 hidden sm:flex"
          >
            <BarChart3 className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-cosmic-cyan hover:text-cosmic-orange transition-colors duration-300"
          >
            <Settings className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-cosmic-cyan hover:text-cosmic-orange transition-colors duration-300"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
