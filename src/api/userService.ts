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

  async getCurrentUser(): Promise<User> {
    const user = await storageService.getUser();
    if (!user) {
      return await this.createAnonymousUser();
    }
    return user;
  }

  async updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
    const user = await storageService.getUser();
    if (user && user.id === userId) {
      user.settings = { ...user.settings, ...settings };
      await storageService.saveUser(user);
    }
  }

  async updateUserProfile(
    userId: string,
    updates: Partial<Pick<User, 'name' | 'email'>>
  ): Promise<void> {
    const user = await storageService.getUser();
    if (user && user.id === userId) {
      Object.assign(user, updates);
      await storageService.saveUser(user);
    }
  }
}

export const userService = new UserService();
