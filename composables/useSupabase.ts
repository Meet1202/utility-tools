import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function useSupabase() {
  const config = useRuntimeConfig()
  const supabaseUrl = (config.public.supabaseUrl as string) || ''
  const supabaseKey = (config.public.supabaseKey as string) || ''

  const isConfigured = Boolean(supabaseUrl && supabaseKey)

  if (isConfigured && !supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseKey)
  }

  return {
    client: supabaseClient,
    isConfigured,
    supabaseUrl,
    supabaseKey
  }
}
