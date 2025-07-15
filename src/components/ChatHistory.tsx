
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MessageSquare, Clock, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatHistoryItem {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  messageCount: number;
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
  const [chats, setChats] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    // Load chat history from localStorage (simulating Supabase)
    const mockChats: ChatHistoryItem[] = [
      {
        id: '1',
        title: 'Daily Exercise Routine',
        preview: 'Help me build a consistent exercise habit...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        messageCount: 12,
      },
      {
        id: '2',
        title: 'Reading Before Bed',
        preview: 'I want to read 20 minutes every night...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        messageCount: 8,
      },
      {
        id: '3',
        title: 'Morning Meditation',
        preview: 'Starting a meditation practice...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
        messageCount: 15,
      },
      {
        id: '4',
        title: 'Healthy Eating',
        preview: 'Need help with meal planning and nutrition...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 1 week ago
        messageCount: 6,
      },
    ];
    setChats(mockChats);
  }, []);

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / (24 * 7))}w ago`;
  };

  return (
    <motion.div 
      className="h-full glass-effect flex flex-col"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Chat History</h2>
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            New
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 focus:border-blue-500 text-white"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filteredChats.map((chat, index) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-300 group hover:scale-[1.02] ${
                currentChat === chat.id
                  ? 'bg-blue-600/20 border border-blue-500/50 glow-effect'
                  : 'bg-gray-800/30 hover:bg-gray-700/50 border border-gray-700/50'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h3 className="font-medium text-sm truncate flex-1">{chat.title}</h3>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-400">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <p className="text-xs text-gray-400 mb-3 line-clamp-2">
                {chat.preview}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimestamp(chat.timestamp)}</span>
                </div>
                <span>{chat.messageCount} messages</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredChats.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8 text-gray-400"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No conversations found</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatHistory;
