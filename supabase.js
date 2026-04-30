import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ftsyzeuzjivysinlzfks.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0c3l6ZXV6aml2eXNpbmx6ZmtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1NjM4NjIsImV4cCI6MjA5MzEzOTg2Mn0.gWX0WR5JVshrgjw7LKUscR5ETkgzurZaXG2KZ7FmUdU';

export const supabase = createClient(supabaseUrl, supabaseKey);
