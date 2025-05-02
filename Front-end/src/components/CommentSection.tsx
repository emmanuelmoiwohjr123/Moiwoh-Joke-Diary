import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Comment {
  comment_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
}

interface CommentSectionProps {
  jokeId: string;
}

export const CommentSection = ({ jokeId }: CommentSectionProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [jokeId]);

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/jokes/${jokeId}/comments`, {
        withCredentials: true
      });
      setComments(response.data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await axios.post(`/api/jokes/${jokeId}/comments`, {
        content: newComment
      }, {
        withCredentials: true
      });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await axios.delete(`/api/jokes/${jokeId}/comments/${commentId}`, {
        withCredentials: true
      });
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  if (loading) {
    return <div className="mt-4">Loading comments...</div>;
  }

  return (
    <div className="mt-4">
      <h4 className="text-lg font-semibold mb-4">Comments ({comments.length})</h4>
      
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Post
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.comment_id} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium">{comment.username}</span>
                <span className="text-gray-500 text-sm ml-2">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              {(user?.user_id === comment.user_id || user?.is_admin) && (
                <button
                  onClick={() => handleDelete(comment.comment_id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-2 text-gray-700">{comment.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
