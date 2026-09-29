import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from './lib/db.js';
import { connectRedis } from './lib/redis.js';
import { app, server } from './lib/socket.js';
import { logger } from './lib/logger.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(morganFormat, {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Centralized error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, async () => {
        logger.info(`Server running on port ${PORT}`);
        await connectDB();
        await connectRedis();
    });
}

export { app, server };
