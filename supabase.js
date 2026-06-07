import { createClient } from 'https://esm.sh/@supabase/supabase-js'
import { SUPABASE_CONFIG } from './config.js'

export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey
)
