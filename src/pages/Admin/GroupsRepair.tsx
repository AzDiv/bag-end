import React, { useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { findUsersMissingNextGroup, createNextGroupIfEligible } from '../../lib/supabase';
import toast from 'react-hot-toast';

const GroupsRepair: React.FC = () => {
  const [missingGroups, setMissingGroups] = useState<any[]>([]);
  const [checkingMissing, setCheckingMissing] = useState(false);

  const handleCheckMissingGroups = async () => {
    setCheckingMissing(true);
    const result = await findUsersMissingNextGroup();
    setMissingGroups(result);
    setCheckingMissing(false);
  };

  const handleFixGroup = async (userId: string) => {
    await createNextGroupIfEligible(userId);
    toast.success('Next group created (if eligible)');
    handleCheckMissingGroups();
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Groups Repair Tool</h1>
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
    </DashboardLayout>
  );
};

export default GroupsRepair;
