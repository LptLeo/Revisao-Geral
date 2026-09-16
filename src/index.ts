import express from 'express';
import type { Express } from 'express';
import AppDataSource from './config/AppDataSource.ts';
import { env } from './config/env.ts';
import { errorHandler } from './middleware/GlobalErrorHandler.ts';

const app: Express = express();

app.use(express.json());
app.use(errorHandler);

async function initializeServer(): Promise<void> {
    await AppDataSource.initialize();

    app.listen(env.SV_PORT, () => {
        console.log(`Servidor rodando na porta ${env.SV_PORT}`);
    });
}

initializeServer().catch((error) => {
    console.error('Erro ao conectar com o banco', error);
});