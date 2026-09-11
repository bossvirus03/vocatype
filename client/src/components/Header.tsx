import React from 'react';
import { Keyboard as KeyboardIcon, BookOpen, PenTool, Sun, Moon, LogOut, Award, SlidersHorizontal } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

interface HeaderProps {
  activeTab: 'study' | 'type';
  onTabChange: (tab: 'study' | 'type') => void;
  onOpenSettings?: () => void;
  isSettingsOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  isSettingsOpen = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, loginWithGoogleToken, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 glass border-b border-slate-200/80 dark:border-white/10 backdrop-blur-xl">
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">

        {/* Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/25 ring-1 ring-white/20">
            <KeyboardIcon size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-500 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                VocaType
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-500 dark:text-violet-400 border border-violet-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-none">
              Luyện gõ từ vựng tiếng Anh · CEFR
            </p>
          </div>
        </div>

        {/* Tab Switcher (Segmented Control phong cách Apple/Linear) */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/5 rounded-2xl p-1 border border-slate-300/40 dark:border-white/5 shadow-inner">
          <button
            onClick={() => onTabChange('study')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${activeTab === 'study'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
          >
            <BookOpen size={14} />
            Học tập
          </button>
          <button
            onClick={() => onTabChange('type')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200
              ${activeTab === 'type'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
              }`}
          >
            <PenTool size={14} />
            Luyện gõ
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-slate-600 dark:text-slate-300
              hover:bg-violet-500/10 hover:text-violet-500 dark:hover:text-violet-400 transition-all duration-200 border border-slate-200/80 dark:border-white/10"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* Nút Cài đặt Mở Slide-over Drawer */}
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              title="Cài đặt trải nghiệm (Giao diện, âm thanh, cấp độ...)"
              className={`group w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 relative border ${
                isSettingsOpen
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30 border-violet-500'
                  : 'glass text-slate-600 dark:text-slate-300 hover:bg-violet-500/10 hover:text-violet-500 dark:hover:text-violet-400 border-slate-200/80 dark:border-white/10'
              }`}
            >
              <SlidersHorizontal
                size={17}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-violet-500 rounded-full border-2 border-white dark:border-[#0f0f1a]" />
            </button>
          )}

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
