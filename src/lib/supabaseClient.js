import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project-ref')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Default couple config
export const DEFAULT_COUPLE_ID = 'c1010000-0000-0000-0000-000000000101';

// Profile mapping by email for fallback metadata
export const LOCAL_PROFILES = {
  'khanif@gmail.com': {
    id: 'e258766b-78f3-43e0-8901-0ae225c75cc3',
    couple_id: DEFAULT_COUPLE_ID,
    name: 'Khanif',
    email: 'khanif@gmail.com',
    role: 'partner'
  },
  'arum@gmail.com': {
    id: 'afc77284-caab-413b-be18-38f14ca07fc2',
    couple_id: DEFAULT_COUPLE_ID,
    name: 'Arum',
    email: 'arum@gmail.com',
    role: 'partner'
  }
};

// Initial empty state
export const getInitialState = () => ({
  couple: {
    id: DEFAULT_COUPLE_ID,
    couple_name: 'Ruang Khanif & Arum',
    invite_code: 'BERSAMA',
    created_at: new Date().toISOString(),
  },
  profiles: {
    user1: LOCAL_PROFILES['khanif@gmail.com'],
    user2: LOCAL_PROFILES['arum@gmail.com'],
  },
  habits: [],
  habit_logs: [],
  daily_tasks: [],
  agenda_events: [],
  weekly_evaluations: [],
  daily_journals: [],
  college_assignments: [],
});
