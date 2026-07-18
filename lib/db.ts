import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL')
}

if (!supabaseSecretKey) {
  throw new Error('Missing SUPABASE_SECRET_KEY')
}

// Server-side Supabase client.
// NEVER expose SUPABASE_SECRET_KEY to browser/client code.
export const db = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

// Tables already exist in Supabase, so initialization is no longer needed.
export async function initializeDatabase() {
  return
}