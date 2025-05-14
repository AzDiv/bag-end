import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats, getPendingVerifications, updateUserStatus, createNextGroupIfEligible, findUsersMissingNextGroup, getUserById, getRecentAdminLogs } from '../../lib/supabase';
import { supabase } from '../../lib/supabase';
import { User, AdminDashboardStats } from '../../types/database.types';
import { Users, UserCheck, Target, Award, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import AdminLogs, { LogEntry } from '../../components/Admin/AdminLogs';

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [missingGroups, setMissingGroups] = useState<any[]>([]);
  const [checkingMissing, setCheckingMissing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

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

  useEffect(() => {
    getRecentAdminLogs().then(logs => {
      // Convert logs to ensure level is of the correct type
      setLogs(logs.map(log => ({
        ...log,
        level: log.level as "error" | "info" | "warning" | undefined
      })));
    });
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

            {/* Replace Pending Verifications and Check for Missing Groups with logs */}
            <AdminLogs logs={logs} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;