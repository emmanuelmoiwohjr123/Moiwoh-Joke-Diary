import { Comment } from '../models/comment.js';
import { User } from '../models/user.js';

// Get comments for a joke
export const getComments = async (req, res) => {
    try {
        const { jokeId } = req.params;
        const comments = await Comment.findAll({
            where: { joke_id: jokeId },
            include: [{
                model: User,
                attributes: ['username']
            }],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            data: comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments',
            error: error.message
        });
    }
};

// Add a comment to a joke
export const addComment = async (req, res) => {
    try {
        const { jokeId } = req.params;
        const { content } = req.body;
        const userId = req.user.user_id;

        const comment = await Comment.create({
            content,
            user_id: userId,
            joke_id: jokeId
        });

        const commentWithUser = await Comment.findOne({
            where: { comment_id: comment.comment_id },
            include: [{
                model: User,
                attributes: ['username']
            }]
        });

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: commentWithUser
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment',
            error: error.message
        });
    }
};

// Delete a comment
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user.user_id;

        const comment = await Comment.findByPk(commentId);
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: 'Comment not found'
            });
        }

        // Check if user owns the comment or is admin
        if (comment.user_id !== userId && !req.user.is_admin) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this comment'
            });
        }

        await comment.destroy();
        res.json({
            success: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete comment',
            error: error.message
        });
    }
};
