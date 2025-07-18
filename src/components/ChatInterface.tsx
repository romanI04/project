
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useSession } from '@/hooks/use-session';
import OpenAI from 'openai';
import { toast } from '@/components/ui/sonner.export';
import { useQueryClient } from '@tanstack/react-query';
import {
  insertMoodLog,
  createChat,
  insertMessage,
  getMessages,
  upsertChat,
  insertProgress,
} from '@/lib/supabaseClient';

const AI_PROMPT = `You are HabitForge AI, a witty, empathetic, and maximally helpful habit-building coach inspired by world-class experts in cognitive science, behavioral psychology, and goal achievement. Your mission is to guide users toward their goals through conversational chats.

Core Rules & Constraints:
- Role: Act as a personalized tutor. Analyze user input for patterns (procrastination, triggers) and adapt your plan.
- Mood Adaptation: The user's mood has been detected as [MOOD]. Acknowledge it subtly and adjust your tone and suggestions accordingly. For example, if they're "stressed," suggest a smaller, more manageable step.
- Interaction: Wait for a user response before advancing. Keep responses under 200 words. End with a clear next action or question.
- Evidence-Based Techniques: Use principles like SMART goals, habit stacking, and cognitive reframing.
- Safety & Boundaries: Never give medical or legal advice. Redirect to professionals if needed. If a user seems distressed, gently suggest resources. Promote only healthy, sustainable habits.
- Continuity: Reference past chats and progress to maintain context and motivation.`;

