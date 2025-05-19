import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { supabase } from '../../lib/supabase';
import { Users as UsersIcon, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  name: string;
  email: string;
  pack_type: 'starter' | 'gold' | null;
  created_at: string;
  referred_by: string | null;
  whatsapp?: string;
  status?: 'pending' | 'active' | 'rejected';
}

const statusOptions = [
  { value: 'active', label: 'Actif', color: 'bg-green-100 text-green-800' },
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'rejected', label: 'Rejeté', color: 'bg-red-100 text-red-800' },
];

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusEditId, setStatusEditId] = useState<string | null>(null);
  const [statusEditValue, setStatusEditValue] = useState<'active' | 'pending' | 'rejected' | undefined>(undefined);
  const [savingStatus, setSavingStatus] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('users')
          .select('id, name, email, pack_type, created_at, referred_by, whatsapp, status')
          .order('created_at', { ascending: false })
          .limit(50);
        if (search.trim()) {
          // Search by email, whatsapp, or name (case-insensitive)
          query = query.or(`email.ilike.%${search}%,whatsapp.ilike.%${search}%,name.ilike.%${search}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        setUsers(data || []);
      } catch (e) {
        // Optionally use toast here
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search]);

  const handleStatusClick = (userId: string, currentStatus: 'active' | 'pending' | 'rejected' | undefined) => {
    setStatusEditId(userId);
    setStatusEditValue(currentStatus);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusEditValue(e.target.value as 'active' | 'pending' | 'rejected');
  };

  const handleStatusSave = async (userId: string) => {
    if (!statusEditValue) return;
    if (!window.confirm(`Êtes-vous sûr de vouloir changer le statut de cet utilisateur en "${statusEditValue}" ?`)) return;
    setSavingStatus(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: statusEditValue })
        .eq('id', userId);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: statusEditValue } : u));
      toast.success('Statut de l\'utilisateur mis à jour');
      setStatusEditId(null);
    } catch (e) {
      toast.error('Échec de la mise à jour du statut utilisateur');
    } finally {
      setSavingStatus(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Derniers utilisateurs</h1>
        <div className="mb-4 flex justify-end">
          <input
            type="text"
            className="input w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Rechercher par nom, email ou WhatsApp..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-gray-500">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inscrit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parrainé par</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-5 w-5 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.pack_type === 'gold' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
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
                      {statusEditId === user.id ? (
                        <div className="flex items-center space-x-2 justify-end">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={statusEditValue}
                            onChange={handleStatusChange}
                            disabled={savingStatus}
                          >
                            {statusOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label === 'Active' ? 'Actif' : opt.label === 'Pending' ? 'En attente' : opt.label === 'Rejected' ? 'Rejeté' : opt.label}</option>
                            ))}
                          </select>
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={() => handleStatusSave(user.id)}
                            disabled={savingStatus}
                          >
                            Enregistrer
                          </button>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setStatusEditId(null)}
                            disabled={savingStatus}
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${statusOptions.find(opt => opt.value === user.status)?.color}`}
                          onClick={() => handleStatusClick(user.id, user.status)}
                          title="Cliquer pour changer le statut"
                        >
                          {user.status === 'active' ? 'actif' : user.status === 'pending' ? 'en attente' : user.status === 'rejected' ? 'rejeté' : user.status}
                          {/*{user.status ? statusOptions.find(opt => opt.value === user.status)?.label : 'En attente'} */}
                          <Pencil className="ml-1 h-3 w-3 text-gray-400 inline" />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Users;
