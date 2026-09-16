import * as z from "zod";

process.loadEnvFile()

const envSchema = z.object({
    // GLOBAL ENVS
    MODE: z.enum(["development", "production"], "A variável MODE precisa ser obrigatoriamente 'development' ou 'production'"),

    // DATA BASE ENVS
    DB_HOST: z
        .string("A variável DB_HOST precisa ser obrigatoriamente uma string")
        .min(1, "A variável DB_HOST precisa ser obrigatoriamente preenchida"),
    DB_PORT: z.coerce
        .number("A variável DB_PORT precisa ser obrigatoriamente um número")
        .int("A variável DB_PORT precisa ser obrigatoriamente um número inteiro")
        .min(1, "A variável DB_PORT precisa ser obrigatoriamente preenchida")
        .max(65535, "A variável DB_PORT precisa ser obrigatoriamente menor que 65535"),
    DB_USER: z
        .string("A variável DB_USER precisa ser obrigatoriamente uma string")
        .min(1, "A variável DB_USER precisa ser obrigatoriamente preenchida"),
    DB_PASSWORD: z
        .string("A variável DB_PASSWORD precisa ser obrigatoriamente uma string")
        .min(1, "A variável DB_PASSWORD precisa ser obrigatoriamente preenchida"),
    DB_NAME: z
        .string("A variável DB_NAME precisa ser obrigatoriamente uma string")
        .min(1, "A variável DB_NAME precisa ser obrigatoriamente preenchida"),
    DB_EXTERNAL_PORT: z.coerce
        .number("A variável DB_EXTERNAL_PORT precisa ser obrigatoriamente um number")
        .int("A variável DB_EXTERNAL_PORT precisa ser obrigatoriamente um número inteiro")
        .min(1, "A variável DB_EXTERNAL_PORT precisa ser obrigatoriamente preenchida")
        .max(65535, "A variável DB_EXTERNAL_PORT precisa ser obrigatoriamente menor que 65535"),

    // SERVER ENVS
    SV_PORT: z.coerce
        .number("A variável SV_PORT precisa ser obrigatoriamente um number")
        .int("A variável SV_PORT precisa ser obrigatoriamente um número inteiro")
        .min(1, "A variável SV_PORT precisa ser obrigatoriamente preenchida")
        .max(65535, "A variável SV_PORT precisa ser obrigatoriamente menor que 65535"),
})

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
    console.error("Erro nas variáveis de ambiente:\n", z.treeifyError(_env.error));
    process.exit(1);
}

export type Env = z.infer<typeof envSchema>;
export const env = _env.data;