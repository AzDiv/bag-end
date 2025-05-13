import React from 'react';
import { X } from 'lucide-react';

interface MemberInfoModalProps {
  isOpen: boolean;
  member: any;
  loading: boolean;
  onClose: () => void;
}

const MemberInfoModal: React.FC<MemberInfoModalProps> = ({ isOpen, member, loading, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Member Info</h2>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : member ? (
          <div className="space-y-2">
            <div><span className="font-medium">Name:</span> {member.name}</div>
            <div><span className="font-medium">Email:</span> {member.email}</div>
            <div><span className="font-medium">Status:</span> {member.status}</div>
            <div><span className="font-medium">Joined:</span> {member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}</div>
            {/* Add more fields as needed */}
          </div>
        ) : (
          <div className="text-gray-500">No member data found.</div>
        )}
      </div>
    </div>
  );
};

export default MemberInfoModal;
