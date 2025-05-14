import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Share2 } from 'lucide-react';
import { Group } from '../../types/database.types';
import toast from 'react-hot-toast';

interface GroupCardProps {
  group: Group;
  memberCount: number;
  verifiedCount: number;
  onShareLink: (groupCode: string) => void;
  packType: 'starter' | 'gold';
}

const GroupCard: React.FC<GroupCardProps> = ({
  group,
  memberCount,
  verifiedCount,
  onShareLink,
  packType,
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

  // Badge value logic
  let badgeValue = '';
  if (packType === 'gold') {
    badgeValue = group.group_number === 1 ? '50$' : group.group_number === 2 ? '100$' : group.group_number === 3 ? '200$' : '';
  } else {
    badgeValue = group.group_number === 1 ? '10$' : group.group_number === 2 ? '20$' : group.group_number === 3 ? '30$' : '';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-card rounded-xl shadow-md overflow-hidden${isCompleted ? ' ring-2 ring-success' : ''}`}
    >
      <div className="px-6 py-5 border-b border-secondary">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-text-primary">{levelName}</h3>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary">{badgeValue}</span>
            {isCompleted && (
              <span className="badge bg-success text-white ml-2">Completed</span>
            )}
          </div>
        </div>
        <p className="mt-1 text-sm text-text-secondary">
          Group Code: <span className="font-medium">{group.code}</span>
        </p>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-text-secondary" />
            <span className="ml-2 text-sm text-text-secondary">
              Members: <span className="font-semibold">{memberCount}</span>
            </span>
          </div>
          <div className="flex items-center">
            <UserPlus className="h-5 w-5 text-success" />
            <span className="ml-2 text-sm text-text-secondary">
              Verified: <span className="font-semibold">{verifiedCount}</span>
            </span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">Progress to Next Level</span>
            <span className="text-xs font-medium text-text-primary">{verifiedCount}/4</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${Math.min((verifiedCount / 4) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-secondary-light flex justify-between">
        <button
          onClick={() => onShareLink(group.code)}
          className="flex items-center px-3 py-1.5 text-sm text-text-primary bg-card border border-secondary rounded-md hover:bg-secondary-light"
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