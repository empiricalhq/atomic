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

// settings is a patch merged onto the existing settings, not a replacement,
// so two rapid calls that each change one setting (before either's write
// resolves) don't clobber each other: the storage side merges it onto the
// record it reads fresh inside the user key's queue, and the provider
// merges it onto the latest state via setUser(prev => ...).
export type UserUpdate = Partial<Omit<User, 'settings'>> & { settings?: Partial<UserSettings> };

export interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  updateUser: (updates: UserUpdate) => Promise<void>;
  // Returns the loaded user (or null on failure) so a caller that retries
  // after a failed load can act on the result immediately, instead of
  // reading the `user` this closure still has from before the retry.
  refreshUser: () => Promise<User | null>;
  // Creates and stores the anonymous user, adopting it as the current user.
  // Rejects unless the provider is in the missing state (done loading, no
  // error, no stored user), so a transient load failure is never mistaken
  // for a missing user and doesn't overwrite the one already in storage.
  // Single-flight: a second call made before the first settles returns the
  // same promise instead of creating a second user.
  createUser: () => Promise<User>;
}

export const UserContext = createContext<UserContextValue | null>(null);

// The sole holder and writer of the current user: every screen reads it
// through this context instead of loading or creating its own copy.
export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set synchronously, before any await, so a second call in the same tick
  // as the first joins this promise instead of starting another read: two
  // independent reads could otherwise resolve out of order, and an older
  // one rejecting after a newer one succeeded would set error over a user
  // that's already loaded.
  const pendingLoadRef = useRef<Promise<User | null> | null>(null);

  // Only loads a stored user; it never creates one. A missing user (no
  // error, not loading, user still null) means onboarding hasn't run yet.
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

  // Set synchronously, before any await, so a second call in the same tick
  // as the first sees it and joins this promise instead of starting another.
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
        setUser((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            ...updates,
            settings: updates.settings ? { ...prev.settings, ...updates.settings } : prev.settings,
          };
        });
      } catch (err) {
        console.error('Error updating user:', err);
      }
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
