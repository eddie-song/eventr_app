import React, { useState, useEffect, useRef } from 'react';
import { messagingService } from '../../services/messagingService';
import { supabase } from '../../lib/supabaseClient';
import './Messaging.css';

const Messaging = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [isGroupChat, setIsGroupChat] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
    loadUnreadCount();
  }, []);

  // Load conversations
  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const conversationsData = await messagingService.getUserConversations();
      setConversations(conversationsData);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread message count
  const loadUnreadCount = async () => {
    try {
      const count = await messagingService.getUnreadMessageCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      const messagesData = await messagingService.getConversationMessages(conversationId);
      setMessages(messagesData);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.uuid);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const message = await messagingService.sendMessage(
        selectedConversation.uuid,
        newMessage.trim()
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Update conversation list with new last message
      setConversations(prev => 
        prev.map(conv => 
          conv.uuid === selectedConversation.uuid 
            ? { ...conv, lastMessage: message }
            : conv
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Load users for new conversation
  const loadUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: usersData, error } = await supabase
        .from('profiles')
        .select('uuid, username, display_name, avatar_url')
        .neq('uuid', user.id);

      if (error) throw error;
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Create new conversation
  const handleCreateConversation = async () => {
    try {
      if (isGroupChat) {
        if (!groupName.trim() || selectedUsers.length === 0) return;
        
        const conversation = await messagingService.createGroupConversation(
          groupName.trim(),
          selectedUsers
        );
        
        // Add to conversations list
        const newConversation = {
          ...conversation,
          participants: users.filter(u => selectedUsers.includes(u.uuid)),
          lastMessage: null,
          participantCount: selectedUsers.length + 1
        };
        
        setConversations(prev => [newConversation, ...prev]);
        handleConversationSelect(newConversation);
      } else {
        if (selectedUsers.length !== 1) return;
        
        const conversationId = await messagingService.getOrCreateDirectConversation(
          selectedUsers[0]
        );
        
        // Reload conversations to get the new one
        await loadConversations();
        
        // Find and select the new conversation
        const newConversation = conversations.find(c => c.uuid === conversationId);
        if (newConversation) {
          handleConversationSelect(newConversation);
        }
      }
      
      // Reset form
      setShowNewConversation(false);
      setSelectedUsers([]);
      setGroupName('');
      setIsGroupChat(false);
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('message-attachments')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(fileName);

      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      const message = await messagingService.sendMessage(
        selectedConversation.uuid,
        file.name,
        messageType,
        publicUrl
      );
      
      setMessages(prev => [...prev, message]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv => {
    const displayName = messagingService.getConversationDisplayName(conv, supabase.auth.getUser()?.id);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const displayName = user.display_name || user.username;
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="messaging-container">
      {/* Conversations Sidebar */}
      <div className="conversations-sidebar">
        <div className="conversations-header">
          <h2>Messages</h2>
          <button 
            className="new-conversation-btn"
            onClick={() => {
              setShowNewConversation(true);
              loadUsers();
            }}
          >
            ✏️
          </button>
        </div>

        {/* Search */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Conversations List */}
        <div className="conversations-list">
          {isLoading ? (
            <div className="loading">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="no-conversations">
              <p>No conversations yet</p>
              <button 
                className="start-chat-btn"
                onClick={() => {
                  setShowNewConversation(true);
                  loadUsers();
                }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations.map(conversation => (
              <div
                key={conversation.uuid}
                className={`conversation-item ${selectedConversation?.uuid === conversation.uuid ? 'active' : ''}`}
                onClick={() => handleConversationSelect(conversation)}
              >
                <div className="conversation-avatar">
                  {messagingService.getConversationAvatar(conversation, supabase.auth.getUser()?.id)}
                </div>
                <div className="conversation-info">
                  <div className="conversation-name">
                    {messagingService.getConversationDisplayName(conversation, supabase.auth.getUser()?.id)}
                  </div>
                  <div className="conversation-preview">
                    {conversation.lastMessage ? (
                      <>
                        <span className="sender">
                          {conversation.lastMessage.sender?.display_name || conversation.lastMessage.sender?.username}:
                        </span>
                        <span className="message-preview">
                          {conversation.lastMessage.content.substring(0, 30)}
                          {conversation.lastMessage.content.length > 30 ? '...' : ''}
                        </span>
                      </>
                    ) : (
                      <span className="no-messages">No messages yet</span>
                    )}
                  </div>
                </div>
                <div className="conversation-meta">
                  {conversation.lastMessage && (
                    <div className="message-time">
                      {messagingService.formatMessageTime(conversation.lastMessage.created_at)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="chat-header">
              <div className="chat-participant-info">
                <div className="participant-avatar">
                  {messagingService.getConversationAvatar(selectedConversation, supabase.auth.getUser()?.id)}
                </div>
                <div className="participant-details">
                  <h3>{messagingService.getConversationDisplayName(selectedConversation, supabase.auth.getUser()?.id)}</h3>
                  <span className="participant-count">
                    {selectedConversation.participantCount} participant{selectedConversation.participantCount !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
              {messages.map(message => (
                <MessageBubble key={message.uuid} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form className="message-input-container" onSubmit={handleSendMessage}>
              <button
                type="button"
                className="attachment-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                📎
              </button>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                ➤
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <div className="welcome-message">
              <h2>Welcome to Messages</h2>
              <p>Select a conversation to start messaging</p>
              <button 
                className="start-chat-btn"
                onClick={() => {
                  setShowNewConversation(true);
                  loadUsers();
                }}
              >
                Start a new conversation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="modal-overlay" onClick={() => setShowNewConversation(false)}>
          <div className="new-conversation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Conversation</h3>
              <button 
                className="close-btn"
                onClick={() => setShowNewConversation(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-content">
              <div className="conversation-type-toggle">
                <button
                  className={`toggle-btn ${!isGroupChat ? 'active' : ''}`}
                  onClick={() => setIsGroupChat(false)}
                >
                  Direct Message
                </button>
                <button
                  className={`toggle-btn ${isGroupChat ? 'active' : ''}`}
                  onClick={() => setIsGroupChat(true)}
                >
                  Group Chat
                </button>
              </div>

              {isGroupChat && (
                <div className="group-name-input">
                  <label>Group Name</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Enter group name..."
                  />
                </div>
              )}

              <div className="users-selection">
                <label>Select {isGroupChat ? 'participants' : 'user'}</label>
                <div className="users-list">
                  {filteredUsers.map(user => (
                    <div
                      key={user.uuid}
                      className={`user-item ${selectedUsers.includes(user.uuid) ? 'selected' : ''}`}
                      onClick={() => {
                        if (isGroupChat) {
                          setSelectedUsers(prev => 
                            prev.includes(user.uuid)
                              ? prev.filter(id => id !== user.uuid)
                              : [...prev, user.uuid]
                          );
                        } else {
                          setSelectedUsers([user.uuid]);
                        }
                      }}
                    >
                      <div className="user-avatar">
                        {user.avatar_url || '👤'}
                      </div>
                      <div className="user-name">
                        {user.display_name || user.username}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button
                  className="cancel-btn"
                  onClick={() => setShowNewConversation(false)}
                >
                  Cancel
                </button>
                <button
                  className="create-btn"
                  onClick={handleCreateConversation}
                  disabled={
                    selectedUsers.length === 0 ||
                    (isGroupChat && !groupName.trim())
                  }
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) {
            handleFileUpload(file);
          }
        }}
      />
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const { data: { user } } = supabase.auth.getUser();
  const isOwnMessage = message.sender_id === user?.id;

  return (
    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
      {!isOwnMessage && (
        <div className="message-avatar">
          {message.sender?.avatar_url || '👤'}
        </div>
      )}
      <div className="message-content">
        {!isOwnMessage && (
          <div className="message-sender">
            {message.sender?.display_name || message.sender?.username}
          </div>
        )}
        <div className="message-text">
          {message.message_type === 'image' ? (
            <img src={message.file_url} alt="Message attachment" className="message-image" />
          ) : message.message_type === 'file' ? (
            <a href={message.file_url} target="_blank" rel="noopener noreferrer" className="message-file">
              📎 {message.content}
            </a>
          ) : (
            message.content
          )}
        </div>
        <div className="message-time">
          {messagingService.formatMessageTime(message.created_at)}
          {message.is_edited && <span className="edited-indicator"> (edited)</span>}
        </div>
      </div>
    </div>
  );
};

export default Messaging; 