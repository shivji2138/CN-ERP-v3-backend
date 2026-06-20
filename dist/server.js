import http from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { connectRedis } from './config/redis.js';
import { logger } from './config/logger.js';
import { createSocketServer } from './config/socket.js';
async function bootstrap() {
    await connectDatabase();
    await connectRedis();
    const app = createApp();
    const server = http.createServer(app);
    createSocketServer(server);
    server.listen(env.PORT, () => {
        logger.info(`Cybernaut Minutos API listening on ${env.PORT}`);
    });
}
bootstrap().catch((error) => {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
});
