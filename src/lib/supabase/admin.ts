import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Admin Client — uses SERVICE ROLE KEY (bypasses RLS).
 * NEVER expose this to the browser. Only use in Server Actions / API Routes.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!serviceKey || serviceKey === "your_service_role_key") {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not configured. " +
      "Go to Supabase Dashboard → Settings → API → copy the 'service_role' key and set it in .env.local"
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
