import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_NAME: z.string().default("GenTask")
});

type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

function isBuildTimePhase(): boolean {
  return process.env.NEXT_PHASE === "phase-production-build" || process.env.npm_lifecycle_event === "build";
}

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const isProd = process.env.NODE_ENV === "production";
  const allowBuildFallback = isBuildTimePhase();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? (isProd && !allowBuildFallback ? undefined : "http://localhost:54321");
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? (isProd && !allowBuildFallback ? undefined : "public-anon-key");

  cachedEnv = envSchema.parse({
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME
  });

  if (isProd && !allowBuildFallback) {
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
