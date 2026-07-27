import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
}

// Client-safe Supabase client — safe to import anywhere
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: (url, options) => {
      // Only apply timeout for non-storage requests (uploads need more time on slow connections)
      const isStorageUpload = typeof url === 'string' && url.includes('/storage/v1/object')
      if (isStorageUpload) {
        return fetch(url, options)
      }
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15000) // 15s timeout for API calls
      return fetch(url, { ...options, signal: controller.signal })
        .finally(() => clearTimeout(timeout))
    }
  }
})
