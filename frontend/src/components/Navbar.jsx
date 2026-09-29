import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, User, MessageSquare, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold">ChatApp</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link to="/settings" className="btn btn-sm btn-ghost gap-2">
            <Settings className="size-5" />
            <span className="hidden sm:inline">Settings</span>
          </Link>

          {authUser && (
            <>
              <Link to="/profile" className="btn btn-sm btn-ghost gap-2">
                <User className="size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <button className="btn btn-sm btn-ghost gap-2" onClick={logout}>
                <LogOut className="size-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
