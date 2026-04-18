import { createClient } from '@supabase/supabase-js'
import type { Computer } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
