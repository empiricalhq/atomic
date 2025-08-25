import { useState, useEffect } from 'react';
import { User } from '@/types';
import { userService } from '@/api/userService';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const currentUser = await userService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error initializing user:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      if (updates.settings) {
        await userService.updateUserSettings(user.id, updates.settings);
      }
      if (updates.name || updates.email) {
        await userService.updateUserProfile(user.id, {
          name: updates.name,
          email: updates.email,
        });
      }
      setUser((prev) => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return {
    user,
    loading,
    updateUser,
    refreshUser: initializeUser,
  };
};
