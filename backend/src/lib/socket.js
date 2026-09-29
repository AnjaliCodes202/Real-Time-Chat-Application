import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import User from '../models/User.js';
import Message from '../models/Message.js';
import { createAdapter } from '@socket.io/redis-adapter';
import { pubClient, subClient, redisClient } from './redis.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.adapter(createAdapter(pubClient, subClient));

export const getReceiverSocketId = async (receiverId) => {
    return await redisClient.hGet('online_users', receiverId);
};

export const getOnlineUsers = async () => {
    return await redisClient.hKeys('online_users');
};

io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id);

    const userId = socket.handshake.query.userId;
    
    if (userId && userId !== 'undefined') {
        await redisClient.hSet('online_users', userId, socket.id);

        // Mark pending messages as DELIVERED
        Message.updateMany(
            { receiver: userId, status: 'SENT' },
            { $set: { status: 'DELIVERED' } }
        ).then(() => {
            // Find distinct senders to notify them
            Message.distinct('sender', { receiver: userId, status: 'DELIVERED' }).then(senders => {
                senders.forEach(async (senderId) => {
                    const senderSocketId = await getReceiverSocketId(senderId.toString());
                    if (senderSocketId) {
                        io.to(senderSocketId).emit('messagesDelivered', { receiverId: userId });
                    }
                });
            });
        }).catch(err => console.error("Failed to mark delivered:", err));
    }

    // Broadcast online users
    const onlineUsers = await getOnlineUsers();
    io.emit('getOnlineUsers', onlineUsers);

    // Handle typing events
    socket.on('typing:start', async ({ receiverId }) => {
        const receiverSocketId = await getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing:start', { senderId: userId });
        }
    });

    socket.on('typing:stop', async ({ receiverId }) => {
        const receiverSocketId = await getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('typing:stop', { senderId: userId });
        }
    });

    socket.on('disconnect', async () => {
        console.log('User disconnected:', socket.id);
        if (userId) {
            await redisClient.hDel('online_users', userId);
            const onlineUsers = await getOnlineUsers();
            io.emit('getOnlineUsers', onlineUsers);
            
            // Update lastSeen in DB
            try {
                await User.findByIdAndUpdate(userId, { lastSeen: new Date() });
                io.emit('userOffline', { userId, lastSeen: new Date() });
            } catch (error) {
                console.error("Failed to update lastSeen:", error);
            }
        }
    });
});

export { app, server, io };
