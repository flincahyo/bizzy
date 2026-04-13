import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const cookieDomain = process.env.NODE_ENV === "production" 
                  ? `.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}` 
                  : "localhost";
              cookieStore.set(name, value, { ...options, domain: cookieDomain });
            });
          } catch {
            // Server Component - cookies set from middleware
          }
        },
      },
    }
  );
};
