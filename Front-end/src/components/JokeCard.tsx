import { useState, useEffect } from 'react';
import { CommentSection } from './CommentSection';
import { useNavigate } from 'react-router-dom';
import { RoleBasedRender } from './RoleBasedRender';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface JokeCardProps {
  joke: {
    joke_id: string;
    user_id: string;
    title: string;
    content: string;
    created_at: string;
    username: string;
    likes_count: number;
  };
  onDelete?: () => void;
}

export const JokeCard = ({ joke, onDelete }: JokeCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [likeCount, setLikeCount] = useState(joke.likes_count);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    // Check if the current user has liked this joke
    const checkLikeStatus = async () => {
      try {
        const response = await axios.get(`/api/jokes/${joke.joke_id}/like`, {
          withCredentials: true
        });
        setIsLiked(response.data.hasLiked);
      } catch (error) {
        console.error('Error checking like status:', error);
      }
    };

    if (user) {
      checkLikeStatus();
    }
  }, [joke.joke_id, user]);

  const handleEdit = () => {
    navigate(`/jokes/${joke.joke_id}/edit`);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/jokes/${joke.joke_id}`, {
        withCredentials: true
      });
      onDelete?.();
    } catch (error) {
      console.error('Error deleting joke:', error);
    }
  };

  const handleLike = async () => {
    try {
      if (isLiked) {
        await axios.delete(`/api/jokes/${joke.joke_id}/like`, {
          withCredentials: true
        });
        setLikeCount(prev => prev - 1);
      } else {
        await axios.post(`/api/jokes/${joke.joke_id}/like`, {}, {
          withCredentials: true
        });
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold">{joke.title}</h3>
          <p className="text-gray-600 text-sm">By {joke.username}</p>
        </div>
        <div className="flex space-x-2">
          {/* Edit button - only visible to joke owner */}
          <RoleBasedRender ownerOnly ownerId={joke.user_id}>
            <button
              onClick={handleEdit}
              className="text-blue-600 hover:text-blue-800"
            >
              Edit
            </button>
          </RoleBasedRender>

          {/* Delete button - visible to joke owner and admins */}
          <RoleBasedRender ownerOnly ownerId={joke.user_id}>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </RoleBasedRender>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{joke.content}</p>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-1 ${
              isLiked ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <span>{likeCount}</span>
            <span>❤️</span>
          </button>
        </div>
        <span>{new Date(joke.created_at).toLocaleDateString()}</span>
      </div>

      {/* Comment Section */}
      <CommentSection jokeId={joke.joke_id} />
    </div>
  );
};
