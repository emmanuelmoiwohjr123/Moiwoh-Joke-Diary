import express from 'express';
import { isAuthenticated, isOwnerOrAdmin } from '../middleware/auth.js';
import { getComments, addComment, deleteComment } from '../controllers/commentController.js';

const router = express.Router();

// Get comments for a joke
router.get('/jokes/:jokeId/comments', getComments);

// Add a comment to a joke (requires authentication)
router.post('/jokes/:jokeId/comments', isAuthenticated, addComment);

// Delete a comment (requires authentication and ownership/admin)
router.delete('/comments/:commentId', isAuthenticated, isOwnerOrAdmin, deleteComment);

export default router;
