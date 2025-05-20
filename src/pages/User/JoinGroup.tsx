import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { supabase, joinGroupAsExistingUser } from '../../lib/supabase';

const JoinGroup: React.FC = () => {
  const { user, refreshUser } = useAuthStore();
  const [memberGroups, setMemberGroups] = useState<any[]>([]);
  const [fetchingGroups, setFetchingGroups] = useState(false);
  const [groupInput, setGroupInput] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinSuccess, setJoinSuccess] = useState('');

  useEffect(() => {
    const fetchMemberGroups = async () => {
      if (!user) return;
      setFetchingGroups(true);
      // Find all groups where user is a member (via invites), but not owner
      const { data, error } = await supabase
        .from('invites')
        .select('group_id, groups:group_id(id, code, group_number, owner_id)')
        .eq('referred_user_id', user.id)
        .neq('groups.owner_id', user.id); // Only groups where user is not owner
      if (!error && data) {
        // Remove duplicates (if any)
        const uniqueGroups = Array.from(
          new Map(
            data
              .filter((row: any) => row.groups)
              .map((row: any) => [row.groups.id, row.groups])
          ).values()
        );
        setMemberGroups(uniqueGroups);
      }
      setFetchingGroups(false);
    };
    fetchMemberGroups();
  }, [user]);

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setJoinSuccess('');
    if (!user) {
      setJoinError('Utilisateur non connecté.');
      return;
    }
    if (!groupInput.trim()) {
      setJoinError('Veuillez entrer un code de groupe.');
      return;
    }
    const result = await joinGroupAsExistingUser(user.id, groupInput.trim());
    if (!result.success) setJoinError(result.error || 'Erreur inconnue');
    else {
      setJoinSuccess('Demande envoyée ou groupe rejoint !');
      setGroupInput('');
      await refreshUser();
      setTimeout(() => setJoinSuccess(''), 2000);
      // Refresh the list
      const { data, error } = await supabase
        .from('invites')
        .select('group_id, groups:group_id(id, code, group_number, owner_id)')
        .eq('referred_user_id', user.id)
        .neq('groups.owner_id', user.id); // Only groups where user is not owner
      if (!error && data) {
        const uniqueGroups = Array.from(
          new Map(
            data
              .filter((row: any) => row.groups)
              .map((row: any) => [row.groups.id, row.groups])
          ).values()
        );
        setMemberGroups(uniqueGroups);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto py-10">
        <h1 className="text-2xl font-bold mb-6">Groupes où vous êtes membre</h1>
        <div className="bg-white rounded shadow p-4 mb-6">
          {fetchingGroups ? (
            <div className="text-gray-500 text-sm">Chargement...</div>
          ) : memberGroups.length === 0 ? (
            <div className="text-gray-500 text-sm">Aucun groupe trouvé.</div>
          ) : (
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Code</th>
                  <th className="px-4 py-2 border">Niveau</th>
                </tr>
              </thead>
              <tbody>
                {memberGroups.map((g) => (
                  <tr key={g.id}>
                    <td className="px-4 py-2 border font-mono">{g.code}</td>
                    <td className="px-4 py-2 border">{g.group_number}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <form onSubmit={handleJoinGroup} className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Rejoindre un groupe</h2>
          <input
            type="text"
            className="input w-full mb-2 border border-gray-200 rounded px-3 py-2"
            placeholder="Entrer un code de groupe"
            value={groupInput}
            onChange={e => setGroupInput(e.target.value)}
          />
          {joinError && <div className="text-red-500 text-sm mb-2">{joinError}</div>}
          {joinSuccess && <div className="text-green-600 text-sm mb-2">{joinSuccess}</div>}
          <button type="submit" className="btn-primary w-full">Rejoindre</button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default JoinGroup;
