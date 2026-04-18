import { createClient } from '@supabase/supabase-js'
import type { Computer } from './types'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (_client) return _client
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  _client = createClient(url, key)
  return _client
}

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
