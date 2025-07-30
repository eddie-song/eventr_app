import React, { useState, useEffect } from 'react';
import { followService } from '../../services/followService';
import { supabase } from '../../lib/supabaseClient';

// Interface for the current authenticated user from Supabase Auth
interface CurrentUser {
  id: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
  aud?: string;
  role?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: Record<string, any>;
  identities?: Array<{
    id: string;
    user_id: string;
    identity_data?: { [key: string]: any };
    provider: string;
    last_sign_in_at?: string;
    created_at?: string;
    updated_at?: string;
  }>;
}

// Interface for profile users from the profiles table
interface ProfileUser {
  uuid: string;
  username: string;
  display_name: string | null;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

const FollowTest: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [testUsers, setTestUsers] = useState<ProfileUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const initializeTest = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Get some test users (excluding current user)
        const { data: users } = await supabase
          .from('profiles')
          .select('uuid, username, display_name')
          .neq('uuid', user?.id)
          .limit(5);

        setTestUsers(users || []);
      } catch (error) {
        console.error('Error initializing test:', error);
        setMessage('Error loading test data');
      } finally {
        setLoading(false);
      }
    };

    initializeTest();
  }, []);

  const testFollowUser = async (userId: string) => {
    try {
      setMessage('Following user...');
      await followService.followUser(userId);
      setMessage('Successfully followed user!');
    } catch (error) {
      console.error('Follow test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error: ${errorMessage}`);
    }
  };

  const testUnfollowUser = async (userId: string) => {
    try {
      setMessage('Unfollowing user...');
      await followService.unfollowUser(userId);
      setMessage('Successfully unfollowed user!');
    } catch (error) {
      console.error('Unfollow test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error: ${errorMessage}`);
    }
  };

  const testIsFollowing = async (userId: string) => {
    try {
      setMessage('Checking follow status...');
      const isFollowing = await followService.isFollowing(userId);
      setMessage(`Follow status: ${isFollowing ? 'Following' : 'Not following'}`);
    } catch (error) {
      console.error('Follow status test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error: ${errorMessage}`);
    }
  };

  const testGetFollowCounts = async () => {
    try {
      setMessage('Getting follow counts...');
      const counts = await followService.getFollowCounts();
      setMessage(`Following: ${counts.following_count}, Followers: ${counts.followers_count}, Friends: ${counts.friends_count}`);
    } catch (error) {
      console.error('Follow counts test error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setMessage(`Error: ${errorMessage}`);
    }
  };

  if (loading) {
    return <div className="p-4">Loading test data...</div>;
  }

  if (!currentUser) {
    return <div className="p-4 text-red-500">No authenticated user found</div>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Follow Service Test</h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p><strong>Current User:</strong> {currentUser.email}</p>
        <p><strong>User ID:</strong> {currentUser.id}</p>
      </div>

      <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
        <p className="font-semibold">Message: {message}</p>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Actions</h3>
        <div className="flex gap-2 mb-4">
          <button 
            onClick={testGetFollowCounts}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Get My Follow Counts
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Test Users</h3>
        {testUsers.map(user => (
          <div key={user.uuid} className="border p-4 mb-2 rounded">
            <p><strong>{user.display_name || user.username}</strong> (@{user.username})</p>
            <p className="text-sm text-gray-600">ID: {user.uuid}</p>
            <div className="flex gap-2 mt-2">
              <button 
                onClick={() => testFollowUser(user.uuid)}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Follow
              </button>
              <button 
                onClick={() => testUnfollowUser(user.uuid)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Unfollow
              </button>
              <button 
                onClick={() => testIsFollowing(user.uuid)}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Check Status
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="text-sm text-gray-600">
        <p>This test component helps verify that the follow service is working correctly.</p>
        <p>Check the console for detailed error messages.</p>
      </div>
    </div>
  );
};

export default FollowTest; 