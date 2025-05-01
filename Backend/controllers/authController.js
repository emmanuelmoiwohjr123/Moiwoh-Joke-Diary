import { User } from '../models/user.js';
import bcrypt from "bcrypt";

export const register = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    try {
        // Validate input
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const newUser = await User.create({
            username,
            email,
            password_hash: hashedPassword,
            registration_date: new Date(),
            is_active: true,
            is_admin: false
        });

        // Set up session
        req.session.userId = newUser.user_id;
        req.session.userRole = newUser.is_admin ? 'admin' : 'user';

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Return success response
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user_id: newUser.user_id,
                username: newUser.username,
                email: newUser.email,
                is_admin: newUser.is_admin
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user || !user.is_active) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await user.update({ last_login: new Date() });

        // Set up session
        req.session.userId = user.user_id;
        req.session.userRole = user.is_admin ? 'admin' : 'user';

        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) reject(err);
                resolve();
            });
        });

        // Return success response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                is_admin: user.is_admin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const logout = async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            req.session.destroy((err) => {
                if (err) reject(err);
                resolve();
            });
        });

        res.clearCookie('connect.sid');
        
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during logout',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const checkAuth = (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({ 
      authenticated: true,
      message: "User is authenticated"
    });
  }
  res.status(200).json({ 
    authenticated: false,
    message: "User is not authenticated"
  });
};