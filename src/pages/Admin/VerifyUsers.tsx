import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import PendingUsersTable from '../../components/Admin/PendingUsersTable';
import { getPendingVerifications, updateUserStatus, getUserById, createNextGroupIfEligible } from '../../lib/supabase';
import toast from 'react-hot-toast';

const VerifyUsers: React.FC = () => {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('jwt_token');
        const result = await getPendingVerifications(token!);
        setPendingUsers(result.users || []);
      } catch (e) {
        toast.error('Échec du chargement des utilisateurs en attente');
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleVerification = async (userId: string, status: 'active' | 'rejected') => {
    setProcessingIds(prev => new Set(prev).add(userId));
    try {
      const token = localStorage.getItem('jwt_token');
      const result = await updateUserStatus(userId, status, token!);
      if (result.success) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId));
        toast.success(`Utilisateur ${status === 'active' ? 'vérifié' : 'rejeté'} avec succès`);
        if (status === 'active') {
          const token = localStorage.getItem('jwt_token');
          const user = await getUserById(userId, token!);
          if (user?.invite_code) {
            const groupOwnerId = await getUserById(user.invite_code, token!);
            if (groupOwnerId) {
              await createNextGroupIfEligible(groupOwnerId, token!);
            }
          }
        }
      }
    } catch (e) {
      toast.error('Échec de la mise à jour du statut de l\'utilisateur');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Vérifications d'utilisateurs en attente</h1>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <PendingUsersTable
            users={pendingUsers}
            processingIds={processingIds}
            onVerify={userId => handleVerification(userId, 'active')}
            onReject={userId => handleVerification(userId, 'rejected')}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default VerifyUsers;
