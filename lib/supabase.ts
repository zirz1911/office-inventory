import { createClient } from '@supabase/supabase-js'
import type { Computer } from './types'

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, key)
}

export const supabase = getSupabaseClient()

export type Database = {
  public: {
    Tables: {
      computers: {
        Row: Computer
        Insert: Omit<Computer, 'id' | 'created_at'>
        Update: Partial<Omit<Computer, 'id' | 'created_at'>>
      }
    }
  }
}
