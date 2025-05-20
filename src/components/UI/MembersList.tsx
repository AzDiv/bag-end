import React from 'react';
import { motion } from 'framer-motion';
import { User, Clock, Check, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

interface Member {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'active' | 'rejected';
  created_at: string;
  owner_confirmed?: boolean;
  invite_id?: string;
  whatsapp?: string;
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
  emptyMessage = 'Aucun membre trouvé',
  onMemberClick,
  onConfirmMember,
  isOwner = false
}) => {
  if (!members.length) {
    return (
      <div className="text-center py-10">
        <User className="h-10 w-10 mx-auto text-secondary" />
        <p className="mt-2 text-text-secondary">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <ul className="divide-y divide-secondary">
        {members.map((member, idx) => (
          <motion.li
            key={member.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.05 }}
            className={
              `px-4 py-4 sm:px-6 cursor-pointer hover:bg-secondary-light ` +
              (member.owner_confirmed === false ? 'text-text-primary' : 'text-success')
            }
            onClick={() => onMemberClick && onMemberClick(member.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-5 w-5 text-secondary" />
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-text-primary">{member.name}</div>
                  <div className="text-sm text-text-secondary">{member.email}</div>
                  <div className="text-sm text-text-secondary">{member.whatsapp ? `WhatsApp : ${member.whatsapp}` : ''}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={clsx(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                    member.status === 'active'
                      ? 'bg-success text-success'
                      : member.status === 'rejected'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-secondary-light text-secondary-dark'
                  )}
                >
                  {member.status === 'active' ? (
                    <>
                      <Check className="mr-1 h-3 w-3" />
                      Vérifié
                    </>
                  ) : member.status === 'rejected' ? (
                    <>
                      <AlertCircle className="mr-1 h-3 w-3" />
                      Rejeté
                    </>
                  ) : (
                    <>
                      <Clock className="mr-1 h-3 w-3" />
                      En attente
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
                <div className="ml-4 text-xs text-text-secondary">
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