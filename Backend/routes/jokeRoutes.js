import express from 'express';
import { isAuthenticated, isOwnerOrAdmin } from '../middleware/auth.js';

const router = express.Router();

import { 
    getJokes,
    getJokeById,
    createJoke,
    updateJoke,
    deleteJoke,
    likeJoke,
    unlikeJoke,
    getCategories,
    getStats
} from '../controllers/jokeController.js';

// Public routes
router.get('/jokes/categories', getCategories);
router.get('/jokes/stats', isAuthenticated, getStats);
router.get('/jokes/:jokeId', getJokeById);
router.get('/jokes', getJokes);

// Protected routes that require authentication
router.post('/jokes', isAuthenticated, createJoke);
router.post('/jokes/:jokeId/like', isAuthenticated, likeJoke);
router.delete('/jokes/:jokeId/like', isAuthenticated, unlikeJoke);

// Protected routes that require ownership or admin status
router.put('/jokes/:jokeId', isAuthenticated, isOwnerOrAdmin, updateJoke);
router.delete('/jokes/:jokeId', isAuthenticated, isOwnerOrAdmin, deleteJoke);

export default router;
