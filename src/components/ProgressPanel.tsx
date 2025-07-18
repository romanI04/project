
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, TrendingUp, Calendar, Flame, Star, Crown, Zap, Loader2, Copy, Gift, Bell, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { getProgress, subscribeToProgress } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Input } from './ui/input';
import { useToast } from './ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/hooks/use-notifications';

interface ProgressItem {
  id: string;
  goal: string;
  created_at: string;
}

const ProgressPanel: React.FC = () => {
  const { session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { areNotificationsEnabled, requestAndEnableNotifications, isPremium } = useNotifications();

  const referralLink = session ? `${window.location.origin}?ref=${session.user.id}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: 'Copied to clipboard!',
      description: 'Your referral link is ready to be shared.',
    });
  };

  // RLS Policy: Users can only see their own progress.
  const { data: progressItems = [], isLoading } = useQuery<ProgressItem[]>({
    queryKey: ['progress', session?.user?.id],
    queryFn: async () => {
      // DEBUG: Check for session before fetching progress
      if (!session?.user?.id) {
        console.log('[ProgressPanel] No user session found. Skipping progress fetch.');
        return [];
      }
      
      try {
        // DEBUG: Fetching progress for user
        console.log(`[ProgressPanel] Fetching progress for user: ${session.user.id}`);
        const { data, error } = await getProgress(session.user.id);

        if (error) {
          // DEBUG: Log Supabase fetch error
          console.error('[ProgressPanel] Error fetching progress from Supabase:', error);
          throw new Error(error.message);
        }
        
        // DEBUG: Log successful progress fetch
        console.log('[ProgressPanel] Successfully fetched progress:', data);
        return data || [];
      } catch (error) {
        console.error('[ProgressPanel] An unexpected error occurred during progress fetch:', error);
        toast({
          title: 'Error fetching progress',
          description: 'Could not load your progress data. Please try again later.',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!session?.user?.id,
  });

  const calculateStreak = (items: ProgressItem[]) => {
    // DEBUG: Starting streak calculation
    console.log('[ProgressPanel] Calculating streak from progress items:', items);
    if (items.length === 0) {
      console.log('[ProgressPanel] No items, streak is 0.');
      return 0;
    }
    
    const dates = items.map(item => new Date(item.created_at).toDateString());
    const uniqueDates = [...new Set(dates)];
    uniqueDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    // DEBUG: Log unique sorted dates
    console.log('[ProgressPanel] Unique dates for streak calculation:', uniqueDates);

    let streak = 0;
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    
    const mostRecentLogDate = new Date(uniqueDates[0]);
    
    // Check if the most recent log is today or yesterday
    if (mostRecentLogDate.toDateString() === today.toDateString() || mostRecentLogDate.toDateString() === yesterday.toDateString()) {
      streak = 1;
      // DEBUG: Log initial streak
      console.log(`[ProgressPanel] Streak started. Most recent log on ${mostRecentLogDate.toDateString()}.`);
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i-1]);
        const previousDate = new Date(uniqueDates[i]);
        
        const diffTime = currentDate.getTime() - previousDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // DEBUG: Log date comparison
        console.log(`[ProgressPanel] Comparing ${currentDate.toDateString()} and ${previousDate.toDateString()}. Difference: ${diffDays} day(s).`);

        if (diffDays === 1) {
          streak++;
          console.log(`[ProgressPanel] Streak extended to ${streak}.`);
        } else {
          // DEBUG: Log streak break
          console.log(`[ProgressPanel] Streak broken. Gap of ${diffDays} days.`);
          break;
        }
      }
    } else {
      // DEBUG: Log no current streak
      console.log(`[ProgressPanel] No current streak. Most recent log was on ${mostRecentLogDate.toDateString()}, which is not today or yesterday.`);
    }
    
    // DEBUG: Log final streak
    console.log(`[ProgressPanel] Final calculated streak: ${streak}`);
    return streak;
  };
  
  const totalStreak = calculateStreak(progressItems);

  useEffect(() => {
    if (!session?.user?.id) return;

    const subscription = subscribeToProgress(session.user.id, () => {
      queryClient.invalidateQueries({ queryKey: ['progress', session.user.id]});
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user?.id, queryClient]);

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

  const StreakIcon = getStreakIcon(totalStreak);
  const streakColor = getStreakColor(totalStreak);

  return (
    <motion.div 
      className="h-full glass-effect flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 cosmic-gradient-reverse opacity-10 pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 border-b border-cosmic-cyan/20 relative z-10">
        <h2 className="text-lg font-semibold flex items-center cosmic-text">
          <TrendingUp className="w-5 h-5 mr-2 text-cosmic-orange" />
          Progress
        </h2>
      </div>

      {/* Stats Overview */}
      <motion.div 
        className="p-6 border-b border-cosmic-cyan/20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-2 gap-4">
          <motion.div 
            className="glass-effect p-4 rounded-xl text-center border border-cosmic-cyan/20 hover:border-cosmic-blue/40 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold text-cosmic-cyan">{progressItems.length}</div>
            <div className="text-xs text-cosmic-cyan/60">Total Logs</div>
          </motion.div>
          
          {isPremium ? (
            <motion.div
              className="glass-effect-warm p-4 rounded-xl text-center relative overflow-hidden border border-cosmic-orange/30"
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(255, 165, 0, 0.3)",
                  "0 0 30px rgba(255, 215, 0, 0.5)",
                  "0 0 20px rgba(255, 165, 0, 0.3)"
                ]
              }}
              transition={{
                boxShadow: { duration: 2, repeat: Infinity }
              }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cosmic-orange/30 to-cosmic-yellow/20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Flame className="w-6 h-6 text-cosmic-orange mx-auto mb-1" />
              </motion.div>
              <div className="text-2xl font-bold text-white relative z-10 drop-shadow-lg">{totalStreak}</div>
              <div className="text-xs text-white/90 relative z-10 drop-shadow-md">Day Streak</div>
              <Button
                size="sm"
                variant="ghost"
                className="absolute top-1 right-1 h-auto px-2 py-1 text-cosmic-cyan hover:text-cosmic-orange hover:bg-cosmic-orange/20 transition-all duration-300"
                onClick={() => {
                  const message = `I'm on a ${totalStreak}-day streak with HabitForge! 🔥`;
                  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(window.location.origin)}`;
                  window.open(url, '_blank');
                  toast({ title: 'Sharing your cosmic streak! ✨' });
                }}
              >
                <Share2 className="w-3 h-3" />
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              className="glass-effect p-4 rounded-xl text-center border border-cosmic-cyan/20 hover:border-cosmic-orange/40 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl font-bold text-cosmic-cyan">{totalStreak}</div>
              <div className="text-xs text-cosmic-cyan/60">Current Streak</div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Daily Reminders Section */}
      <motion.div
        className="p-6 border-b border-cosmic-cyan/20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-md font-semibold flex items-center mb-4">
          <Bell className="w-5 h-5 mr-2 text-cosmic-cyan" />
          <span className="cosmic-text">Daily Reminders</span>
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white">
              {areNotificationsEnabled ? 'Reminders are ON' : 'Reminders are OFF'}
            </p>
            {isPremium && areNotificationsEnabled && (
              <motion.p 
                className="text-xs text-cosmic-cyan flex items-center"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-3 h-3 mr-1 text-cosmic-orange" />
                Personalized for you
              </motion.p>
            )}
          </div>
          <Switch
            checked={areNotificationsEnabled}
            onCheckedChange={requestAndEnableNotifications}
            className="data-[state=checked]:bg-cosmic-orange"
          />
        </div>
      </motion.div>
      
      {/* Referral Section */}
      <motion.div
        className="p-6 border-b border-cosmic-cyan/20 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-md font-semibold flex items-center mb-4">
          <Gift className="w-5 h-5 mr-2 text-cosmic-yellow" />
          <span className="cosmic-text">Refer a Friend</span>
        </h3>
        <div className="flex items-center space-x-2">
          <Input
            value={referralLink}
            readOnly
            className="flex-1 glass-effect border-cosmic-cyan/30 text-cosmic-cyan/80 bg-cosmic-navy/20"
          />
          <Button 
            onClick={handleCopy} 
            className="button-cosmic flex-shrink-0"
          >
            <Copy className="w-4 h-4 mr-1" />
            Copy
          </Button>
        </div>
      </motion.div>

      {/* Progress Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {isLoading ? (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-cosmic-cyan animate-cosmic-glow" />
            </div>
        ) : (
            <AnimatePresence>
                {progressItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="glass-effect p-4 rounded-xl hover:glass-effect-warm transition-all duration-300 group cursor-pointer hover:scale-[1.02] border border-cosmic-cyan/20 hover:border-cosmic-orange/40"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-sm text-white">{item.goal}</h3>
                        <div className="flex items-center space-x-1">
                            <StreakIcon className={`w-4 h-4 ${streakColor.replace('text-', 'text-cosmic-')}`} />
                            <span className={`text-sm font-bold ${streakColor.replace('text-', 'text-cosmic-')}`}>
                            {totalStreak}
                            </span>
                        </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-cosmic-cyan/60">
                        <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                            {new Date(item.created_at).toLocaleDateString()}
                            </span>
                        </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        )}
        
        {/* Premium Status */}
        {isPremium ? (
          <motion.div 
            className="glass-effect-warm p-4 rounded-xl text-center border border-cosmic-orange/30 glow-effect-warm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="flex items-center justify-center space-x-2">
              <Crown className="w-5 h-5 text-cosmic-yellow" />
              <p className="text-cosmic-orange font-medium">Premium Active</p>
            </div>
            <p className="text-xs text-cosmic-yellow/80 mt-1">Enjoy your cosmic experience! ✨</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-effect p-6 rounded-xl text-center border border-cosmic-yellow/30"
          >
            <motion.div
              className="w-12 h-12 bg-gradient-to-r from-cosmic-orange to-cosmic-yellow rounded-xl flex items-center justify-center mx-auto mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Crown className="w-6 h-6 text-cosmic-black" />
            </motion.div>
            <h3 className="font-semibold mb-2 cosmic-text">Cosmic Premium</h3>
            <p className="text-xs text-cosmic-cyan/70 mb-4">
              Unlock personalized AI coaching, animated streak badges, and cosmic insights
            </p>
            <Button 
              size="sm" 
              className="button-cosmic font-semibold"
            >
              <Zap className="w-4 h-4 mr-1" />
              Upgrade to Cosmic
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ProgressPanel;
