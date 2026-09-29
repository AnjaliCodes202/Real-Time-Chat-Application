import Message from '../models/Message.js';
import { getReceiverSocketId, io } from '../lib/socket.js';
import cloudinary from '../lib/cloudinary.js';

export const getMessages = async (req, res, next) => {
    try {
        const { id: userToChatId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: myId, receiver: userToChatId },
                { sender: userToChatId, receiver: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error in getMessages:', error.message);
        next(error);
    }
};

export const sendMessage = async (req, res, next) => {
    try {
        const { text, attachment, clientMessageId } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        // Idempotency: Check if a message with this clientMessageId already exists
        let message = await Message.findOne({ clientMessageId, sender: senderId });

        if (!message) {
            let processedAttachment = null;
            if (attachment && attachment.url) {
                const uploadResponse = await cloudinary.uploader.upload(attachment.url, {
                    folder: "chat_app_attachments",
                });
                processedAttachment = {
                    url: uploadResponse.secure_url,
                    type: 'image',
                    size: uploadResponse.bytes || 0
                };
            }

            const receiverSocketId = await getReceiverSocketId(receiverId);

            message = new Message({
                sender: senderId,
                receiver: receiverId,
                text,
                attachment: processedAttachment,
                clientMessageId,
                status: receiverSocketId ? 'DELIVERED' : 'SENT'
            });
            await message.save();
        }

        const receiverSocketId = await getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('newMessage', message);
        }

        res.status(201).json(message);
    } catch (error) {
        console.error('Error in sendMessage:', error.message);
        next(error);
    }
};

export const editMessage = async (req, res, next) => {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const senderId = req.user._id;

        const message = await Message.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { text, editedAt: new Date() },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found or unauthorized' });
        }

        const receiverSocketId = await getReceiverSocketId(message.receiver.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageEdited', message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error in editMessage:', error.message);
        next(error);
    }
};

export const deleteMessage = async (req, res, next) => {
    try {
        const { id: messageId } = req.params;
        const senderId = req.user._id;

        // Soft delete
        const message = await Message.findOneAndUpdate(
            { _id: messageId, sender: senderId },
            { deletedAt: new Date() },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ message: 'Message not found or unauthorized' });
        }

        const receiverSocketId = await getReceiverSocketId(message.receiver.toString());
        if (receiverSocketId) {
            io.to(receiverSocketId).emit('messageDeleted', message);
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error in deleteMessage:', error.message);
        next(error);
    }
};

export const markAsRead = async (req, res, next) => {
    try {
        const { id: senderId } = req.params;
        const myId = req.user._id;

        await Message.updateMany(
            { sender: senderId, receiver: myId, status: { $ne: 'READ' } },
            { $set: { status: 'READ' } }
        );

        const senderSocketId = await getReceiverSocketId(senderId.toString());
        if (senderSocketId) {
            io.to(senderSocketId).emit('messagesRead', { readerId: myId });
        }

        res.status(200).json({ message: 'Messages marked as read' });
    } catch (error) {
        console.error('Error in markAsRead:', error.message);
        next(error);
    }
};
