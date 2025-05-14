import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats, getPendingVerifications, updateUserStatus, createNextGroupIfEligible, findUsersMissingNextGroup, getUserById } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { User, AdminDashboardStats } from '../../types/database.types';
import { Users, UserCheck, Target, Award, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [missingGroups, setMissingGroups] = useState<any[]>([]);
  const [checkingMissing, setCheckingMissing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsData, pendingData] = await Promise.all([
          getDashboardStats(),
          getPendingVerifications()
        ]);
        
        setStats(statsData);
        setPendingUsers(pendingData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Refresh data every 120 seconds
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, []);

  const handleVerification = async (userId: string, status: 'active' | 'pending' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const success = await updateUserStatus(userId, status);

      if (success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        toast.success(`User ${status === 'active' ? 'verified' : status === 'rejected' ? 'rejected' : 'set to pending'} successfully`);

        // --- ADD THIS: If user is now active, check if their inviter (group owner) is eligible for next group ---
        if (status === 'active') {
          // Fetch the user to get their invite_code
          const user = await getUserById(userId);
          if (user?.invite_code) {
            // Find the group owner by invite_code
            const { data: group } = await supabase
              .from('groups')
              .select('owner_id')
              .eq('code', user.invite_code)
              .single();
            if (group?.owner_id) {
              await createNextGroupIfEligible(group.owner_id);
            }
          }
        }
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  const handleCheckMissingGroups = async () => {
    setCheckingMissing(true);
    const result = await findUsersMissingNextGroup();
    setMissingGroups(result);
    setCheckingMissing(false);
  };

  const handleFixGroup = async (userId: string) => {
    await createNextGroupIfEligible(userId);
    toast.success('Next group created (if eligible)');
    // Optionally refresh missingGroups
    handleCheckMissingGroups();
  };

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="mt-2 text-gray-600">You don't have permission to view this page.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Overview */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    name: 'Total Users',
                    value: stats.totalUsers,
                    icon: Users,
                    color: 'bg-blue-100 text-blue-600'
                  },
                  {
                    name: 'Active Users',
                    value: stats.activeUsers,
                    icon: UserCheck,
                    color: 'bg-green-100 text-green-600'
                  },
                  {
                    name: 'Pending Verifications',
                    value: stats.pendingVerifications,
                    icon: Target,
                    color: 'bg-yellow-100 text-yellow-600'
                  },
                  {
                    name: 'Total Groups',
                    value: stats.totalGroups,
                    icon: Award,
                    color: 'bg-purple-100 text-purple-600'
                  }
                ].map((stat, idx) => (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-6"
                  >
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${stat.color}`}>
                        <stat.icon className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Pending Verifications */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Pending Verifications</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Review and verify user payments
                </p>
              </div>

              <div className="overflow-x-auto">
                {pendingUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No pending verifications</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Plan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Joined
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Referred By
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          WhatsApp
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {pendingUsers.map((user, idx) => (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: idx * 0.05 }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-500" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.pack_type === 'gold' 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.pack_type === 'gold' ? 'Gold' : 'Starter'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.referred_by || 'Direct'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.whatsapp || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleVerification(user.id, 'active')}
                                disabled={processingIds.has(user.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Verify
                              </button>
                              <button
                                onClick={() => handleVerification(user.id, 'rejected')}
                                disabled={processingIds.has(user.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="mb-6">
              <button
                className="btn btn-primary"
                onClick={handleCheckMissingGroups}
                disabled={checkingMissing}
              >
                {checkingMissing ? 'Checking...' : 'Check for Missing Groups'}
              </button>
              {missingGroups.length > 0 && (
                <div className="mt-4 bg-yellow-50 p-4 rounded">
                  <h4 className="font-semibold mb-2">Users missing next group:</h4>
                  <ul>
                    {missingGroups.map(u => (
                      <li key={u.userId} className="mb-2 flex items-center justify-between">
                        <span>
                          {u.name} ({u.email}) - Last Group: {u.lastGroupNumber}, Verified: {u.verifiedCount}
                        </span>
                        <button
                          className="btn btn-success ml-4"
                          onClick={() => handleFixGroup(u.userId)}
                        >
                          Create Next Group
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;