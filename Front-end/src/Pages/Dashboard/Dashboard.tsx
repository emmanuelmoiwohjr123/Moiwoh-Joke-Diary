import React, { useState } from 'react';
import { FiMenu, FiX, FiPlus, FiSearch, FiUser, FiLogOut, FiStar, FiClock, FiTrendingUp } from 'react-icons/fi';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recent');

  // Sample data
  const jokes = [
    { id: 1, title: "Why don't scientists trust atoms?", content: "Because they make up everything!", date: "2023-05-15", likes: 42, category: "Science" },
    { id: 2, title: "Parallel lines have so much in common...", content: "It's a shame they'll never meet.", date: "2023-05-10", likes: 36, category: "Math" },
    { id: 3, title: "Why don't skeletons fight each other?", content: "They don't have the guts.", date: "2023-05-05", likes: 28, category: "Halloween" },
    { id: 4, title: "What do you call fake spaghetti?", content: "An impasta!", date: "2023-04-28", likes: 31, category: "Food" },
    { id: 5, title: "How do you organize a space party?", content: "You planet!", date: "2023-04-20", likes: 45, category: "Space" },
  ];

  const stats = {
    totalJokes: 127,
    totalLikes: 2843,
    topCategory: "Puns",
    jokesThisMonth: 15
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
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
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg bg-indigo-600">
                  <FiUser className="mr-3" />
                  My Jokes
                </button>
              </li>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  <FiStar className="mr-3" />
                  Favorites
                </button>
              </li>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  <FiTrendingUp className="mr-3" />
                  Popular
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs uppercase tracking-wider text-indigo-300 mb-4">Categories</h2>
            <ul>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  All Jokes
                </button>
              </li>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  Puns
                </button>
              </li>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  One-liners
                </button>
              </li>
              <li className="mb-2">
                <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
                  Knock-knock
                </button>
              </li>
            </ul>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-600">
          <button className="flex items-center w-full p-2 rounded-lg hover:bg-indigo-600 transition-colors">
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
                />
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back, Joker!</h2>
            <p className="text-gray-600">Here's your daily dose of laughter.</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Total Jokes</div>
              <div className="text-2xl font-bold">{stats.totalJokes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Total Likes</div>
              <div className="text-2xl font-bold">{stats.totalLikes}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">Top Category</div>
              <div className="text-2xl font-bold">{stats.topCategory}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-gray-500 text-sm">This Month</div>
              <div className="text-2xl font-bold">{stats.jokesThisMonth}</div>
            </div>
          </div>

          {/* Jokes section */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button 
                  onClick={() => setActiveTab('recent')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'recent' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Recent
                </button>
                <button 
                  onClick={() => setActiveTab('popular')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'popular' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Most Popular
                </button>
                <button 
                  onClick={() => setActiveTab('mine')}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === 'mine' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  My Jokes
                </button>
              </nav>
            </div>

            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Your Jokes</h3>
                <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <FiPlus className="mr-2" />
                  Add New Joke
                </button>
              </div>

              <div className="space-y-4">
                {jokes.map(joke => (
                  <div key={joke.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{joke.title}</h4>
                        <p className="text-gray-600 mt-1">{joke.content}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {joke.category}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3 text-sm text-gray-500">
                      <span>{joke.date}</span>
                      <div className="flex items-center">
                        <FiStar className="mr-1" />
                        <span>{joke.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;