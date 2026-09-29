import User from '../models/User.js';
import cloudinary from '../lib/cloudinary.js';

export const getUsersForSidebar = async (req, res, next) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select('-password');
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error('Error in getUsersForSidebar:', error.message);
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const { profilePicture, bio, name } = req.body;
        const userId = req.user._id;

        const updateData = {};
        
        if (profilePicture) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(profilePicture, {
                folder: "chat_app_profiles",
            });
            updateData.profilePicture = uploadResponse.secure_url;
        }

        if (bio) updateData.bio = bio;
        if (name) updateData.name = name;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        ).select('-password');

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error in updateProfile:', error.message);
        next(error);
    }
};
