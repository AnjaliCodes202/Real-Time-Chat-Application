import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
            minlength: 6,
        },
        profilePicture: {
            type: String,
            default: '',
        },
        bio: {
            type: String,
            default: '',
        },
        lastSeen: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
