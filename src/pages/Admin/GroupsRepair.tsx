import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { findUsersMissingNextGroup, createNextGroupIfEligible } from '../../lib/supabase';
import toast from 'react-hot-toast';

const GroupsRepair: React.FC = () => {
  const [missingGroups, setMissingGroups] = useState<any[]>([]);
  const [checkingMissing, setCheckingMissing] = useState(false);

  const handleCheckMissingGroups = async () => {
    setCheckingMissing(true);
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      toast.error('Token manquant. Veuillez vous reconnecter.');
      setCheckingMissing(false);
      return;
    }
    const result = await findUsersMissingNextGroup(token);
    setMissingGroups(result);
    setCheckingMissing(false);
  };

  const handleFixGroup = async (userId: string) => {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      toast.error('Token manquant. Veuillez vous reconnecter.');
      return;
    }
    await createNextGroupIfEligible(userId, token);
    toast.success('Nouveau groupe créé (si éligible)');
    handleCheckMissingGroups();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Outil de réparation des groupes</h1>
        <div className="mb-6">
          <button
            className="btn btn-primary"
            onClick={handleCheckMissingGroups}
            disabled={checkingMissing}
          >
            {checkingMissing ? 'Vérification...' : 'Vérifier les groupes manquants'}
          </button>
          {missingGroups.length > 0 && (
            <div className="mt-4 bg-yellow-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Utilisateurs sans groupe suivant :</h4>
              <ul>
                {missingGroups.map(u => (
                  <li key={u.userId} className="mb-2 flex items-center justify-between">
                    <span>
                      {u.name} ({u.email}) - Dernier groupe : {u.lastGroupNumber}, Vérifiés: {u.verifiedCount}
                    </span>
                    <button
                      className="btn btn-success ml-4"
                      onClick={() => handleFixGroup(u.userId)}
                    >
                      Créer le groupe suivant
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GroupsRepair;
