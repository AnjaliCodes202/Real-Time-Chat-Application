import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { Image, Send, X } from 'lucide-react';
import toast from 'react-hot-toast';

const MessageInput = () => {
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const { socket } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setImagePreview(reader.result);
    };
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    const attachment = imagePreview ? { type: 'image', url: imagePreview } : null;

    try {
      await sendMessage({ text: text.trim(), attachment });
      setText('');
      removeImage();
      if (socket && selectedUser) {
        socket.emit('typing:stop', { receiverId: selectedUser._id });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = (e) => {
    setText(e.target.value);

    if (socket && selectedUser) {
      socket.emit('typing:start', { receiverId: selectedUser._id });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { receiverId: selectedUser._id });
      }, 2000);
    }
  };

  return (
    <div className="p-4 w-full border-t border-base-300 bg-base-100">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg border border-base-300" />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center text-base-content/70 hover:bg-base-content hover:text-base-100 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={handleTyping}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
          <button
            type="button"
            className={`hidden sm:flex btn btn-circle btn-sm sm:btn-md ${imagePreview ? 'text-primary' : 'text-base-content/60'}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image className="w-5 h-5" />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-primary btn-sm sm:btn-md btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
