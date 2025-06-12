
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gadpqoxttsdfohhphrvu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdhZHBxb3h0dHNkZm9oaHBocnZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMjU4MTMsImV4cCI6MjA2NDkwMTgxM30.xZaGTzsqCqYAySE_d3bH5TFWuTEYev99Jiewlyr08U8';

export const supabase = createClient(supabaseUrl, supabaseKey);
