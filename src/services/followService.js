import { supabase } from '../lib/supabaseClient';

class FollowService {
  // Follow a user
  async followUser(userToFollowId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userToFollowId
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('Already following this user');
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // Unfollow a user
  async unfollowUser(userToUnfollowId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userToUnfollowId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Get users that the current user is following
  async getFollowingUsers() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('get_following_users', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting following users:', error);
      throw error;
    }
  }

  // Get users that are following the current user
  async getFollowers() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('get_followers', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  }

  // Get mutual friends (users that both follow each other)
  async getMutualFriends() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('get_mutual_friends', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting mutual friends:', error);
      throw error;
    }
  }

  // Check if current user is following another user
  async isFollowing(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('is_following', { 
          follower_uuid: user.id, 
          following_uuid: userId 
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking follow status:', error);
      throw error;
    }
  }

  // Check if two users are friends (mutual follows)
  async areFriends(userId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('are_friends', { 
          user1_uuid: user.id, 
          user2_uuid: userId 
        });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error checking friendship status:', error);
      throw error;
    }
  }

  // Get follow counts for current user
  async getFollowCounts() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .rpc('get_follow_counts', { user_uuid: user.id });

      if (error) {
        throw error;
      }

      return data?.[0] || { following_count: 0, followers_count: 0, friends_count: 0 };
    } catch (error) {
      console.error('Error getting follow counts:', error);
      throw error;
    }
  }

  // Get follow counts for a specific user
  async getUserFollowCounts(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_follow_counts', { user_uuid: userId });

      if (error) {
        throw error;
      }

      return data?.[0] || { following_count: 0, followers_count: 0, friends_count: 0 };
    } catch (error) {
      console.error('Error getting user follow counts:', error);
      throw error;
    }
  }

  // Get suggested users to follow (users not currently following)
  async getSuggestedUsers(limit = 10) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('No authenticated user found');
      }

      // Get users that the current user is not following
      const { data, error } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url, created_at')
        .neq('uuid', user.id) // Exclude self
        .not('uuid', 'in', `(
          SELECT following_id 
          FROM user_follows 
          WHERE follower_id = '${user.id}'
        )`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error getting suggested users:', error);
      throw error;
    }
  }
}

export const followService = new FollowService(); 