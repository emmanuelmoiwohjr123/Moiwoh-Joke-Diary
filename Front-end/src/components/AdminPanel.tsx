import { useState, useEffect } from 'react';
import axios from 'axios';
import { RoleBasedRender } from './RoleBasedRender';

interface User {
  user_id: string;
  username: string;
  email: string;
  is_active: boolean;
  is_admin: boolean;
  registration_date: string;
}

export const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users', {
        withCredentials: true
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      await axios.put(`/api/admin/users/${userId}`, {
        is_active: !isActive
      }, {
        withCredentials: true
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    try {
      await axios.put(`/api/admin/users/${userId}/role`, {
        is_admin: !isAdmin
      }, {
        withCredentials: true
      });
      fetchUsers(); // Refresh user list
    } catch (error) {
      console.error('Error toggling admin status:', error);
    }
  };

  return (
    <RoleBasedRender adminOnly>
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">User Management</h2>
        {loading ? (
          <div>Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2">Username</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Registration Date</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.user_id} className="border-b">
                    <td className="px-4 py-2">{user.username}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">
                      {new Date(user.registration_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">
                      <span className={user.is_active ? 'text-green-600' : 'text-red-600'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {user.is_admin ? 'Admin' : 'User'}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserStatus(user.user_id, user.is_active)}
                          className={`px-3 py-1 rounded ${
                            user.is_active
                              ? 'bg-red-100 text-red-600 hover:bg-red-200'
                              : 'bg-green-100 text-green-600 hover:bg-green-200'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => toggleAdminStatus(user.user_id, user.is_admin)}
                          className="px-3 py-1 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                        >
                          {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </RoleBasedRender>
  );
};
