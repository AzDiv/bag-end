import { createClient } from '@supabase/supabase-js';
import { AdminDashboardStats } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getUserByInviteCode(inviteCode: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('invite_code', inviteCode)
    .single();

  if (error) {
    console.error('Error fetching user by invite code:', error);
    return null;
  }

  return data;
}

export async function getUserById(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, referred_by, invite_code, pack_type, status, current_level, created_at, whatsapp')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

export async function getUserWithGroups(userId: string) {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user:', userError);
    return null;
  }

  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .eq('owner_id', userId);

  if (groupsError) {
    console.error('Error fetching groups:', groupsError);
    return { ...user, groups: [] };
  }

  // Attach members and verified_members counts to each group
  const groupsWithCounts = await Promise.all(
    groups.map(async (group) => {
      // Count users who joined with this group's code
      const { count: membersCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('invite_code', group.code);
      // Count verified members: users with invite_code = group.code and status = 'active'
      const { count: verifiedCount } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('invite_code', group.code)
        .eq('status', 'active');
      // Count users who joined with this group's code but are not rejected
      const { count: groupUserCount, error: groupUserCountError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true })
        .eq('invite_code', group.code)
        .neq('status', 'rejected');
      return {
        ...group,
        members: membersCount || 0,
        verified_members: verifiedCount || 0,
        groupUserCount: groupUserCount || 0,
      };
    })
  );

  return {
    ...user,
    groups: groupsWithCounts,
  };
}

export async function getPendingVerifications() {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, referred_by, invite_code, pack_type, status, current_level, created_at, whatsapp')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending verifications:', error);
    return [];
  }

  return data;
}

export async function updateUserStatus(userId: string, status: 'pending' | 'active' | 'rejected') {
  const { error } = await supabase
    .from('users')
    .update({ status })
    .eq('id', userId);

  if (error) {
    console.error('Error updating user status:', error);
    return false;
  }

  // If activating a user, check if they need a new group
  if (status === 'active') {
    await createGroupIfNeeded(userId);
  }

  return true;
}

export async function createGroupIfNeeded(userId: string) {
  // Fetch user to check status
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('status')
    .eq('id', userId)
    .single();

  if (userError) {
    console.error('Error fetching user for group creation:', userError);
    return false;
  }

  // Fetch invite to check owner_confirmed
  const { data: invite, error: inviteError } = await supabase
    .from('invites')
    .select('owner_confirmed')
    .eq('referred_user_id', userId)
    .single();

  // Add this debug log right after fetching the invite:
  console.log('Invite fetch result:', invite, inviteError);

  if (inviteError) {
    console.error('Error fetching invite for group creation:', inviteError);
    return false;
  }

  // Debug log
  console.log('User status:', user.status, 'Owner confirmed:', invite?.owner_confirmed);

  // Only allow group creation if user is active and owner_confirmed is true
  if (user.status !== 'active' || invite?.owner_confirmed !== true) {
    console.warn('User must be active and owner_confirmed to create a group.');
    return false;
  }

  // Check if user already has a group
  const { data: existingGroups, error: groupCheckError } = await supabase
    .from('groups')
    .select('*')
    .eq('owner_id', userId);

  if (groupCheckError) {
    console.error('Error checking existing groups:', groupCheckError);
    return false;
  }

  // If user has no groups, create their first group
  if (!existingGroups || existingGroups.length === 0) {
    const { error: createError } = await supabase
      .from('groups')
      .insert({
        owner_id: userId,
        code: generateGroupCode(),
        group_number: 1
      });

    if (createError) {
      console.error('Error creating group:', createError);
      return false;
    }
  }

  return true;
}

export async function getGroupMembers(groupId: string) {
  const { data, error } = await supabase
    .from('invites')
    .select(`
      *,
      referred_user:referred_user_id(id, name, email, status, created_at, whatsapp)
    `)
    .eq('group_id', groupId);

  if (error) {
    console.error('Error fetching group members:', error);
    return [];
  }

  return data;
}

