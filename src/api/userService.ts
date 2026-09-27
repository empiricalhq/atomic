import * as Crypto from 'expo-crypto';
import { User, UserSettings } from '@/types';
import { storageService } from '@/services/storageService';

const DEFAULT_SETTINGS: UserSettings = {
  notifications: true,
  biometric: false,
  darkMode: false,
  currency: 'USD',
  language: 'es',
};

class UserService {
  async createAnonymousUser(): Promise<User> {
    const user: User = {
      id: Crypto.randomUUID(),
      name: 'Usuario',
      isAnonymous: true,
      createdAt: new Date(),
      settings: DEFAULT_SETTINGS,
    };
    await storageService.saveUser(user);
    return user;
  }

  async loadUser(): Promise<User | null> {
    return storageService.getUser();
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    await storageService.updateUser((user) => {
      if (!user || user.id !== userId) return user;
      return { ...user, settings: { ...user.settings, ...settings } };
    });
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email'>>
  ): Promise<void> {
    await storageService.updateUser((user) => {
      if (!user || user.id !== userId) return user;
      return { ...user, ...updates };
    });
  }
}

export const userService = new UserService();
