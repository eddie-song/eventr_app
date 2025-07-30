import { supabase } from '../lib/supabaseClient';

export const userRelationshipService = {
  // ========================================
  // FOLLOW/UNFOLLOW FUNCTIONALITY
  // ========================================

  /**
   * Follow a user
   * @param {string} userToFollowId - UUID of the user to follow
   * @returns {Promise<Object>} - Result object with success status
   */
  async followUser(userToFollowId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if already following
      const { data: existingFollow } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userToFollowId)
        .eq('relationship_type', 'follow')
        .single();

      if (existingFollow) {
        return { success: false, message: 'Already following this user' };
      }

      // Create follow relationship
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userToFollowId,
          relationship_type: 'follow',
          status: 'active'
        });

      if (error) throw error;

      return { success: true, message: 'Successfully followed user' };
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   * @param {string} userToUnfollowId - UUID of the user to unfollow
   * @returns {Promise<Object>} - Result object with success status
   */
  async unfollowUser(userToUnfollowId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userToUnfollowId)
        .eq('relationship_type', 'follow');

      if (error) throw error;

      return { success: true, message: 'Successfully unfollowed user' };
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  },

  // ========================================
  // FRIEND REQUEST FUNCTIONALITY
  // ========================================

  /**
   * Send a friend request
   * @param {string} userToRequestId - UUID of the user to send friend request to
   * @returns {Promise<Object>} - Result object with success status
   */
  async sendFriendRequest(userToRequestId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if friend request already exists
      const { data: existingRequest } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userToRequestId)
        .eq('relationship_type', 'friend_request')
        .single();

      if (existingRequest) {
        return { success: false, message: 'Friend request already sent' };
      }

      // Create friend request
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_id: user.id,
          following_id: userToRequestId,
          relationship_type: 'friend_request',
          status: 'pending'
        });

      if (error) throw error;

      return { success: true, message: 'Friend request sent successfully' };
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  },

  /**
   * Accept a friend request
   * @param {string} requesterId - UUID of the user who sent the request
   * @returns {Promise<Object>} - Result object with success status
   */
  async acceptFriendRequest(requesterId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update the friend request status to accepted
      const { error: updateError } = await supabase
        .from('user_follows')
        .update({ status: 'accepted' })
        .eq('follower_id', requesterId)
        .eq('following_id', user.id)
        .eq('relationship_type', 'friend_request');

      if (updateError) throw updateError;

      // Create mutual follow relationships with proper error handling
      let firstFollowCreated = false;
      let firstFollowId = null;

      try {
        // Create first follow relationship
        const { data: followData1, error: followError1 } = await supabase
          .from('user_follows')
          .insert({
            follower_id: requesterId,
            following_id: user.id,
            relationship_type: 'follow',
            status: 'active'
          })
          .select('uuid')
          .single();

        if (followError1) {
          throw new Error(`Failed to create first follow relationship: ${followError1.message}`);
        }

        firstFollowCreated = true;
        firstFollowId = followData1.uuid;

        // Create second follow relationship
        const { error: followError2 } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: requesterId,
            relationship_type: 'follow',
            status: 'active'
          });

        if (followError2) {
          // Clean up the first follow relationship if second fails
          await supabase
            .from('user_follows')
            .delete()
            .eq('uuid', firstFollowId);

          throw new Error(`Failed to create second follow relationship: ${followError2.message}`);
        }
      } catch (error) {
        // If we created the first follow but second failed, clean up
        if (firstFollowCreated && firstFollowId) {
          try {
            await supabase
              .from('user_follows')
              .delete()
              .eq('uuid', firstFollowId);
          } catch (cleanupError) {
            console.error('Failed to cleanup first follow relationship:', cleanupError);
          }
        }

        // Reject the friend request to maintain consistency
        try {
          await this.rejectFriendRequest(requesterId);
        } catch (rejectError) {
          console.error('Failed to reject friend request during cleanup:', rejectError);
        }

        throw new Error(`Failed to create mutual follow relationship: ${error.message}`);
      }

      return { success: true, message: 'Friend request accepted' };
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  },

  /**
   * Reject a friend request
   * @param {string} requesterId - UUID of the user who sent the request
   * @returns {Promise<Object>} - Result object with success status
   */
  async rejectFriendRequest(requesterId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .update({ status: 'rejected' })
        .eq('follower_id', requesterId)
        .eq('following_id', user.id)
        .eq('relationship_type', 'friend_request');

      if (error) throw error;

      return { success: true, message: 'Friend request rejected' };
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  },

  /**
   * Cancel a sent friend request
   * @param {string} requestedUserId - UUID of the user who received the request
   * @returns {Promise<Object>} - Result object with success status
   */
  async cancelFriendRequest(requestedUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', requestedUserId)
        .eq('relationship_type', 'friend_request');

      if (error) throw error;

      return { success: true, message: 'Friend request cancelled' };
    } catch (error) {
      console.error('Error cancelling friend request:', error);
      throw error;
    }
  },

  // ========================================
  // GET RELATIONSHIP DATA
  // ========================================

  /**
   * Get user's followers
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} - Array of follower profiles
   */
  async getFollowers(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_followers', { user_uuid: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting followers:', error);
      throw error;
    }
  },

  /**
   * Get users that the user is following
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} - Array of following profiles
   */
  async getFollowing(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_following_users', { user_uuid: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting following:', error);
      throw error;
    }
  },

  /**
   * Get user's mutual friends
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} - Array of mutual friend profiles
   */
  async getMutualFriends(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_mutual_friends', { user_uuid: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting mutual friends:', error);
      throw error;
    }
  },

  /**
   * Get received friend requests
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} - Array of received friend requests
   */
  async getReceivedFriendRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          profiles:follower_id (
            uuid,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('following_id', userId)
        .eq('relationship_type', 'friend_request')
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting received friend requests:', error);
      throw error;
    }
  },

  /**
   * Get sent friend requests
   * @param {string} userId - UUID of the user
   * @returns {Promise<Array>} - Array of sent friend requests
   */
  async getSentFriendRequests(userId) {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select(`
          *,
          profiles:following_id (
            uuid,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('follower_id', userId)
        .eq('relationship_type', 'friend_request')
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting sent friend requests:', error);
      throw error;
    }
  },

  // ========================================
  // RELATIONSHIP STATUS CHECKS
  // ========================================

  /**
   * Check if current user follows another user
   * @param {string} targetUserId - UUID of the user to check
   * @returns {Promise<boolean>} - True if following, false otherwise
   */
  async isFollowing(targetUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .rpc('is_following', {
          follower_uuid: user.id,
          following_uuid: targetUserId
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  },

  /**
   * Check if two users are mutual friends
   * @param {string} user1Id - UUID of first user
   * @param {string} user2Id - UUID of second user
   * @returns {Promise<boolean>} - True if mutual friends, false otherwise
   */
  async areMutualFriends(user1Id, user2Id) {
    try {
      const { data, error } = await supabase
        .rpc('are_friends', {
          user1_uuid: user1Id,
          user2_uuid: user2Id
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking mutual friends status:', error);
      return false;
    }
  },

  // ========================================
  // COUNT FUNCTIONS
  // ========================================

  /**
   * Get follower count for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<number>} - Number of followers
   */
  async getFollowerCount(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_follow_counts', { user_uuid: userId });

      if (error) throw error;
      return data?.follower_count || 0;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  },

  /**
   * Get following count for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<number>} - Number of users being followed
   */
  async getFollowingCount(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_follow_counts', { user_uuid: userId });

      if (error) throw error;
      return data?.following_count || 0;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  },

  /**
   * Get mutual friends count for a user
   * @param {string} userId - UUID of the user
   * @returns {Promise<number>} - Number of mutual friends
   */
  async getMutualFriendsCount(userId) {
    try {
      const { data, error } = await supabase
        .rpc('get_follow_counts', { user_uuid: userId });

      if (error) throw error;
      return data?.mutual_friends_count || 0;
    } catch (error) {
      console.error('Error getting mutual friends count:', error);
      return 0;
    }
  },

  // ========================================
  // BLOCK FUNCTIONALITY
  // ========================================

  /**
   * Block a user
   * @param {string} userToBlockId - UUID of the user to block
   * @returns {Promise<Object>} - Result object with success status
   */
  async blockUser(userToBlockId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Prevent users from blocking themselves
      if (user.id === userToBlockId) {
        return { success: false, message: 'Cannot block yourself' };
      }

      // Check if already blocked
      const { data: existingBlock } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', userToBlockId)
        .eq('relationship_type', 'blocked')
        .single();

      if (existingBlock) {
        return { success: false, message: 'User is already blocked' };
      }

      // Use a database transaction to ensure atomicity
      const { data, error } = await supabase.rpc('block_user_transaction', {
        blocker_uuid: user.id,
        blocked_uuid: userToBlockId
      });

      if (error) throw error;

      return { success: true, message: 'User blocked successfully' };
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  },

  /**
   * Unblock a user
   * @param {string} userToUnblockId - UUID of the user to unblock
   * @returns {Promise<Object>} - Result object with success status
   */
  async unblockUser(userToUnblockId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userToUnblockId)
        .eq('relationship_type', 'blocked');

      if (error) throw error;

      return { success: true, message: 'User unblocked successfully' };
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }
}; 