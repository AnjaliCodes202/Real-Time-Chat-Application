import { X, Trash2, Edit2, Check, CheckCheck } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import MessageInput from './MessageInput';

const ChatWindow = () => {
  const { messages, getMessages, isMessagesLoading, selectedUser, setSelectedUser, subscribeToMessages, unsubscribeFromMessages, deleteMessage, editMessage, typingUsers, markAsRead } = useChatStore();
  const { authUser, socket, onlineUsers } = useAuthStore();
  const messagesEndRef = useRef(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleEditSubmit = async (messageId) => {
    // Force HMR update
    if (!editText.trim()) return;
    await editMessage(messageId, editText.trim());
    setEditingMessageId(null);
    setEditText('');
  };

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser._id, getMessages]);

  useEffect(() => {
    subscribeToMessages(socket);
    return () => unsubscribeFromMessages(socket);
  }, [socket, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if (messagesEndRef.current && messages) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Mark as read if the last message is from the selected user
    if (selectedUser && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender === selectedUser._id && lastMessage.status !== 'READ') {
        markAsRead(selectedUser._id);
      }
    }
  }, [messages, selectedUser, markAsRead]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-base-100">
      {/* Header */}
      <div className="p-3 border-b border-base-300 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={selectedUser.profilePicture || "https://ui-avatars.com/api/?name=" + selectedUser.name}
              alt={selectedUser.name}
              className="size-10 object-cover rounded-full"
            />
            {onlineUsers.includes(selectedUser._id) && (
              <span className="absolute bottom-0 right-0 size-2.5 bg-success rounded-full ring-2 ring-base-100" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{selectedUser.name}</h3>
            <p className="text-xs text-base-content/60">
              {typingUsers.includes(selectedUser._id) ? (
                <span className="text-primary font-medium flex items-center gap-1">
                  typing
                  <span className="loading loading-dots loading-xs"></span>
                </span>
              ) : onlineUsers.includes(selectedUser._id) ? (
                'Online'
              ) : (
                selectedUser.lastSeen ? `Last seen ${new Date(selectedUser.lastSeen).toLocaleString()}` : 'Offline'
              )}
            </p>
          </div>
        </div>
        <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-circle btn-sm">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.sender === authUser._id;
          return (
            <div key={message._id || message.clientMessageId} className={`chat ${isOwn ? 'chat-end' : 'chat-start'}`}>
              <div className="chat-image avatar">
                <div className="w-8 rounded-full">
                  <img
                    alt="avatar"
                    src={isOwn ? (authUser.profilePicture || "https://ui-avatars.com/api/?name=" + authUser.name) : (selectedUser.profilePicture || "https://ui-avatars.com/api/?name=" + selectedUser.name)}
                  />
                </div>
              </div>
              <div className="chat-header mb-1 opacity-50 text-xs">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className={`chat-bubble flex flex-col relative group ${isOwn ? 'chat-bubble-primary text-primary-content' : 'bg-base-200 text-base-content'}`}>
                {message.deletedAt ? (
                  <span className="italic text-base-content/60 py-1">This message was deleted</span>
                ) : (
                  <>
                    {message.attachment?.url && (
                      <img src={message.attachment.url} alt="attachment" className="max-w-[200px] sm:max-w-[250px] rounded-md mb-2 object-cover" />
                    )}
                    
                    {editingMessageId === message._id ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="input input-xs text-base-content bg-base-100 rounded"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleEditSubmit(message._id);
                            if (e.key === 'Escape') setEditingMessageId(null);
                          }}
                        />
                        <button onClick={() => handleEditSubmit(message._id)} className="btn btn-xs btn-circle btn-success">
                          <Check className="size-3 text-white" />
                        </button>
                        <button onClick={() => setEditingMessageId(null)} className="btn btn-xs btn-circle btn-ghost">
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      message.text && (
                        <span className="leading-relaxed break-words">
                          {message.text}
                          {message.editedAt && <span className="text-[10px] opacity-70 ml-2">(edited)</span>}
                        </span>
                      )
                    )}
                  </>
                )}
                
                {isOwn && !message.deletedAt && editingMessageId !== message._id && (
                  <div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditingMessageId(message._id);
                        setEditText(message.text || '');
                      }}
                      className="btn btn-circle btn-xs btn-ghost bg-base-200 hover:bg-base-300"
                      title="Edit message"
                    >
                      <Edit2 className="size-3 text-base-content" />
                    </button>
                    <button 
                      onClick={() => deleteMessage(message._id)}
                      className="btn btn-circle btn-xs btn-error"
                      title="Delete message"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                )}
              </div>
              <div className="chat-footer opacity-50 text-[10px] mt-1 flex gap-1 items-center">
                {isOwn && !message.deletedAt && (
                  <span className="flex items-center gap-1">
                    {message.status === 'SENT' && <Check className="size-3" />}
                    {message.status === 'DELIVERED' && <CheckCheck className="size-3" />}
                    {message.status === 'READ' && <CheckCheck className="size-3 text-info" />}
                  </span>
                )}
              </div>
            </div>
          );
        })}
        
        {messages.length === 0 && (
          <div className="text-center text-base-content/60 my-10 flex flex-col items-center">
             <div className="size-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
               <span className="text-2xl">👋</span>
             </div>
             <p>Say hi to start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatWindow;