const MOOD_DETECTION_PROMPT = `Analyze the user's message and respond with a single word that best describes their mood (e.g., "motivated," "stressed," "tired," "frustrated," "neutral").`;

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  chatId: string | null;
  setCurrentChat: React.Dispatch<React.SetStateAction<string | null>>;
  onNewMessage: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chatId, onNewMessage, setCurrentChat }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { session } = useSession();
  const queryClient = useQueryClient();

  const isPremium = session?.user?.user_metadata?.is_premium || false;

  const detectMood = async (message: string): Promise<string> => {
    if (isPremium) {
      try {
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: MOOD_DETECTION_PROMPT },
            { role: 'user', content: message },
          ],
          max_tokens: 10,
        });
        return response.choices[0].message?.content?.trim().toLowerCase() || 'neutral';
      } catch (error) {
        console.error('Premium mood detection failed:', error);
        return 'neutral';
      }
    } else {
      const keywords = {
        happy: ['happy', 'excited', 'great', 'awesome'],
        stressed: ['stressed', 'overwhelmed', 'anxious'],
        tired: ['tired', 'exhausted', 'drained'],
        frustrated: ['frustrated', 'annoyed', 'stuck'],
      };
      for (const mood in keywords) {
        if (keywords[mood].some(keyword => message.toLowerCase().includes(keyword))) {
          return mood;
        }
      }
      return 'neutral';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadMessages = async () => {
      if (chatId && session?.user) {
        // DEBUG: Loading messages for chat
        console.log(`[ChatInterface] Loading messages for chatId: ${chatId}`);
        const { data, error } = await getMessages(chatId);
        if (error) {
          toast.error("Failed to load chat messages.");
          console.error('[ChatInterface] Error loading messages:', error);
        } else {
          const loadedMessages = data.map(msg => ({
            id: msg.id,
            type: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(loadedMessages);
          console.log('[ChatInterface] Messages loaded:', loadedMessages);
        }
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [chatId, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // DEBUG: Log form submission
    console.log('[ChatInterface] Handling form submission.');

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    // DEBUG: Check for authenticated session before proceeding
    if (!session?.user) {
      console.error('[ChatInterface] User not authenticated. Aborting message send.');
      toast.error('You must be logged in to chat.');
      setIsLoading(false);
      setIsTyping(false);
      // Revert message addition if not logged in
      setMessages(messages); 
      return;
    }

    let currentChatId = chatId;

    try {
      // Create a new chat if one doesn't exist
      if (!currentChatId) {
        const chatTitle = userMessage.content.substring(0, 30);
        console.log(`[ChatInterface] No active chat. Creating new chat with title: "${chatTitle}"`);
        const { data: newChat, error: createChatError } = await createChat(session.user.id, chatTitle);

        if (createChatError || !newChat) {
          console.error('[ChatInterface] Failed to create new chat:', createChatError);
          toast.error('Could not start a new conversation. Please try again.');
          return;
        }
        
        console.log('[ChatInterface] New chat created:', newChat);
        currentChatId = newChat.id;
        setCurrentChat(newChat.id); // Update parent state with the new chat ID
        
        // DEBUG: Invalidate chats query to refresh chat history
        console.log('[ChatInterface] Invalidating chats query to refresh history.');
        queryClient.invalidateQueries({ queryKey: ['chats', session.user.id] });
        onNewMessage(); // Refresh chat history
      }

      if (!currentChatId) {
        console.error("[ChatInterface] Critical error: Chat ID is null after creation attempt.");
        toast.error("A critical error occurred. Please refresh the page.");
        return;
      }
      
      // DEBUG: Log mood detection start
      console.log('[ChatInterface] Detecting mood...');
      const mood = await detectMood(userMessage.content);
      // DEBUG: Log mood detection result
      console.log(`[ChatInterface] Mood detected: ${mood}`);
      
      if (session?.user) {
        // DEBUG: Log mood log insertion
        console.log('[ChatInterface] Inserting mood log for user:', session.user.id);
        await insertMoodLog({ user_id: session.user.id, mood });
      }

      const history: OpenAI.Chat.ChatCompletionMessageParam[] = newMessages.map(
        (msg) => ({
          role: msg.type === 'ai' ? 'assistant' : 'user',
          content: msg.content,
        })
      );
      
      // DEBUG: Log AI call
      console.log('[ChatInterface] Sending request to OpenAI API.');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: AI_PROMPT.replace('[MOOD]', mood),
          },
          ...history,
        ],
      });

      const aiResponse = response.choices[0].message?.content?.trim();
      
      // DEBUG: Log AI response
      console.log('[ChatInterface] Received response from OpenAI API.');

      if (!aiResponse) {
        // DEBUG: Log empty AI response error
        console.error('[ChatInterface] OpenAI response was empty.');
        throw new Error('Empty response from AI.');
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
      };

      setIsTyping(false);
      setMessages(prev => [...prev, aiMessage]);
      
      // DEBUG: Invalidate chats query to refresh chat history after a new message
      console.log('[ChatInterface] Invalidating chats query for message update.');
      queryClient.invalidateQueries({ queryKey: ['chats', session.user.id] });
      
      // --- Robust Message Saving ---
      const messagesToSave = [
        { chat_id: currentChatId, user_id: session.user.id, role: 'user', content: userMessage.content },
        { chat_id: currentChatId, user_id: session.user.id, role: 'ai', content: aiMessage.content }
      ];

      saveMessagesWithRetry(messagesToSave, currentChatId, aiResponse);

      // --- Insert Progress Log ---
      // DEBUG: Inserting new progress log after successful interaction
      console.log('[ChatInterface] Inserting progress log.');
      const progressPayload = {
        user_id: session.user.id,
        goal: userMessage.content, // The user's message is the goal for the day
        log: aiResponse,
      };

      const { error: progressError } = await insertProgress(progressPayload);
      if (progressError) {
        console.error('[ChatInterface] Failed to insert progress log:', progressError);
        toast.error('Could not save your progress for the day.');
      } else {
        console.log('[ChatInterface] Progress log saved successfully.');
        // Invalidation is handled by the subscription in ProgressPanel
      }
      
    } catch (error) {
      // DEBUG: Log error during AI interaction
      console.error('[ChatInterface] Error during AI response generation or data saving:', error);
      toast.error('Sorry, I had some trouble connecting. Please try again.');
      
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: "I seem to be having some technical difficulties. Please give me a moment and try your message again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setIsTyping(false);
    } finally {
      // DEBUG: Log end of loading state
      console.log('[ChatInterface] Finished processing message.');
      setIsLoading(false);
    }
  };

  const saveMessagesWithRetry = async (messages, chatId, previewText, retries = 3) => {
    try {
      console.log(`[ChatInterface] Attempting to save messages (retries left: ${retries})`);
      const { error } = await insertMessage(messages);

      if (error) {
        throw error; // Throw to be caught by the catch block
      }
      
      console.log('[ChatInterface] Messages saved successfully.');
      // Update the chat preview with the latest AI response
      await upsertChat({ id: chatId, preview: previewText, timestamp: new Date().toISOString() });

    } catch (error) {
      if (retries > 0) {
        console.warn(`[ChatInterface] Save failed. Retrying in 2 seconds...`, error);
        setTimeout(() => saveMessagesWithRetry(messages, chatId, previewText, retries - 1), 2000);
      } else {
        console.error('[ChatInterface] Error saving messages to Supabase after multiple retries:', error);
        toast.error('Failed to save message history. Your conversation may not be persisted.');
      }
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                ease: [0.25, 0.46, 0.45, 0.94], // Smooth easing
                delay: index === messages.length - 1 ? 0 : Math.min(index * 0.02, 0.1) // Only animate newest message immediately
              }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <motion.div
                className={`max-w-2xl px-6 py-4 rounded-2xl transition-all duration-500 ${
                  message.type === 'user'
                    ? 'user-bubble text-cosmic-black font-medium shadow-lg hover:shadow-xl'
                    : 'ai-bubble font-semibold glow-effect-warm hover:glow-effect'
                }`}
                whileHover={{ 
                  scale: 1.01,
                  transition: { duration: 0.2 }
                }}
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1,
                  transition: { 
                    duration: index === messages.length - 1 ? 0.4 : 0.2, 
                    ease: "easeOut" 
                  }
                }}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </motion.div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex justify-start"
            >
              <div className="ai-bubble px-6 py-4 rounded-2xl">
                <div className="flex space-x-1 items-center">
                  <motion.div
                    className="w-1.5 h-1.5 bg-cosmic-black/60 rounded-full"
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-cosmic-black/60 rounded-full"
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  />
                  <motion.div
                    className="w-1.5 h-1.5 bg-cosmic-black/60 rounded-full"
                    animate={{ 
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.1, 0.8]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  />
                  <span className="text-xs text-cosmic-black/50 ml-2">HabitForge is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <motion.div 
        className="border-t border-cosmic-cyan/30 p-6 glass-effect"
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
              className="min-h-[60px] max-h-32 resize-none glass-effect border-cosmic-cyan/30 focus:border-cosmic-orange text-white placeholder-cosmic-cyan/60 pr-24 bg-cosmic-navy/20"
              disabled={isLoading}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-12 top-1/2 -translate-y-1/2 text-cosmic-cyan hover:text-cosmic-orange transition-colors duration-300"
              onClick={() => {
                // This is a placeholder to lead to the settings in ProgressPanel
                toast.info("You can manage your daily reminders in the Progress panel!");
              }}
            >
              <Bell className="w-5 h-5" />
            </Button>
          </div>
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="button-cosmic px-6 py-3 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
