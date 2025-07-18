
import { useState, useEffect, useCallback } from 'react';
import { useSession } from './use-session';
import OpenAI from 'openai';
import { toast } from '@/components/ui/sonner.export';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const NOTIFICATION_PROMPT = `Based on the user's recent chat history about their goals, write a short, witty, and motivating reminder (under 150 characters) to help them stay on track.`;

export const useNotifications = () => {
  const { session } = useSession();
  const [areNotificationsEnabled, setAreNotificationsEnabled] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (Notification.permission === 'granted') {
      setAreNotificationsEnabled(true);
    }
  }, []);

  useEffect(() => {
    const checkPremium = async () => {
      if (session?.user) {
        const { user_metadata } = session.user;
        setIsPremium(user_metadata?.is_premium || false);
      }
    };
    checkPremium();
  }, [session]);

  const getPersonalizedReminder = async (): Promise<string> => {
    const history = JSON.parse(localStorage.getItem('habitforge_progress') || '[]');
    if (history.length === 0) {
      return "Time to make some progress! What's your first step today?";
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: NOTIFICATION_PROMPT },
          { role: 'user', content: JSON.stringify(history.slice(-5)) },
        ],
        max_tokens: 50,
      });
      return response.choices[0].message?.content?.trim() || "Let's get to it! Every step counts.";
    } catch (error) {
      console.error('Error generating reminder:', error);
      return 'Another day, another opportunity to build a great habit!';
    }
  };

  const showNotification = useCallback(async () => {
    const title = 'Your Daily HabitForge Reminder';
    let body: string;

    if (isPremium) {
      body = await getPersonalizedReminder();
    } else {
      body = "Don't forget to work on your habits today! A little progress each day leads to big results.";
    }

    new Notification(title, { body, icon: '/favicon.ico' });
  }, [isPremium]);

  const requestAndEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('This browser does not support desktop notifications.');
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setAreNotificationsEnabled(true);
      toast.success('Daily reminders enabled!');
      showNotification(); 
      // In a real app, you'd use a service worker for reliable daily notifications.
      // For this demo, we'll set an interval.
      setInterval(showNotification, 1000 * 60 * 60 * 24); // 24 hours
    } else {
      toast.warning('Notifications permission denied.');
    }
  };

  return { areNotificationsEnabled, requestAndEnableNotifications, isPremium };
};