// Generate a random 6-character group code
function generateGroupCode() {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export async function getDashboardStats(): Promise<AdminDashboardStats> {
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  const { count: pendingVerifications } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: activeUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const { count: totalGroups } = await supabase
    .from('groups')
    .select('*', { count: 'exact', head: true });

  return {
    totalUsers: totalUsers || 0,
    pendingVerifications: pendingVerifications || 0,
    activeUsers: activeUsers || 0,
    totalGroups: totalGroups || 0
  };
}

export async function confirmGroupMember(inviteId: string) {
  const { error } = await supabase
    .from('invites')
    .update({ owner_confirmed: true })
    .eq('id', inviteId);
  if (error) {
    console.error('Error confirming group member:', error);
    return false;
  }

  // Fetch the invite to get the referred_user_id
  const { data: invite } = await supabase
    .from('invites')
    .select('referred_user_id')
    .eq('id', inviteId)
    .single();

  if (invite?.referred_user_id) {
    // Try to create group for this user (in case they are now eligible)
    await createGroupIfNeeded(invite.referred_user_id);
  }

  return true;
}

/**
 * Checks if the user's latest group is full (4 verified & confirmed members).
 * If so, creates the next group for the user (up to 3 groups).
 */
export async function createNextGroupIfEligible(userId: string) {
  // Get all groups for the user, sorted by group_number
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('*')
    .eq('owner_id', userId)
    .order('group_number', { ascending: true });

  if (groupsError || !groups || groups.length === 0) {
    console.error('Error fetching groups for next group check:', groupsError);
    return false;
  }

  // Only allow up to 3 groups
  if (groups.length >= 3) return false;

  // Get the latest group (highest group_number)
  const lastGroup = groups[groups.length - 1];

  // Count verified and owner_confirmed members in the last group
  // Only count if owner_confirmed is true AND user status is 'active'
  const { data: inviteRows, error: countError } = await supabase
    .from('invites')
    .select('referred_user_id, owner_confirmed, users:referred_user_id(status)')
    .eq('group_id', lastGroup.id)
    .eq('owner_confirmed', true);

  if (countError) {
    console.error('Error counting verified members:', countError);
    return false;
  }

  // Count only those where the referred user's status is 'active'
  const verifiedCount = (inviteRows || []).filter(row => {
    if (Array.isArray(row.users)) {
      return row.users[0]?.status === 'active';
    } else if (row.users) {
      return (row.users as any).status === 'active';
    }
    return false;
  }).length;

  // Calculate next group number before logging
  const nextGroupNumber = lastGroup.group_number + 1;

  // Debug logs for troubleshooting
  console.log('createNextGroupIfEligible debug:', {
    groupId: lastGroup.id,
    inviteRows,
    verifiedCount,
    nextGroupNumber,
    alreadyExists: groups.some(g => g.group_number === nextGroupNumber),
    canCreate: (verifiedCount ?? 0) >= 4
  });

  // Check if the next group already exists (guard against duplicate creation)
  if (groups.some(g => g.group_number === nextGroupNumber)) return false;

  // If there are 4 verified members, create the next group
  if ((verifiedCount ?? 0) >= 4) {
    const { error: createError } = await supabase
      .from('groups')
      .insert({
        owner_id: userId,
        code: generateGroupCode(),
        group_number: nextGroupNumber
      });

    if (createError) {
      console.error('Error creating next group:', createError);
      return false;
    }

    // Set user's current_level to nextGroupNumber (1, 2, 3)
    await supabase
      .from('users')
      .update({ current_level: nextGroupNumber })
      .eq('id', userId);

    return true;
  }

  return false;
}

/**
 * Returns a list of users who are eligible for the next group but don't have it yet.
 */
export async function findUsersMissingNextGroup() {
  // Get all users who are active
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, status')
    .eq('status', 'active');

  if (usersError || !users) return [];

  const eligibleUsers: any[] = [];

  for (const user of users) {
    // Get all groups for user
    const { data: groups } = await supabase
      .from('groups')
      .select('*')
      .eq('owner_id', user.id)
      .order('group_number', { ascending: true });

    if (!groups || groups.length === 0) continue;

    const lastGroup = groups[groups.length - 1];
    const nextGroupNumber = lastGroup.group_number + 1;

    // Only allow up to 3 groups
    if (groups.length >= 3) continue;

    // Check if next group already exists
    if (groups.some(g => g.group_number === nextGroupNumber)) continue;

    // Count verified & owner_confirmed members in last group
    const { data: inviteRows } = await supabase
      .from('invites')
      .select('referred_user_id, owner_confirmed, users:referred_user_id(status)')
      .eq('group_id', lastGroup.id)
      .eq('owner_confirmed', true);

    const verifiedCount = (inviteRows || []).filter(row => {
      if (Array.isArray(row.users)) {
        return row.users[0]?.status === 'active';
      } else if (row.users) {
        return (row.users as any).status === 'active';
      }
      return false;
    }).length;

    if (verifiedCount >= 4) {
      eligibleUsers.push({
        userId: user.id,
        name: user.name,
        email: user.email,
        lastGroupNumber: lastGroup.group_number,
        verifiedCount,
      });
    }
  }

  return eligibleUsers;
}

export async function getRecentAdminLogs() {
  // Fetch recent user verifications and rejections (status transitions)
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, status, created_at')
    .order('created_at', { ascending: false })
    .limit(40);

  // Only include users who are currently 'active' or 'rejected'
  const userLogs = (users || [])
    .filter(u => u.status === 'active' || u.status === 'rejected')
    .map(u => ({
      timestamp: u.created_at || '',
      message: u.status === 'active'
        ? `User ${u.name || ''} (${u.email || ''}) was verified.`
        : `User ${u.name || ''} (${u.email || ''}) was rejected.`,
      level: u.status === 'active' ? 'info' : 'warning',
    }));

  // Fetch recent group creations
  const { data: groups, error: groupsError } = await supabase
    .from('groups')
    .select('id, code, group_number, created_at, owner_id')
    .order('created_at', { ascending: false })
    .limit(10);

  const groupLogs = (groups || []).map(g => ({
    timestamp: g.created_at || '',
    message: `Group #${g.group_number} (code: ${g.code}) was created.`,
    level: 'info',
  }));

  // Combine and sort by timestamp descending
  const logs = [...userLogs, ...groupLogs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return logs;
}