import { create } from 'zustand';
import * as api from '../lib/supabase';
import { User } from '../types/database.types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name: string, inviteCode?: string, whatsapp?: string) => Promise<{ success: boolean; error?: string }>; 
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>; 
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>; 
  selectPlan: (packType: 'starter' | 'gold') => Promise<{ success: boolean; error?: string }>; 
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  getGroupMembers: (groupId: string) => Promise<{ success: boolean; members?: any; error?: string }>; 
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Try to load token from localStorage
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      set({ loading: false, initialized: true });
      return;
    }
    try {
      // Get user info from backend
      // Assume userId is encoded in JWT, or backend returns user info
      // You may want to decode JWT to get userId, or have a /me endpoint
      const user = await api.getUserMe(token); // Implement getUserMe in api client if needed
      set({ user, token, loading: false, initialized: true });
    } catch (error) {
      set({ loading: false, initialized: true, user: null, token: null });
      localStorage.removeItem('jwt_token');
    }
  },

  refreshUser: async () => {
    const { token } = get();
    if (!token) return;
    try {
      const user = await api.getUserMe(token);
      set({ user });
    } catch (error) {
      // Optionally handle error
    }
  },

  signUp: async (email, password, name, inviteCode, whatsapp) => {
    set({ loading: true });
    try {
      const result = await api.registerUser(email, password, name, inviteCode, whatsapp);
      if (result.success && result.token && result.user) {
        set({ user: result.user, token: result.token, loading: false });
        localStorage.setItem('jwt_token', result.token);
        return { success: true };
      } else {
        set({ loading: false });
        return { success: false, error: result.error || 'Registration failed.' };
      }
    } catch (error: any) {
      set({ loading: false });
      return { success: false, error: error.message || 'An error occurred during sign up.' };
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    try {
      const result = await api.loginUser(email, password);
      if (result.success && result.token && result.user) {
        set({ user: result.user, token: result.token, loading: false });
        localStorage.setItem('jwt_token', result.token);
        return { success: true };
      } else {
        set({ loading: false });
        return { success: false, error: result.error || 'Login failed.' };
      }
    } catch (error: any) {
      set({ loading: false });
      return { success: false, error: error.message || 'An error occurred during sign in.' };
    }
  },

  signOut: async () => {
    set({ user: null, token: null });
    localStorage.removeItem('jwt_token');
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const { user, token } = get();
    if (!user || !token) return { success: false, error: 'Not authenticated' };
    try {
      const result = await api.updateUserProfile(user.id, updates, token);
      if (result.success) {
        set({ user: { ...user, ...updates } });
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to update profile' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  },

  selectPlan: async (packType) => {
    const { user, token } = get();
    if (!user || !token) {
      return { success: false, error: 'Not authenticated' };
    }
    try {
      const result = await api.selectPlan(user.id, packType, token);
      if (result.success) {
        set({ user: { ...user, pack_type: packType } });
        return { success: true };
      } else {
        return { success: false, error: result.error || 'Failed to select plan' };
      }
    } catch (error: any) {
      return { success: false, error: error.message || 'An error occurred while selecting plan.' };
    }
  },

  getGroupMembers: async (groupId: string) => {
    const { token } = get();
    if (!token) return { success: false, error: 'Not authenticated' };
    try {
      const members = await api.getGroupMembers(groupId, token);
      return { success: true, members };
    } catch (error: any) {
      return { success: false, error: error.message || 'Could not fetch group members.' };
    }
  }
}));