import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://wraacxqwvsfugpzxatie.supabase.co';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyYWFjeHF3dnNmdWdwenhhdGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNTE1NzUsImV4cCI6MjEwMzcyNzU3NX0.u1qQcDSLB37ZgHuDel2MpV7hsR4toRW0dCGkqnjY8Pg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export default supabase;

