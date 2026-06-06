import { createClient } from 'https://esm.sh/@supabase/supabase-js'

const supabaseUrl = 'https://iyzoirvvtmrhbblhrhnn.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5em9pcnZ2dG1yaGJibGhyaG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3NjMxNjAsImV4cCI6MjA5NjMzOTE2MH0.XhrQXof__TCRLtSfYSD09PV2cuMqGm8SyOt5I-l4TQA'

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)
