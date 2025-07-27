import { supabase } from '../lib/supabaseClient';

export const messagingService = {
  // ========================================
  // CONVERSATION MANAGEMENT
  // ========================================

  // Get all conversations for current user
  async getUserConversations() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          *,
          conversation_participants!inner (
            user_id,
            profiles!conversation_participants_user_id_fkey (
              uuid,
              username,
              display_name,
              avatar_url
            )
          ),
          messages (
            uuid,
            content,
            created_at,
            sender_id
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform conversations to include participant info and last message
      return conversations.map(conversation => {
        const participants = conversation.conversation_participants
          .map(cp => cp.profiles)
          .filter(p => p.uuid !== user.id); // Exclude current user

        const lastMessage = conversation.messages.length > 0 
          ? conversation.messages[conversation.messages.length - 1]
          : null;

        return {
          ...conversation,
          participants,
          lastMessage,
          participantCount: conversation.conversation_participants.length
        };
      });
    } catch (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }
  },

  // Create or get direct conversation between two users
  async getOrCreateDirectConversation(otherUserId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
        user1_uuid: user.id,
        user2_uuid: otherUserId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating/getting direct conversation:', error);
      throw error;
    }
  },

  // Create group conversation
  async createGroupConversation(name, participantIds) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert([{
          conversation_type: 'group',
          name,
          created_by: user.id
        }])
        .select()
        .single();

      if (convError) throw convError;

      // Add participants (including creator)
      const allParticipantIds = [user.id, ...participantIds];
      const participantRecords = allParticipantIds.map(userId => ({
        conversation_id: conversation.uuid,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'member'
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participantRecords);

      if (partError) throw partError;

      return conversation;
    } catch (error) {
      console.error('Error creating group conversation:', error);
      throw error;
    }
  },

  // Get conversation participants
  async getConversationParticipants(conversationId) {
    try {
      const { data, error } = await supabase.rpc('get_conversation_participants', {
        conversation_uuid: conversationId
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation participants:', error);
      throw error;
    }
  },

  // ========================================
  // MESSAGE MANAGEMENT
  // ========================================

  // Get messages for a conversation
  async getConversationMessages(conversationId, limit = 50, offset = 0) {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            uuid,
            username,
            display_name,
            avatar_url
          ),
          reply_to_message:messages!messages_reply_to_fkey (
            uuid,
            content,
            sender:profiles!messages_sender_id_fkey (
              uuid,
              username,
              display_name
            )
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Mark messages as read
      await this.markMessagesAsRead(conversationId);

      return messages.reverse(); // Return in chronological order
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(conversationId, content, messageType = 'text', fileUrl = null, replyTo = null) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .insert([{
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          file_url: fileUrl,
          reply_to: replyTo
        }])
        .select(`
          *,
          sender:profiles!messages_sender_id_fkey (
            uuid,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Edit a message
  async editMessage(messageId, newContent) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          updated_at: new Date().toISOString(),
          is_edited: true
        })
        .eq('uuid', messageId)
        .eq('sender_id', user.id) // Ensure user can only edit their own messages
        .select()
        .single();

      if (error) throw error;
      return message;
    } catch (error) {
      console.error('Error editing message:', error);
      throw error;
    }
  },

  // Delete a message
  async deleteMessage(messageId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('uuid', messageId)
        .eq('sender_id', user.id); // Ensure user can only delete their own messages

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // ========================================
  // READ STATUS MANAGEMENT
  // ========================================

  // Mark messages as read
  async markMessagesAsRead(conversationId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get unread messages in this conversation
      const { data: unreadMessages, error: fetchError } = await supabase
        .from('messages')
        .select('uuid')
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .not('uuid', 'in', `(
          SELECT message_id FROM message_reads WHERE user_id = '${user.id}'
        )`);

      if (fetchError) throw fetchError;

      if (unreadMessages.length > 0) {
        // Mark messages as read
        const readRecords = unreadMessages.map(msg => ({
          message_id: msg.uuid,
          user_id: user.id
        }));

        const { error: readError } = await supabase
          .from('message_reads')
          .insert(readRecords);

        if (readError) throw readError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },

  // Get unread message count
  async getUnreadMessageCount() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_unread_message_count', {
        user_uuid: user.id
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting unread message count:', error);
      throw error;
    }
  },

  // ========================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================

  // Subscribe to new messages in a conversation
  subscribeToMessages(conversationId, callback) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, callback)
      .subscribe();
  },

  // Subscribe to conversation updates
  subscribeToConversations(callback) {
    return supabase
      .channel('conversations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'conversations'
      }, callback)
      .subscribe();
  },

  // Subscribe to message reads
  subscribeToMessageReads(conversationId, callback) {
    return supabase
      .channel(`reads:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message_reads'
      }, callback)
      .subscribe();
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================

  // Format message timestamp
  formatMessageTime(timestamp) {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return messageTime.toLocaleDateString();
  },

  // Get conversation display name
  getConversationDisplayName(conversation, currentUserId) {
    if (conversation.conversation_type === 'group') {
      return conversation.name || 'Group Chat';
    }

    // For direct conversations, show the other person's name
    const otherParticipant = conversation.participants?.find(p => p.uuid !== currentUserId);
    return otherParticipant?.display_name || otherParticipant?.username || 'Unknown User';
  },

  // Get conversation avatar
  getConversationAvatar(conversation, currentUserId) {
    if (conversation.conversation_type === 'group') {
      return '👥'; // Group icon
    }

    // For direct conversations, show the other person's avatar
    const otherParticipant = conversation.participants?.find(p => p.uuid !== currentUserId);
    return otherParticipant?.avatar_url || '👤';
  }
}; 