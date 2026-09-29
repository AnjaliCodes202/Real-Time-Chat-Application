import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        text: {
            type: String,
        },
        attachment: {
            url: String,
            type: {
                type: String,
                enum: ['image', 'file', 'none'],
                default: 'none',
            },
            size: Number,
        },
        clientMessageId: {
            type: String,
            required: true,
            unique: true,
        },
        status: {
            type: String,
            enum: ['SENT', 'DELIVERED', 'READ'],
            default: 'SENT',
        },
        editedAt: {
            type: Date,
        },
        deletedAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;
