import React from 'react';
import { Keyboard as KeyboardIcon, BookOpen, PenTool, Sun, Moon, LogOut, Award } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface HeaderProps {
  activeTab: 'study' | 'type';
  onTabChange: (tab: 'study' | 'type') => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, loginWithGoogleToken, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-200 dark:border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <KeyboardIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight bg-gradient-to-r from-violet-500 to-indigo-400 bg-clip-text text-transparent">
              VocaType
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none">
              Luyện gõ tiếng Anh · CEFR
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 glass rounded-xl p-1">
          <button
            onClick={() => onTabChange('study')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'study'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
          >
            <BookOpen size={15} />
            Học tập
          </button>
          <button
            onClick={() => onTabChange('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === 'type'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-500 text-white shadow-md shadow-violet-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
          >
            <PenTool size={15} />
            Luyện gõ
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
            className="w-10 h-10 rounded-xl glass flex items-center justify-center text-slate-600 dark:text-slate-300
              hover:bg-violet-500/10 hover:text-violet-500 dark:hover:text-violet-400 transition-all duration-200"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Auth Controls */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-white/10">
              <img
                src={user.avatar || 'https://via.placeholder.com/150'}
                alt={user.name}
                className="w-8 h-8 rounded-full border border-violet-500/20 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                }}
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[100px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-violet-500 dark:text-violet-400 font-semibold flex items-center gap-0.5">
                  <Award size={10} /> Cấp {user.currentLevel}
                </span>
              </div>
              <button
                onClick={logout}
                title="Đăng xuất"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="pl-2 border-l border-slate-200 dark:border-white/10">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    loginWithGoogleToken(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  console.error('Đăng nhập thất bại');
                }}
                type="icon"
                shape="circle"
                theme={theme === 'dark' ? 'filled_blue' : 'outline'}
              />
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;
