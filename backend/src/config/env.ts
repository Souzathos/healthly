import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({quiet: true})

const envSchema = z.object({
    NODE_ENV: z.string().default('development'),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().int().positive(),
    DB_USERNAME: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.coerce.number().int().positive(),
    PORT: z.coerce.number().int().positive(),
    CORS_ORIGINS: z.string().default(''),
    // Banco na nuvem (Aiven): conteúdo do certificado da CA (ca.pem).
    // Com ele a conexão usa SSL e confere que o servidor é mesmo o do banco.
    DB_SSL_CA: z.string().optional()
})

const parsed = envSchema.safeParse(process.env)

if(!parsed.success) {
    const fields = parsed.error.issues.map(issue => issue.path.join('.')).join(', ')
    throw new Error(`Variáveis de ambiente ausentes ou inválidas: ${fields}`)
}

export const env = parsed.data
