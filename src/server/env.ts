import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  SERPAPI_KEY: z.string().optional().default(""),
  ANTHROPIC_API_KEY: z.string().optional().default(""),
  ANTHROPIC_MODEL: z.string().default("claude-sonnet-4-6"),
  LEADVERO_USER_AGENT: z
    .string()
    .default("Leadvero/0.1 (+https://evoluzione.agency)"),
  SESSION_SECRET: z
    .string()
    .default("dev-insecure-secret-change-in-production-please-32chars"),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function env(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(
      `Invalid environment: ${parsed.error.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    );
  }
  cached = parsed.data;
  return cached;
}

export function requireSerpApi(): string {
  const key = env().SERPAPI_KEY;
  if (!key) throw new Error("SERPAPI_KEY is not set");
  return key;
}

export function requireAnthropic(): string {
  const key = env().ANTHROPIC_API_KEY;
  if (!key) throw new Error("ANTHROPIC_API_KEY is not set");
  return key;
}

export function sessionSecret(): Uint8Array {
  return new TextEncoder().encode(env().SESSION_SECRET);
}
