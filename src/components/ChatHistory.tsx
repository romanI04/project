
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Clock, Trash2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSession } from '@/hooks/use-session';
import { getChats, subscribeToChats } from '@/lib/supabaseClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';

interface Chat {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  message_count: number;
}

interface ChatHistoryProps {
  currentChat: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({
  currentChat,
  onSelectChat,
  onNewChat
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { session } = useSession();
  const queryClient = useQueryClient();

  const handleSelectChat = (chatId: string) => {
    // DEBUG: Log chat selection
    console.log(`[ChatHistory] Selected chat with ID: ${chatId}. Passing to parent.`);
    onSelectChat(chatId);
  };

  const { data: chats = [], isLoading } = useQuery<Chat[]>(
    {
      queryKey: ['chats', session?.user?.id],
      queryFn: async () => {
        // DEBUG: Check for session before fetching chats
        if (!session?.user?.id) {
          console.log('[ChatHistory] No user session found. Skipping chat fetch.');
          return [];
        }
        
        try {
          // DEBUG: Fetching chats for user
          console.log(`[ChatHistory] Fetching chats for user: ${session.user.id}`);
          const { data, error } = await getChats(session.user.id);
          
          if (error) {
            // DEBUG: Log Supabase fetch error
            console.error('[ChatHistory] Error fetching chats from Supabase:', error);
            throw new Error(error.message);
          }
          
          // DEBUG: Log successful chat fetch
          console.log('[ChatHistory] Successfully fetched chats:', data);
          return data || [];
        } catch (error) {
          console.error('[ChatHistory] An unexpected error occurred during chat fetch:', error);
          return []; // Return empty array on error to prevent breaking the UI
        }
      },
      enabled: !!session?.user?.id,
    }
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const subscription = subscribeToChats(session.user.id, () => {
      queryClient.invalidateQueries({ queryKey: ['chats', session.user.id]});
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [session?.user?.id, queryClient]);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
  ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / (24 * 7))}w ago`;
  };

  return (
    <motion.div 
      className="h-full glass-effect flex flex-col relative overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cosmic gradient overlay */}
      <div className="absolute inset-0 cosmic-gradient-bg opacity-10 pointer-events-none" />
      
      {/* Header */}
      <div className="p-6 border-b border-cosmic-cyan/20 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold cosmic-text">Chat History</h2>
          <Button
            onClick={onNewChat}
            size="sm"
            className="button-cosmic text-white font-medium"
          >
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-cosmic-cyan/70" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 glass-effect border-cosmic-cyan/30 focus:border-cosmic-orange text-white placeholder-cosmic-cyan/50 bg-cosmic-navy/20"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 relative z-10">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-cosmic-cyan animate-cosmic-glow" />
          </div>
        ) : (
          <AnimatePresence>
            {filteredChats.map((chat, index) => (
              <motion.div
                key={chat.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02] border ${
                  currentChat === chat.id
                    ? 'glass-effect-warm border-cosmic-orange/50 glow-effect-warm'
                    : 'glass-effect border-cosmic-cyan/20 hover:border-cosmic-blue/40 hover:glow-effect'
                }`}
                onClick={() => handleSelectChat(chat.id)}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className={`w-4 h-4 ${currentChat === chat.id ? 'text-cosmic-orange' : 'text-cosmic-cyan'}`} />
                    <h3 className="font-medium text-sm truncate flex-1 text-white">{chat.title}</h3>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity text-cosmic-cyan/60 hover:text-cosmic-orange">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                <p className="text-xs text-cosmic-cyan/70 mb-3 line-clamp-2">
                  {chat.preview}
                </p>
                
                <div className="flex items-center justify-between text-xs text-cosmic-cyan/50">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimestamp(chat.timestamp)}</span>
                  </div>
                  <span className="text-cosmic-orange/70">{chat.message_count} messages</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {filteredChats.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 px-4 text-cosmic-cyan/60"
          >
            <MessageSquare className="w-10 h-10 mx-auto mb-4 opacity-50" />
            <h3 className="font-semibold text-white mb-1">No Conversations Yet</h3>
            <p className="text-sm">Click 'New Chat' to start your first conversation with HabitForge AI.</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatHistory;
