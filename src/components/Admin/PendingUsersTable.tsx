import React from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle } from 'lucide-react';

interface PendingUser {
  id: string;
  name: string;
  email: string;
  pack_type: 'starter' | 'gold' | null;
  created_at: string;
  referred_by: string | null;
  whatsapp?: string;
}

interface PendingUsersTableProps {
  users: PendingUser[];
  processingIds: Set<string>;
  onVerify: (userId: string) => void;
  onReject: (userId: string) => void;
}

const PendingUsersTable: React.FC<PendingUsersTableProps> = ({ users, processingIds, onVerify, onReject }) => (
  <div className="overflow-x-auto">
    {users.length === 0 ? (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">No pending verifications</p>
      </div>
    ) : (
      <>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Referred By</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WhatsApp</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, idx) => (
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
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onVerify(user.id)}
                      disabled={processingIds.has(user.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verify
                    </button>
                    <button
                      onClick={() => onReject(user.id)}
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
        {/* Pagination placeholder */}
        <div className="flex justify-end mt-4">
          <button className="px-3 py-1 text-xs bg-gray-200 rounded mr-2" disabled>Prev</button>
          <button className="px-3 py-1 text-xs bg-gray-200 rounded" disabled>Next</button>
        </div>
      </>
    )}
  </div>
);

export default PendingUsersTable;
