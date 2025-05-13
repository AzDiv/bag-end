import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active';
  created_at: string;
  owner_confirmed?: boolean;
  invite_id?: string;
}

interface MembersListProps {
  members: Member[];
  emptyMessage?: string;
  onMemberClick?: (memberId: string) => void;
  onConfirmMember?: (inviteId: string) => void;
  isOwner?: boolean;
}

const MembersList: React.FC<MembersListProps> = ({ 
  members, 
  emptyMessage = 'No members found',
  onMemberClick,
  onConfirmMember,
  isOwner = false
}) => {
  if (!members.length) {
    return (
      <div className="text-center py-10">
        <User className="h-10 w-10 mx-auto text-gray-400" />
        <p className="mt-2 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {members.map((member, idx) => (
          <motion.li
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={
              `px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-50 ` +
              (member.owner_confirmed === false ? 'text-black' : 'text-green-700')
            }
            onClick={() => onMemberClick && onMemberClick(member.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  <div className="text-sm text-gray-500">{member.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    member.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  {member.status === 'active' ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="mr-1 h-3 w-3" />
                      Pending
                    </>
                  )}
                </span>
                {isOwner && member.owner_confirmed === false && member.invite_id && (
                  <button
                    className="ml-2 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                    onClick={e => {
                      e.stopPropagation();
                      onConfirmMember && onConfirmMember(member.invite_id!);
                    }}
                  >
                    Confirm
                  </button>
                )}
                <div className="ml-4 text-xs text-gray-500">
                  {new Date(member.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default MembersList;