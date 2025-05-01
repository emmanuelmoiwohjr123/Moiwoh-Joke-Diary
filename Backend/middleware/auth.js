// Authentication and authorization middleware
import jwt from 'jsonwebtoken';
import { Joke } from '../models/joke.js';

// Middleware to check if user is authenticated
export const isAuthenticated = (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }
    next();
};

// Middleware to check if user is owner of the resource or an admin
export const isOwnerOrAdmin = async (req, res, next) => {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ 
            success: false, 
            message: 'Authentication required' 
        });
    }

    // The jokeId will be passed in the request parameters
    const { jokeId } = req.params;
    const userId = req.session.userId;
    const isAdmin = req.session.userRole === 'admin';

    // If user is admin, allow access
    if (isAdmin) {
        return next();
    }

    // Check if the joke belongs to the user
    try {
        const joke = await Joke.findByPk(jokeId);
        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        if (joke.userId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: You can only modify your own jokes'
            });
        }

        next();
    } catch (error) {
        console.error('Error in isOwnerOrAdmin middleware:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
