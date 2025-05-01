import { Joke } from '../models/joke.js';
import { Like } from '../models/like.js';
import { User } from '../models/user.js';
import { Op } from 'sequelize';

// Get all jokes with optional filters
export const getJokes = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, userId } = req.query;
        const offset = (page - 1) * limit;

        const whereClause = {};
        if (search) {
            whereClause.content = { [Op.iLike]: `%${search}%` };
        }
        if (userId) {
            whereClause.user_id = userId;
        }

        const { count, rows: jokes } = await Joke.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: Like,
                    attributes: ['user_id']
                }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']]
        });

        const totalPages = Math.ceil(count / limit);

        res.json({
            success: true,
            data: {
                jokes,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    totalPages
                }
            }
        });
    } catch (error) {
        console.error('Error fetching jokes:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching jokes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get a single joke by ID
export const getJokeById = async (req, res) => {
    try {
        const { jokeId } = req.params;

        const joke = await Joke.findByPk(jokeId, {
            include: [
                {
                    model: User,
                    attributes: ['username']
                },
                {
                    model: Like,
                    attributes: ['user_id']
                }
            ]
        });

        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        res.json({
            success: true,
            data: joke
        });
    } catch (error) {
        console.error('Error fetching joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Create a new joke
export const createJoke = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.session.userId;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const joke = await Joke.create({
            title,
            content,
            user_id: userId
        });

        const jokeWithUser = await Joke.findByPk(joke.joke_id, {
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Joke created successfully',
            data: jokeWithUser
        });
    } catch (error) {
        console.error('Error creating joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update a joke
export const updateJoke = async (req, res) => {
    try {
        const { jokeId } = req.params;
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'Title and content are required'
            });
        }

        const joke = await Joke.findByPk(jokeId);
        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        await joke.update({
            title,
            content
        });

        const updatedJoke = await Joke.findByPk(jokeId, {
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        res.json({
            success: true,
            message: 'Joke updated successfully',
            data: updatedJoke
        });
    } catch (error) {
        console.error('Error updating joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Delete a joke
export const deleteJoke = async (req, res) => {
    try {
        const { jokeId } = req.params;

        const joke = await Joke.findByPk(jokeId);
        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        // Delete associated likes first
        await Like.destroy({
            where: { joke_id: jokeId }
        });

        // Then delete the joke
        await joke.destroy();

        res.json({
            success: true,
            message: 'Joke and associated likes deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Like a joke
export const likeJoke = async (req, res) => {
    try {
        const { jokeId } = req.params;
        const userId = req.session.userId;

        // Check if joke exists
        const joke = await Joke.findByPk(jokeId);
        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        // Check if already liked
        const existingLike = await Like.findOne({
            where: {
                joke_id: jokeId,
                user_id: userId
            }
        });

        if (existingLike) {
            return res.status(400).json({
                success: false,
                message: 'You have already liked this joke'
            });
        }

        // Create like
        await Like.create({
            joke_id: jokeId,
            user_id: userId
        });

        // Get updated like count
        const likeCount = await Like.count({
            where: { joke_id: jokeId }
        });

        res.json({
            success: true,
            message: 'Joke liked successfully',
            data: {
                joke_id: jokeId,
                likes: likeCount
            }
        });
    } catch (error) {
        console.error('Error liking joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error liking joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Unlike a joke
export const unlikeJoke = async (req, res) => {
    try {
        const { jokeId } = req.params;
        const userId = req.session.userId;

        // Find and delete the like
        const like = await Like.findOne({
            where: {
                joke_id: jokeId,
                user_id: userId
            }
        });

        if (!like) {
            return res.status(404).json({
                success: false,
                message: 'You have not liked this joke'
            });
        }

        await like.destroy();

        // Get updated like count
        const likeCount = await Like.count({
            where: { joke_id: jokeId }
        });

        res.json({
            success: true,
            message: 'Joke unliked successfully',
            data: {
                joke_id: jokeId,
                likes: likeCount
            }
        });
    } catch (error) {
        console.error('Error unliking joke:', error);
        res.status(500).json({
            success: false,
            message: 'Error unliking joke',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
