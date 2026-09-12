import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiUrl } from '../utils/api';

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
  currentLevel: string;
  favoriteDomains: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogleToken: (googleToken: string) => Promise<{ isNewUser: boolean }>;
  logout: () => void;
  updateFavoriteDomains: (domains: string[]) => Promise<void>;
  savePlacementTest: (correctRatio: number) => Promise<void>;
  saveLessonProgress: (level: string, lessonNo: number, wpm: number, accuracy: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  loginWithGoogleToken: async () => ({ isNewUser: false }),
  logout: () => {},
  updateFavoriteDomains: async () => {},
  savePlacementTest: async () => {},
  saveLessonProgress: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('vocatype-auth-token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    localStorage.removeItem('vocatype-auth-token');
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(apiUrl('/users/profile'), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      if (!res.ok) throw new Error('Không thể tải profile');
      const data = await res.json();
      setUser(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const loginWithGoogleToken = async (googleToken: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(apiUrl('/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: googleToken }),
      });
      if (!res.ok) throw new Error('Lỗi xác thực phía server');
      const data = await res.json();

      localStorage.setItem('vocatype-auth-token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { isNewUser: data.isNewUser };
    } catch (err) {
      logout();
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateFavoriteDomains = async (domains: string[]) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/users/favorite-domains'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domains }),
      });
      if (!res.ok) throw new Error('Lỗi cập nhật lĩnh vực');
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const savePlacementTest = async (correctRatio: number) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/users/placement-test'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ correctRatio }),
      });
      if (!res.ok) throw new Error('Lỗi lưu kết quả test');
      const updatedUser = await res.json();
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const saveLessonProgress = async (level: string, lessonNo: number, wpm: number, accuracy: number) => {
    if (!token) return;
    try {
      const res = await fetch(apiUrl('/users/progress/lesson'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ level, lessonNo, wpm, accuracy }),
      });
      if (!res.ok) throw new Error('Lỗi lưu kết quả bài học');
      
      // Sau khi lưu tiến trình, ta cập nhật lại thông tin user profile
      // (ví dụ user có thể tự động được mở khoá level mới)
      await refreshProfile();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogleToken,
        logout,
        updateFavoriteDomains,
        savePlacementTest,
        saveLessonProgress,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
