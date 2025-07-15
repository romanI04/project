
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId: string | null;
  onNewMessage: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load messages for the current chat
    if (chatId) {
      // In a real app, fetch messages from Supabase
      setMessages([
        {
          id: '1',
          type: 'ai',
          content: 'Hello! I\'m your personal habit coach. What habit would you like to work on today?',
          timestamp: new Date(),
        },
      ]);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  const simulateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simple AI responses based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('exercise') || message.includes('workout') || message.includes('fitness')) {
      return "Great choice! Let's build a sustainable exercise habit. I recommend starting with just 10 minutes of movement daily. Would you prefer morning workouts, evening sessions, or something flexible that fits your schedule?";
    } else if (message.includes('reading') || message.includes('book')) {
      return "Reading is an excellent habit! Let's start with just 15 minutes a day. I suggest finding a consistent time - maybe before bed or during your morning coffee. What genre interests you most?";
    } else if (message.includes('water') || message.includes('drink') || message.includes('hydration')) {
      return "Staying hydrated is crucial! Let's aim for 8 glasses of water daily. I'll help you track this. Try setting reminders every 2 hours. Do you prefer room temperature or cold water?";
    } else if (message.includes('sleep') || message.includes('bedtime')) {
      return "Sleep is the foundation of good habits! Let's work on a consistent sleep schedule. What time do you usually go to bed, and what's your ideal wake-up time?";
    } else if (message.includes('meditation') || message.includes('mindfulness')) {
      return "Mindfulness is transformative! Starting with just 5 minutes of daily meditation can make a huge difference. Would you like to try breathing exercises, guided meditations, or simple awareness practices?";
    } else {
      return `I understand you want to work on "${userMessage}". That's a wonderful goal! Let me help you break this down into manageable daily actions. What does success look like to you for this habit?`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const aiResponse = await simulateAIResponse(input.trim());
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      onNewMessage();
      
      // Save to "database" (localStorage for demo)
      const session = JSON.parse(localStorage.getItem('habitforge_session') || '{}');
      const progressData = {
        id: Date.now().toString(),
        user_id: session.user?.id || '1',
        goal: input.trim(),
        log: aiResponse,
        created_at: new Date().toISOString(),
      };
      
      const existingProgress = JSON.parse(localStorage.getItem('habitforge_progress') || '[]');
      localStorage.setItem('habitforge_progress', JSON.stringify([...existingProgress, progressData]));
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      setIsTyping(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <AnimatePresence>
          {messages.length === 0 && !chatId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Start Your Habit Journey</h2>
              <p className="text-gray-400 max-w-md mx-auto">
                Tell me about a habit you'd like to build, and I'll create a personalized plan just for you.
              </p>
            </motion.div>
          )}
          
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl px-6 py-4 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'glass-effect glow-effect'
                } transition-all duration-300 hover:scale-[1.02]`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="glass-effect px-6 py-4 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <motion.div 
        className="border-t border-gray-700 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the habit you want to build..."
              className="min-h-[60px] max-h-32 resize-none bg-gray-800/50 border-gray-600 focus:border-blue-500 text-white placeholder-gray-400 pr-12"
              disabled={isLoading}
            />
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl glow-effect transition-all duration-300 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ChatInterface;
