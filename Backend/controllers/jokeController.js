import { Joke } from '../models/joke.js';
import { Like } from '../models/like.js';
import { User } from '../models/user.js';
import { Op, fn, col, literal } from 'sequelize';
import { Comment } from '../models/comment.js';

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

        // Check if joke exists
        const joke = await Joke.findByPk(jokeId);
        if (!joke) {
            return res.status(404).json({
                success: false,
                message: 'Joke not found'
            });
        }

        // Check if like exists
        const like = await Like.findOne({
            where: {
                joke_id: jokeId,
                user_id: userId
            }
        });

        if (!like) {
            return res.status(400).json({
                success: false,
                message: 'You have not liked this joke'
            });
        }

        // Remove like
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

// Get joke statistics
export const getStats = async (req, res) => {
    try {
        console.log('Fetching joke statistics...');

        // Get total counts
        const [totalJokes, totalLikes, totalComments] = await Promise.all([
            Joke.count(),
            Like.count(),
            Comment.count()
        ]);

        console.log('Total counts:', { totalJokes, totalLikes, totalComments });

        // Get top jokes by likes
        const topJokesQuery = await Joke.findAll({
            attributes: ['joke_id', 'title', 'content'],
            include: [
                {
                    model: User,
                    attributes: ['username'],
                    required: true
                },
                {
                    model: Like,
                    attributes: [],
                    required: false
                }
            ],
            group: ['Joke.joke_id', 'Joke.title', 'Joke.content', 'User.user_id', 'User.username'],
            order: literal('COUNT("Likes"."like_id") DESC'),
            limit: 5,
            subQuery: false
        });

        // Get like counts for top jokes
        const topJokes = await Promise.all(topJokesQuery.map(async (joke) => {
            const likeCount = await Like.count({
                where: { joke_id: joke.joke_id }
            });
            return {
                id: joke.joke_id,
                title: joke.title,
                content: joke.content,
                author: joke.User.username,
                likes: likeCount
            };
        }));

        console.log('Top jokes found:', topJokes.length);

        // Get top contributors
        const users = await User.findAll({
            attributes: ['user_id', 'username'],
            include: [
                {
                    model: Joke,
                    attributes: [],
                    required: false
                }
            ],
            group: ['User.user_id', 'User.username'],
            order: literal('COUNT("Jokes"."joke_id") DESC'),
            limit: 10,
            subQuery: false
        });

        // Get detailed stats for top users
        const userStats = await Promise.all(users.map(async (user) => {
            const [jokeCount, likesReceived] = await Promise.all([
                Joke.count({ where: { user_id: user.user_id } }),
                Like.count({
                    include: [{
                        model: Joke,
                        where: { user_id: user.user_id },
                        required: true
                    }]
                })
            ]);

            return {
                id: user.user_id,
                username: user.username,
                jokes: jokeCount,
                likesReceived: likesReceived
            };
        }));

        // Filter out users with no activity
        const activeUserStats = userStats
            .filter(user => user.jokes > 0 || user.likesReceived > 0)
            .sort((a, b) => b.jokes - a.jokes || b.likesReceived - a.likesReceived)
            .slice(0, 5);

        console.log('Top contributors found:', activeUserStats.length);

        res.json({
            success: true,
            data: {
                totalJokes,
                totalLikes,
                totalComments,
                topJokes,
                topContributors: activeUserStats
            }
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};

// Get joke categories
export const getCategories = async (req, res) => {
    try {
        console.log('Fetching categories...');
        
        const categories = await Joke.findAll({
            attributes: [
                [fn('DISTINCT', col('category')), 'category']
            ],
            where: {
                category: {
                    [Op.not]: null,
                    [Op.ne]: ''
                }
            }
        });

        console.log('Raw categories:', categories);

        const categoryList = categories
            .map(c => {
                const category = c.getDataValue('category');
                console.log('Processing category:', category);
                return category;
            })
            .filter(category => category && category.trim() !== '')
            .sort();

        console.log('Processed categories:', categoryList);

        res.json({
            success: true,
            data: categoryList || [],
            count: categoryList.length
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
};


