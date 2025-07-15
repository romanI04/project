
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Calendar, Flame, Star, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProgressItem {
  id: string;
  goal: string;
  streak: number;
  lastUpdated: Date;
  status: 'active' | 'completed' | 'paused';
}

const ProgressPanel: React.FC = () => {
  const [progressItems, setProgressItems] = useState<ProgressItem[]>([]);
  const [totalStreak, setTotalStreak] = useState(0);

  useEffect(() => {
    // Load progress from localStorage (simulating Supabase)
    const mockProgress: ProgressItem[] = [
      {
        id: '1',
        goal: 'Daily Exercise',
        streak: 7,
        lastUpdated: new Date(),
        status: 'active',
      },
      {
        id: '2',
        goal: 'Reading Before Bed',
        streak: 12,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 8),
        status: 'active',
      },
      {
        id: '3',
        goal: 'Morning Meditation',
        streak: 3,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 2),
        status: 'active',
      },
    ];
    
    setProgressItems(mockProgress);
    setTotalStreak(mockProgress.reduce((sum, item) => sum + item.streak, 0));
  }, []);

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return Crown;
    if (streak >= 14) return Star;
    if (streak >= 7) return Flame;
    return Target;
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-yellow-400';
    if (streak >= 14) return 'text-purple-400';
    if (streak >= 7) return 'text-orange-400';
    return 'text-blue-400';
  };

  return (
    <motion.div 
      className="h-full glass-effect flex flex-col"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-semibold flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
          Progress
        </h2>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="p-6 border-b border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-blue-400">{progressItems.length}</div>
            <div className="text-xs text-gray-400">Active Habits</div>
          </div>
          <div className="glass-effect p-4 rounded-xl text-center">
            <div className="text-2xl font-bold text-orange-400">{totalStreak}</div>
            <div className="text-xs text-gray-400">Total Streak</div>
          </div>
        </div>
      </motion.div>

      {/* Progress Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {progressItems.map((item, index) => {
            const StreakIcon = getStreakIcon(item.streak);
            const streakColor = getStreakColor(item.streak);
            
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-effect p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group cursor-pointer hover:scale-[1.02]"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm">{item.goal}</h3>
                  <div className="flex items-center space-x-1">
                    <StreakIcon className={`w-4 h-4 ${streakColor}`} />
                    <span className={`text-sm font-bold ${streakColor}`}>
                      {item.streak}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {item.lastUpdated.toLocaleDateString()}
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'active' ? 'bg-green-500/20 text-green-400' :
                    item.status === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {item.status}
                  </div>
                </div>
                
                {/* Streak Visualization */}
                <div className="mt-3 flex space-x-1">
                  {Array.from({ length: Math.min(item.streak, 10) }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      whileHover={{ scale: 1.5 }}
                    />
                  ))}
                  {item.streak > 10 && (
                    <span className="text-xs text-gray-400 ml-2">+{item.streak - 10}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Premium Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="glass-effect p-6 rounded-xl text-center border border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Crown className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold mb-2 premium-glow">Pro Analytics</h3>
          <p className="text-xs text-gray-400 mb-4">
            Unlock detailed insights, advanced tracking, and AI-powered recommendations
          </p>
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold"
          >
            <Zap className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProgressPanel;
