import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { User, UserSettings } from '@/types';
import { userService } from '@/api/userService';

export type UserUpdate = Partial<Omit<User, 'settings'>> & { settings?: Partial<UserSettings> };

export interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (updates: UserUpdate) => Promise<void>;
  refreshUser: () => Promise<User | null>;
  createUser: () => Promise<User>;
}

export const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set before any await so a second call in the same tick joins this read.
  // Two independent reads could resolve out of order, and an older one
  // rejecting after a newer one succeeded would set error over a loaded user.
  const pendingLoadRef = useRef<Promise<User | null> | null>(null);

  const initializeUser = useCallback((): Promise<User | null> => {
    if (pendingLoadRef.current) return pendingLoadRef.current;
    setLoading(true);
    setError(null);
    const pending = userService
      .loadUser()
      .then((storedUser) => {
        setUser(storedUser);
        return storedUser;
      })
      .catch((err) => {
        console.error('Error loading user:', err);
        setError('Error cargando el usuario');
        return null;
      })
      .finally(() => {
        setLoading(false);
        pendingLoadRef.current = null;
      });
    pendingLoadRef.current = pending;
    return pending;
  }, []);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  // Set before any await so a second call in the same tick joins this create.
  const pendingCreateRef = useRef<Promise<User> | null>(null);

  const createUser = useCallback((): Promise<User> => {
    if (pendingCreateRef.current) return pendingCreateRef.current;
    if (loading || error !== null || user !== null) {
      return Promise.reject(
        new Error('No se puede crear un usuario: ya existe uno o hay un error sin resolver')
      );
    }
    const pending = userService
      .createAnonymousUser()
      .then((newUser) => {
        setUser(newUser);
        return newUser;
      })
      .finally(() => {
        pendingCreateRef.current = null;
      });
    pendingCreateRef.current = pending;
    return pending;
  }, [loading, error, user]);

  const updateUser = useCallback(
    async (updates: UserUpdate) => {
      if (!user) return;
      if (updates.settings) {
        await userService.updateUserSettings(user.id, updates.settings);
      }
      if (updates.name || updates.email) {
        await userService.updateUserProfile(user.id, {
          name: updates.name,
          email: updates.email,
        });
      }
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          ...updates,
          settings: updates.settings ? { ...prev.settings, ...updates.settings } : prev.settings,
        };
      });
    },
    [user]
  );

  const value: UserContextValue = useMemo(
    () => ({
      user,
      loading,
      error,
      updateUser,
      refreshUser: initializeUser,
      createUser,
    }),
    [user, loading, error, updateUser, initializeUser, createUser]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
