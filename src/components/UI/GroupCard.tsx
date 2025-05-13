import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Share2 } from 'lucide-react';
import { Group } from '../../types/database.types';
import toast from 'react-hot-toast';

interface GroupCardProps {
  group: Group;
  memberCount: number;
  verifiedCount: number;
  progress?: number;
  onShareLink: (groupCode: string) => void;
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  memberCount,
  verifiedCount,
  progress = 0,
  onShareLink,
}) => {
  const levelName = group.group_number === 1 
    ? 'First Level' 
    : group.group_number === 2 
      ? 'Second Level' 
      : 'Third Level';

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join?code=${group.code}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard!');
  };

  const isCompleted = verifiedCount >= 4;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-xl shadow-md overflow-hidden${isCompleted ? ' ring-2 ring-green-400' : ''}`}
    >
      <div className="px-6 py-5 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">{levelName}</h3>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary">{group.group_number * 10+"$"}</span>
            {isCompleted && (
              <span className="badge bg-green-500 text-white ml-2">Completed</span>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          Group Code: <span className="font-medium">{group.code}</span>
        </p>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">
              Members: <span className="font-semibold">{memberCount}</span>
            </span>
          </div>
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-green-500" />
            <span className="ml-2 text-sm text-gray-500">
              Verified: <span className="font-semibold">{verifiedCount}</span>
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Progress to Next Level</span>
            <span className="text-xs font-medium text-gray-700">{verifiedCount}/4</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((verifiedCount / 4) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-gray-50 flex justify-between">
        <button
          onClick={() => onShareLink(group.code)}
          className="flex items-center px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <Share2 className="h-4 w-4 mr-1" />
          Share
        </button>
        
        <button
          onClick={copyInviteLink}
          className="px-3 py-1.5 text-sm text-white bg-primary rounded-md hover:bg-primary-dark"
        >
          Copy Invite Link
        </button>
      </div>
    </motion.div>
  );
};

export default GroupCard;