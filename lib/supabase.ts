import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          topic: string
          score: number
          total_questions: number
          questions: any[]
          user_answers: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          score: number
          total_questions: number
          questions: any[]
          user_answers: string[]
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          score?: number
          total_questions?: number
          questions?: any[]
          user_answers?: string[]
          created_at?: string
        }
      }
      learning_paths: {
        Row: {
          id: string
          user_id: string
          topic: string
          difficulty: string
          status: string
          progress: number
          recommended_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          topic: string
          difficulty: string
          status?: string
          progress?: number
          recommended_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          topic?: string
          difficulty?: string
          status?: string
          progress?: number
          recommended_at?: string
          completed_at?: string | null
        }
      }
    }
  }
}