require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error("Gunakan format: node scripts/add-admin.js admin@bizzy.id rahasia123");
  process.exit(1);
}

const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log(`Membuat kredensial Super Admin khusus: ${email}...`);
  
  // 1. Buat User menggunakan Admin API (Bypass konfirmasi email)
  const { data, error } = await admin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true
  });

  if (error) {
    console.error("Gagal membuat akun:", error.message);
    process.exit(1);
  }

  // 2. Tandai sebagai Super Admin
  const { error: profileError } = await admin
    .from("profiles")
    .update({ is_super_admin: true })
    .eq("id", data.user.id);

  if (profileError) {
    console.error("Gagal set hak akses admin:", profileError.message);
  } else {
    console.log("✅ Super Admin berhasil dibuat! Silakan login di admin.localhost:3000/login");
  }
}
main();
