import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { apiClient, tokenStore } from '@/lib/api-client';
import { connectSocket, disconnectSocket } from '@/lib/socket';

export type UserRole =
  | 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'PRINCIPAL' | 'HOD'
  | 'FACULTY' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT'
  | 'LIBRARIAN' | 'HOSTEL_WARDEN' | 'TRANSPORT_MANAGER'
  | 'HR_MANAGER' | 'RECEPTIONIST';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  institutionId: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await apiClient.post('/auth/login', { email, password });
          const { accessToken, refreshToken, user } = data.data;

          tokenStore.set(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false, error: null });
          connectSocket();
        } catch (err: any) {
          const message = err.response?.data?.error?.message ?? 'Login failed';
          set({ isLoading: false, error: message });
          throw new Error(message);
        }
      },

      logout: async () => {
        try {
          await apiClient.post('/auth/logout').catch(() => null);
        } finally {
          tokenStore.clear();
          disconnectSocket();
          set({ user: null, isAuthenticated: false, error: null });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'erp-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

// ── Role permission helpers ────────────────────────────────────
export const MANAGEMENT_ROLES: UserRole[] = [
  'SUPER_ADMIN', 'INSTITUTION_ADMIN', 'PRINCIPAL', 'HOD',
  'ACCOUNTANT', 'HR_MANAGER', 'LIBRARIAN', 'HOSTEL_WARDEN',
  'TRANSPORT_MANAGER', 'RECEPTIONIST',
];

export function getPortalPath(role: UserRole): string {
  if (role === 'STUDENT') return '/student/dashboard';
  if (role === 'PARENT') return '/parent/dashboard';
  if (role === 'FACULTY' || role === 'HOD') return '/faculty/dashboard';
  return '/management/dashboard';
}

export function hasRole(user: AuthUser | null, ...roles: UserRole[]): boolean {
  return !!user && roles.includes(user.role);
}

export function canAccess(user: AuthUser | null, module: string): boolean {
  if (!user) return false;
  const roleModules: Partial<Record<UserRole, string[]>> = {
    SUPER_ADMIN: ['*'],
    INSTITUTION_ADMIN: ['*'],
    PRINCIPAL: ['students', 'faculty', 'academics', 'exams', 'fees', 'hr', 'analytics', 'notices', 'grievances'],
    HOD: ['students', 'faculty', 'academics', 'exams', 'assignments', 'analytics'],
    FACULTY: ['attendance', 'assignments', 'exams', 'notices', 'leaves', 'library'],
    STUDENT: ['attendance', 'assignments', 'exams', 'fees', 'library', 'notices', 'grievances'],
    PARENT: ['attendance', 'exams', 'fees', 'notices', 'transport'],
    ACCOUNTANT: ['fees', 'analytics'],
    LIBRARIAN: ['library'],
    HR_MANAGER: ['hr', 'payroll'],
    TRANSPORT_MANAGER: ['transport'],
  };
  const allowed = roleModules[user.role] ?? [];
  return allowed.includes('*') || allowed.includes(module);
}
