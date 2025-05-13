import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../types/database.types';

interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  initialized: boolean;
  signUp: (email: string, password: string, name: string, inviteCode?: string) => Promise<{ success: boolean; error?: string }>;
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
  session: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        set({ user, session, loading: false, initialized: true });
      } else {
        set({ loading: false, initialized: true });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ loading: false, initialized: true });
    }
  },

  refreshUser: async () => {
    const { session } = get();
    if (!session) return;

    try {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (user) {
        set({ user });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  },

  signUp: async (email, password, name, inviteCode) => {
    set({ loading: true });
    try {
      let groupId = null;
      let inviterId = null;
      let groupCodeUsed = null;

      if (inviteCode) {
        const { data: group } = await supabase
          .from('groups')
          .select('id, owner_id, code')
          .eq('code', inviteCode)
          .single();
        if (group) {
          groupId = group.id;
          inviterId = group.owner_id;
          groupCodeUsed = group.code;

          // Count all users who joined with this group code
          const { count: groupUserCount, error: groupUserCountError } = await supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('invite_code', group.code);

          if (groupUserCountError) throw groupUserCountError;

          // Block sign up if group already has 4 users
          if ((groupUserCount ?? 0) >= 4) {
            set({ loading: false });
            return {
              success: false,
              error: 'This group is full. Please use another invite code.'
            };
          }
        }
      }

      // Now safe to create user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            invite_code: groupCodeUsed || null, // <-- store the group code used for signup
          }
        }
      });
      if (error) throw error;
      if (data.user) {
        // Create user in our users table
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          name,
          email,
          invite_code: groupCodeUsed || null, // <-- store the group code used for signup
          referred_by: inviterId,
        });
        if (insertError) throw insertError;
        // If group invite was used, create an invite record
        if (groupId && inviterId) {
          const { error: inviteInsertError } = await supabase.from('invites').insert({
            group_id: groupId,
            inviter_id: inviterId,
            referred_user_id: data.user.id,
            owner_confirmed: false
          });
          if (inviteInsertError) {
            console.error('Invite insert error:', inviteInsertError);
          }
        }
        set({ 
          user: {
            id: data.user.id,
            name,
            email,
            invite_code: groupCodeUsed || null,
            referred_by: inviterId,
            role: 'user',
            pack_type: null,
            status: 'pending',
            current_level: 0,
            created_at: new Date().toISOString()
          }, 
          session: data.session,
          loading: false 
        });
        return { success: true };
      } else {
        // Handle email confirmation if required
        return { 
          success: true, 
          error: 'Please check your email for confirmation.' 
        };
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      set({ loading: false });
      return { 
        success: false, 
        error: error.message || 'An error occurred during sign up.' 
      };
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        set({ user, session: data.session, loading: false });
        return { success: true };
      } else {
        set({ loading: false });
        return { 
          success: false, 
          error: 'User not found.' 
        };
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      set({ loading: false });
      return { 
        success: false, 
        error: error.message || 'An error occurred during sign in.' 
      };
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null });
  },

  updateUserProfile: async (updates: Partial<User>) => {
    const { user } = get();
    if (!user) return { success: false, error: 'Not authenticated' };
    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
      if (error) throw error;
      // Refresh user in store
      set({ user: { ...user, ...updates } });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  },

  selectPlan: async (packType) => {
    const { user } = get();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ pack_type: packType })
        .eq('id', user.id);
        
      if (error) throw error;
      
      set({ user: { ...user, pack_type: packType } });
      return { success: true };
    } catch (error: any) {
      console.error('Select plan error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred while selecting plan.' 
      };
    }
  },

  getGroupMembers: async (groupId: string) => {
    // Returns members with their info and owner_confirmed status
    try {
      const { data, error } = await supabase
        .from('invites')
        .select(`
          referred_user_id,
          owner_confirmed,
          users:referred_user_id (
            id,
            name,
            email,
            status,
            created_at
          )
        `)
        .eq('group_id', groupId);

      if (error) throw error;
      // Each item: { referred_user_id, owner_confirmed, users: { ...user fields... } }
      return { success: true, members: data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Could not fetch group members.' };
    }
  }
}));