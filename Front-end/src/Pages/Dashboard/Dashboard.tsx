import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiMenu, 
  FiX, 
  FiPlus, 
  FiSearch, 
  FiUser, 
  FiLogOut, 

  FiClock, 
  FiTrendingUp,
  FiMessageSquare,
  FiHeart,
  FiEdit2,
  FiTrash2
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Joke {
  joke_id: string;
  title: string;
  content: string;
  created_at: string;
  likes_count: number;
  category: string;
  user_id: string;
  username: string;
  is_liked?: boolean;
  comments_count?: number;
}

interface Comment {
  comment_id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
}

interface Category {
  id: string;
  name: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  interface Stats {
    totalJokes: number;
    totalLikes: number;
    totalComments: number;
    topJokes: Array<{
      id: string;
      title: string;
      content: string;
      author: string;
      likes: number;
    }>;
    topContributors: Array<{
      id: string;
      username: string;
      jokes: number;
      likesReceived: number;
    }>;
  }

  const [stats, setStats] = useState<Stats>({
    totalJokes: 0,
    totalLikes: 0,
    totalComments: 0,
    topJokes: [],
    topContributors: []
  });
  const [showCommentSection, setShowCommentSection] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [showNewJokeModal, setShowNewJokeModal] = useState(false);
  const [newJoke, setNewJoke] = useState({
    title: '',
    content: '',
    category: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch jokes based on active tab and filters
  const fetchJokes = async () => {
    try {
      setLoading(true);
      let url = 'http://localhost:5000/api/jokes';
      const params: any = {
        page: 1,
        limit: 10
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      if (activeTab === 'mine' && user) {
        params.userId = user.user_id;
      } else if (activeTab === 'popular') {
        params.sort = 'likes';
      } else if (activeTab === 'recent') {
        params.sort = 'recent';
      }

      const response = await axios.get(url, { 
        params,
        withCredentials: true 
      });

      if (response.data.success) {
        setJokes(response.data.data);
      }
    } catch (err) {
      setError('Failed to fetch jokes');
      console.error('Error fetching jokes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jokes/stats', {
        withCredentials: true
      });
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/jokes/categories', {
        withCredentials: true
      });
      if (response.data.success) {
        setCategories(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle like/unlike joke
  const handleLike = async (jokeId: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/jokes/${jokeId}/like`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        setJokes(jokes.map(joke => {
          if (joke.joke_id === jokeId) {
            return {
              ...joke,
              is_liked: !joke.is_liked,
              likes_count: joke.is_liked ? joke.likes_count - 1 : joke.likes_count + 1
            };
          }
          return joke;
        }));
      }
    } catch (err) {
      toast.error('Failed to update like status');
      console.error('Error liking joke:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (jokeId: string, content: string) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/jokes/${jokeId}/comments`,
        { content },
        { withCredentials: true }
      );

      if (response.data.success) {
        const newComment = response.data.data;
        setComments(prev => ({
          ...prev,
          [jokeId]: [...(prev[jokeId] || []), newComment]
        }));
        
        // Update joke's comment count
        setJokes(jokes.map(joke => {
          if (joke.joke_id === jokeId) {
            return {
              ...joke,
              comments_count: (joke.comments_count || 0) + 1
            };
          }
          return joke;
        }));
        
        toast.success('Comment added successfully');
      }
    } catch (err) {
      toast.error('Failed to add comment');
      console.error('Error submitting comment:', err);
    }
  };

  // Fetch comments for a joke
  const fetchComments = async (jokeId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/jokes/${jokeId}/comments`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setComments(prev => ({
          ...prev,
          [jokeId]: response.data.data
        }));
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Toggle comment section visibility
  const toggleComments = (jokeId: string) => {
    if (showCommentSection === jokeId) {
      setShowCommentSection(null);
    } else {
      setShowCommentSection(jokeId);
      if (!comments[jokeId]) {
        fetchComments(jokeId);
      }
    }
  };

  // Handle joke deletion
  const handleDeleteJoke = async (jokeId: string) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/jokes/${jokeId}`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setJokes(jokes.filter(joke => joke.joke_id !== jokeId));
        toast.success('Joke deleted successfully');
        fetchStats(); // Refresh stats
      }
    } catch (err) {
      toast.error('Failed to delete joke');
      console.error('Error deleting joke:', err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      toast.success('Logged out successfully');
    } catch (err) {
      toast.error('Logout failed');
      console.error('Logout error:', err);
    }
  };

  // Handle new joke creation
  const handleNewJoke = () => {
    setShowNewJokeModal(true);
  };

  // Handle new joke submission
  const handleSubmitNewJoke = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        'http://localhost:5000/api/jokes',
        newJoke,
        { withCredentials: true }
      );

      if (response.data.success) {
        setShowNewJokeModal(false);
        setNewJoke({ title: '', content: '', category: '' });
        toast.success('Joke created successfully!');
        fetchJokes();
        fetchStats();
      }
    } catch (err) {
      toast.error('Failed to create joke');
      console.error('Error creating joke:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle joke editing
  const handleEditJoke = (jokeId: string) => {
    navigate(`/jokes/edit/${jokeId}`);
  };

  // Effect to fetch initial data
  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  // Effect to fetch jokes when filters change
  useEffect(() => {
    fetchJokes();
  }, [activeTab, searchQuery, selectedCategory]);

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* New Joke Modal */}
      {showNewJokeModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Joke</h3>
              <button
                onClick={() => setShowNewJokeModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitNewJoke}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    required
                    value={newJoke.title}
                    onChange={(e) => setNewJoke({ ...newJoke, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    required
                    value={newJoke.content}
                    onChange={(e) => setNewJoke({ ...newJoke, content: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={newJoke.category}
                    onChange={(e) => setNewJoke({ ...newJoke, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowNewJokeModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Joke'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black opacity-50 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-indigo-700 text-white transition-transform duration-300 ease-in-out transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-600">
          <h1 className="text-2xl font-bold">Joke Diary</h1>
          <button 
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4">
          <div className="mb-8">
            <h2 className="text-xs uppercase tracking-wider text-indigo-300 mb-4">Main</h2>
            <ul>
              <li key="recent" className="mb-2">
                <button 
                  onClick={() => setActiveTab('recent')}
                  className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'recent' ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors`}
                >
                  <FiClock className="mr-3" />
                  Recent
                </button>
              </li>
              <li key="popular" className="mb-2">
                <button 
                  onClick={() => setActiveTab('popular')}
                  className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'popular' ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors`}
                >
                  <FiTrendingUp className="mr-3" />
                  Popular
                </button>
              </li>
              <li key="mine" className="mb-2">
                <button 
                  onClick={() => setActiveTab('mine')}
                  className={`flex items-center w-full p-2 rounded-lg ${activeTab === 'mine' ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors`}
                >
                  <FiUser className="mr-3" />
                  My Jokes
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-indigo-300 mb-4">Categories</h2>
            <ul>
              <li key="all" className="mb-2">
                <button 
                  onClick={() => setSelectedCategory('all')}
                  className={`flex items-center w-full p-2 rounded-lg ${selectedCategory === 'all' ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors`}
                >
                  All Jokes
                </button>
              </li>
              {categories.map(category => (
                <li key={category.id} className="mb-2">
                  <button 
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center w-full p-2 rounded-lg ${selectedCategory === category.id ? 'bg-indigo-600' : 'hover:bg-indigo-600'} transition-colors`}
                  >
                    {category.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600">
          <button 
            onClick={handleLogout}
            className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <FiLogOut className="mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button 
                className="mr-4 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <FiMenu className="w-6 h-6" />
              </button>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search jokes..." 
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, {user?.username || 'User'}!</h2>
            <p className="text-gray-600">Here's your daily dose of laughter.</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Total Jokes</div>
              <div className="text-2xl font-bold">{stats.totalJokes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Total Likes</div>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Total Comments</div>
              <div className="text-2xl font-bold">{stats.totalComments}</div>
            </div>
          </div>

          {/* Top Jokes */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">Top Jokes</h3>
            <div className="space-y-4">
              {stats.topJokes.map(joke => (
                <div key={joke.id} className="border-b last:border-b-0 pb-4 last:pb-0">
                  <h4 className="font-medium">{joke.title}</h4>
                  <p className="text-gray-600 mt-1">{joke.content}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span className="mr-4">By {joke.author}</span>
                    <span>{joke.likes} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-medium mb-4">Top Contributors</h3>
            <div className="space-y-4">
              {stats.topContributors.map(user => (
                <div key={user.id} className="flex items-center justify-between border-b last:border-b-0 pb-4 last:pb-0">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{user.username}</div>
                      <div className="text-sm text-gray-500">{user.jokes} jokes</div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">{user.likesReceived} likes received</div>
                </div>
              ))}
            </div>
          </div>

          {/* Jokes section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200">
              <nav>
                {[{ id: 'recent', label: 'Recent' }, { id: 'popular', label: 'Most Popular' }, { id: 'mine', label: 'My Jokes' }].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 text-sm font-medium ${activeTab === tab.id ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {activeTab === 'recent' && 'Recent Jokes'}
                  {activeTab === 'popular' && 'Most Popular Jokes'}
                  {activeTab === 'mine' && 'My Jokes'}
                </h3>
                <button 
                  onClick={handleNewJoke}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus className="mr-2" />
                  Add New Joke
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
              ) : Array.isArray(jokes) && jokes.length === 0 ? (
                <div className="text-gray-500 text-center p-4">
                  No jokes found. {activeTab === 'mine' && 'Create your first joke!'}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.isArray(jokes) && jokes.map(joke => (
                    <div key={joke.joke_id} className="border rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-lg">{joke.title}</h4>
                            <p className="text-gray-600 mt-1">{joke.content}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <span className="mr-4">By {joke.username}</span>
                              <span>{new Date(joke.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {joke.category && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {joke.category}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={() => handleLike(joke.joke_id)}
                              className={`flex items-center space-x-1 ${joke.is_liked ? 'text-red-500' : 'text-gray-500'}`}
                            >
                              <FiHeart className={joke.is_liked ? 'fill-current' : ''} />
                              <span>{joke.likes_count || 0}</span>
                            </button>
                            <button 
                              onClick={() => toggleComments(joke.joke_id)}
                              className="flex items-center space-x-1 text-gray-500"
                            >
                              <FiMessageSquare />
                              <span>{joke.comments_count || 0}</span>
                            </button>
                          </div>
                          
                          {(user?.user_id === joke.user_id || user?.is_admin) && (
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleEditJoke(joke.joke_id)}
                                className="text-indigo-600 hover:text-indigo-800"
                              >
                                <FiEdit2 />
                              </button>
                              <button 
                                onClick={() => handleDeleteJoke(joke.joke_id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Comment section */}
                      {showCommentSection === joke.joke_id && (
                        <div className="border-t bg-gray-50 p-4">
                          <div className="space-y-4">
                            {comments[joke.joke_id]?.map((comment) => (
                              <div key={comment.comment_id} className="flex items-start space-x-3">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{comment.username}</span>
                                    <span className="text-sm text-gray-500">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                            
                            {/* Comment form */}
                            <form onSubmit={(e) => {
                              e.preventDefault();
                              const form = e.target as HTMLFormElement;
                              const input = form.elements.namedItem('comment') as HTMLTextAreaElement;
                              handleCommentSubmit(joke.joke_id, input.value);
                              form.reset();
                            }}>
                              <textarea
                                name="comment"
                                rows={2}
                                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Add a comment..."
                                required
                              />
                              <div className="mt-2 flex justify-end">
                                <button
                                  type="submit"
                                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                >
                                  Post
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;