
import React, { useEffect, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { MessageSquare, Sparkles, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ReactGA from 'react-ga4';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';


const Index = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: window.location.pathname });
  }, []);

  const handleWaitlistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    // The 'waitlist' table needs a single 'email' column.
    // RLS policy should be enabled to allow public inserts.
    const { error } = await supabase.from('waitlist').insert({ email });

    if (error) {
      toast({
        title: 'Error joining waitlist',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Successfully joined waitlist!',
        description: 'We will notify you when we launch.',
      });
      setEmail('');
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const chatDemo = [
    { type: 'user', message: 'Help me build a daily exercise habit' },
    { type: 'ai', message: 'Perfect! Let\'s start with 10 minutes of movement each morning. I\'ll adapt based on your progress.' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      <Helmet>
        <title>HabitForge AI - Your Personal AI Habit Coach</title>
        <meta name="description" content="Build lasting habits with an adaptive AI coach that provides personalized plans, tracks your progress, and keeps you motivated." />
        <meta name="keywords" content="habit tracker, ai coach, personal development, self improvement, productivity" />
      </Helmet>
      {/* Navigation */}
      <motion.nav 
        className="relative z-10 flex justify-between items-center p-6 glass-effect"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">HabitForge AI</span>
        </div>
        <Button 
          onClick={() => navigate('/auth')}
          variant="outline"
          className="bg-transparent border-white/20 hover:bg-white/10"
        >
          Sign In
        </Button>
      </motion.nav>

      {/* Hero Section */}
      <motion.div
        className="container mx-auto px-6 py-20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center max-w-4xl mx-auto">
          <motion.h1 
            className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Build Habits with
            <br />
            <span className="premium-glow">AI Coaching</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed"
            variants={itemVariants}
          >
            Your personal AI habit coach that adapts to your lifestyle,
            <br />
            tracks your progress, and keeps you motivated every day.
          </motion.p>

          {/* Waitlist Form */}
          <motion.div 
            className="max-w-md mx-auto mb-12"
            variants={itemVariants}
          >
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="email"
                placeholder="Enter your email to join the waitlist"
                className="flex-grow bg-white/10 border-white/20 placeholder-gray-400 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold glow-effect transition-all duration-300 transform hover:scale-105"
              >
                Join Waitlist
              </Button>
            </form>
          </motion.div>

          {/* Demo Chat */}
          <motion.div 
            className="max-w-2xl mx-auto mb-12 glass-effect rounded-2xl p-6"
            variants={itemVariants}
          >
            <div className="space-y-4">
              {chatDemo.map((msg, index) => (
                <motion.div
                  key={index}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + index * 0.5, duration: 0.5 }}
                >
                  <div
                    className={`max-w-xs px-4 py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-100 glow-effect'
                    }`}
                  >
                    {msg.message}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => navigate('/auth')}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold rounded-full glow-effect transition-all duration-300 transform hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-3 gap-8 mt-20 max-w-6xl mx-auto"
          variants={containerVariants}
        >
          {[
            {
              icon: MessageSquare,
              title: 'AI Conversations',
              description: 'Chat naturally with your AI coach for personalized habit plans',
            },
            {
              icon: Target,
              title: 'Smart Tracking',
              description: 'Automatic progress monitoring with adaptive goal adjustments',
            },
            {
              icon: TrendingUp,
              title: 'Real Progress',
              description: 'Visual insights and streaks that keep you motivated long-term',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="glass-effect p-8 rounded-2xl text-center hover:bg-white/10 transition-all duration-300"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
            >
              <feature.icon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer 
        className="border-t border-white/10 mt-20 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <div className="container mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 HabitForge AI. Building better habits, one conversation at a time.</p>
        </div>
      </motion.footer>
    </div>
  );
};

export default Index;
