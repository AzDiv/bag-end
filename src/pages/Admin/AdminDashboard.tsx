import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { getDashboardStats, getPendingVerifications, updateUserStatus, createNextGroupIfEligible, findUsersMissingNextGroup, getUserById, getRecentAdminLogs } from '../../lib/supabase';
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
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    Promise.all([
      getDashboardStats(token),
      getPendingVerifications(token)
    ]).then(([stats, pendingUsers]) => {
      setStats(stats);
      setPendingUsers(pendingUsers);
      setLoading(false);
    });
    getRecentAdminLogs(token).then(logs => {
      setLogs(logs.map((log: any) => ({
        ...log,
        created_at: new Date(log.created_at)
      })));
    });
  }, []);

  const handleVerification = async (userId: string, status: 'active' | 'pending' | 'rejected') => {
    const token = localStorage.getItem('jwt_token');
    if (!token) return;
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const result = await updateUserStatus(userId, status, token);
      if (result.success) {
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        toast.success(`User ${status === 'active' ? 'verified' : status === 'rejected' ? 'rejected' : 'set to pending'} successfully`);

        // --- ADD THIS: If user is now active, check if their inviter (group owner) is eligible for next group ---
        if (status === 'active') {
          // Fetch the user to get their invite_code
          const token = localStorage.getItem('jwt_token');
          const user = await getUserById(userId, token!);
          if (user?.invite_code) {
            // Find the group owner by invite_code
            const groupOwnerId = user.invite_code; // Assuming invite_code is the group owner's ID
            await createNextGroupIfEligible(groupOwnerId, token!);
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
    const token = localStorage.getItem('jwt_token');
    const result = await findUsersMissingNextGroup(token!);
    setMissingGroups(result);
    setCheckingMissing(false);
  };

  const handleFixGroup = async (userId: string) => {
    const token = localStorage.getItem('jwt_token');
    await createNextGroupIfEligible(userId, token!);
  };

  if (!user || user.role !== 'admin') {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Accès refusé</h2>
            <p className="mt-2 text-gray-600">Vous n'avez pas la permission d'accéder à cette page.</p>
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
                    name: 'Utilisateurs inscrits',
                    value: stats.totalUsers,
                    icon: Users,
                    color: 'bg-blue-100 text-blue-600'
                  },
                  {
                    name: 'Utilisateurs actifs',
                    value: stats.activeUsers,
                    icon: UserCheck,
                    color: 'bg-green-100 text-green-600'
                  },
                  {
                    name: 'Vérifications en attente',
                    value: stats.pendingVerifications,
                    icon: Target,
                    color: 'bg-yellow-100 text-yellow-600'
                  },
                  {
                    name: 'Groupes créés',
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