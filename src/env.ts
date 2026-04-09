import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url("URL inválida"),
  JWT_SECRET: z.string(),
  PORT: z.coerce.number().default(3333),
  ADMIN_PASSWORD: z.string()
})

export const env = envSchema.parse(process.env)
