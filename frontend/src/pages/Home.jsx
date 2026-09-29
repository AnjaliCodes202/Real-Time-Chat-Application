import React from 'react';
import { useChatStore } from '../store/useChatStore';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';

const HomePage = () => {
  const { selectedUser } = useChatStore();

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-20 px-4 h-full pb-6">
        <div className="bg-base-100 rounded-xl shadow-lg w-full max-w-6xl h-full border border-base-300 overflow-hidden">
          <div className="flex h-full w-full">
            <Sidebar />
            
            {!selectedUser ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-base-100/50 p-6 text-center">
                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-4xl">💬</span>
                </div>
                <h2 className="text-2xl font-bold mb-2">Welcome to ChatApp</h2>
                <p className="text-base-content/60 max-w-md">
                  Select a user from the sidebar to start a real-time conversation.
                </p>
              </div>
            ) : (
              <ChatWindow />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
