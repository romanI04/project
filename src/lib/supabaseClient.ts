import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and anon key are required.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getProgress = async (userId) => {
  const { data, error } = await supabase
    .from('progress')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const insertProgress = async (progress) => {
  const { data, error } = await supabase
    .from('progress')
    .insert([progress]);
  return { data, error };
};

export const subscribeToProgress = (userId, callback) => {
  const subscription = supabase
    .channel('public:progress')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'progress', filter: `user_id=eq.${userId}` }, payload => {
      callback(payload);
    })
    .subscribe();

  return subscription;
};

// Chat and Messages
// RLS Policy: Users can only see their own chats.
// RLS Policy: Users can only insert chats for their own user_id.
export const getChats = async (userId) => {
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false });
  return { data, error };
};

// RLS Policy: Users can only see messages in chats they are a part of.
export const getMessages = async (chatId) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('timestamp', { ascending: true });
  return { data, error };
};

// DEBUG: Function to create a new chat
export const createChat = async (userId, title) => {
  console.log(`[SupabaseClient] Creating new chat for user ${userId} with title: "${title}"`);
  const { data, error } = await supabase
    .from('chats')
    .insert([{ user_id: userId, title: title, preview: 'New conversation started...' }])
    .select()
    .single(); // .single() to get the created record back

  if (error) {
    console.error('[SupabaseClient] Error creating chat:', error);
  } else {
    console.log('[SupabaseClient] Successfully created chat:', data);
  }

  return { data, error };
};

// RLS Policy: Users can only insert messages in chats they are a part of.
export const insertMessage = async (message) => {
  // DEBUG: Log message insertion
  console.log('[SupabaseClient] Inserting message(s):', message);
  const { data, error } = await supabase.from('messages').insert(message).select();

  if (error) {
    console.error('[SupabaseClient] Error inserting message(s):', error);
  } else {
    console.log('[SupabaseClient] Successfully inserted message(s):', data);
  }

  return { data, error };
};

// RLS Policy: Users can only update their own chats.
export const upsertChat = async (chatData) => {
  const { data, error } = await supabase.from('chats').upsert(chatData).select();
  return { data, error };
};

export const subscribeToChats = (userId, callback) => {
  const subscription = supabase
    .channel('public:chats')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'chats', filter: `user_id=eq.${userId}` }, payload => {
      callback(payload);
    })
    .subscribe();
  return subscription;
};

// RLS Policy: Users can only insert their own mood logs.
export const insertMoodLog = async (log) => {
  const { data, error } = await supabase.from('mood_logs').insert([log]);
  return { data, error };
}; 