// API client for backend
const API_URL = 'http://localhost:3000/api';

// Use correct types for parameters and fix fetch credentials type
async function apiCall(endpoint: string, method: string = 'GET', data?: any, token?: string): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
  const options: RequestInit = {
    method,
    headers,
    ...(data ? { body: JSON.stringify(data) } : {})
  };
  const response = await fetch(`${API_URL}${endpoint}`, options);
  const result = await response.json();
  return result;
}

export async function getUserByInviteCode(inviteCode: string) {
  return apiCall(`/users/invite/${inviteCode}`);
}

export async function getUserById(userId: string, token: string) {
  return apiCall(`/users/${userId}`, 'GET', undefined, token);
}

export async function getUserWithGroups(userId: string, token: string) {
  return apiCall(`/users/${userId}/with-groups`, 'GET', undefined, token);
}

export async function getPendingVerifications(token: string) {
  return apiCall('/users/pending', 'GET', undefined, token);
}

export async function updateUserStatus(userId: string, status: 'pending' | 'active' | 'rejected', token: string) {
  return apiCall(`/users/${userId}/status`, 'PUT', { status }, token);
}

export async function createGroupIfNeeded(_userId: string, _token: string) {
  // Not exposed directly; handled by backend after verification
  return { success: true };
}

export async function getGroupMembers(groupId: string, token: string) {
  return apiCall(`/groups/${groupId}/members`, 'GET', undefined, token);
}

export async function getDashboardStats(token: string) {
  return apiCall('/admin/stats', 'GET', undefined, token);
}

export async function confirmGroupMember(inviteId: string, token: string) {
  return apiCall('/groups/confirm-member', 'POST', { inviteId }, token);
}

export async function createNextGroupIfEligible(userId: string, token: string) {
  return apiCall('/groups/next-group', 'POST', { userId }, token);
}

export async function findUsersMissingNextGroup(token: string) {
  return apiCall('/admin/missing-next-group', 'GET', undefined, token);
}

export async function getRecentAdminLogs(token: string) {
  return apiCall('/admin/logs', 'GET', undefined, token);
}

export async function joinGroupAsExistingUser(userId: string, groupCode: string, token: string) {
  return apiCall('/groups/join', 'POST', { userId, groupCode }, token);
}

export async function getUserMe(token: string) {
  return apiCall('/me', 'GET', undefined, token);
}

export async function registerUser(email: string, password: string, name: string, inviteCode?: string, whatsapp?: string) {
  return apiCall('/auth/register', 'POST', { email, password, name, inviteCode, whatsapp });
}

export async function loginUser(email: string, password: string) {
  return apiCall('/auth/login', 'POST', { email, password });
}

export async function updateUserProfile(userId: string, updates: Partial<any>, token: string) {
  return apiCall(`/users/${userId}`, 'PUT', updates, token);
}

export async function selectPlan(userId: string, packType: 'starter' | 'gold', token: string) {
  return apiCall(`/users/${userId}/plan`, 'PUT', { packType }, token);
}

export async function getAllUsers(token: string) {
  return apiCall('/users', 'GET', undefined, token);
}