import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("GenTask")
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const isProd = process.env.NODE_ENV === "production";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isProd ? undefined : "http://localhost:54321");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (isProd ? undefined : "public-anon-key");

  cachedEnv = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
  });

  if (isProd) {
    const invalidUrl = cachedEnv.NEXT_PUBLIC_SUPABASE_URL.includes("localhost");
    const invalidAnonKey = cachedEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY === "public-anon-key";

    if (invalidUrl || invalidAnonKey) {
      throw new Error(
        "Supabase env inválida em produção. Configure NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY reais na Vercel e faça redeploy."
      );
    }
  }

  return cachedEnv;
}
