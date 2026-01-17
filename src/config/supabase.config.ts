import { createClient, SupabaseClient } from '@supabase/supabase-js'

class SupabaseConfig {
  private static instance: SupabaseClient | null = null

  static getClient(): SupabaseClient {
    if (!this.instance) {
      const supabaseUrl = process.env.SUPABASE_URL || ''
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

      this.instance = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })

      console.log('✅ Supabase client initialized')
    }

    return this.instance
  }
}

export const getSupabaseClient = () => SupabaseConfig.getClient()

export default SupabaseConfig.getClient()
