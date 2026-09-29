import { createClient } from 'redis';
import { logger } from './logger.js';

export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

export const pubClient = redisClient.duplicate();
export const subClient = redisClient.duplicate();

redisClient.on('error', (err) => logger.error('Redis Client Error', err));
pubClient.on('error', (err) => logger.error('Redis Pub Client Error', err));
subClient.on('error', (err) => logger.error('Redis Sub Client Error', err));

export const connectRedis = async () => {
    try {
        await redisClient.connect();
        await pubClient.connect();
        await subClient.connect();
        logger.info('Connected to Redis');
    } catch (error) {
        logger.error(`Error connecting to Redis: ${error.message}`);
    }
};
