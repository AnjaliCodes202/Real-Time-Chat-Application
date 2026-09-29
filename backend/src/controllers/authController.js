import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import { redisClient } from '../lib/redis.js';

const generateTokens = async (userId, res) => {
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in Redis
    await redisClient.set(`refreshToken:${userId}`, refreshToken, { EX: 7 * 24 * 60 * 60 });

    res.cookie('jwt', accessToken, {
        maxAge: 15 * 60 * 1000, // 15 minutes
        httpOnly: true,
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    res.cookie('refreshToken', refreshToken, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true,
        sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict",
        secure: process.env.NODE_ENV !== "development",
    });

    return { accessToken, refreshToken };
};

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        if (newUser) {
            await generateTokens(newUser._id, res);
            await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                profilePicture: newUser.profilePicture,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Error in signup controller:', error.message);
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        await generateTokens(user._id, res);

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        });
    } catch (error) {
        console.error('Error in login controller:', error.message);
        next(error);
    }
};

export const logout = async (req, res) => {
    try {
        if (req.user) {
            await redisClient.del(`refreshToken:${req.user._id}`);
        }
        res.cookie('jwt', '', { maxAge: 0, sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict", secure: process.env.NODE_ENV !== "development" });
        res.cookie('refreshToken', '', { maxAge: 0, sameSite: process.env.NODE_ENV !== "development" ? "none" : "strict", secure: process.env.NODE_ENV !== "development" });
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error in logout controller:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user);
    } catch (error) {
        console.error('Error in checkAuth controller:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken: token } = req.cookies;
        if (!token) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const storedToken = await redisClient.get(`refreshToken:${decoded.userId}`);

        if (!storedToken || storedToken !== token) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        await generateTokens(user._id, res);
        res.status(200).json({ message: 'Token refreshed successfully' });
    } catch (error) {
        console.error('Error in refresh token:', error.message);
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};
