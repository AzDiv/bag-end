import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { getUserWithGroups, getGroupMembers, getUserById, confirmGroupMember, createNextGroupIfEligible } from '../../lib/supabase';
import { Group as GroupType } from '../../types/database.types';
import GroupCard from '../../components/UI/GroupCard';
import ShareModal from '../../components/UI/ShareModal';
import MemberInfoModal from '../../components/UI/MemberInfoModal';
import { Users, UserPlus } from 'lucide-react';

const Groups: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<GroupType[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedGroupCode, setSelectedGroupCode] = useState('');
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [memberInfoLoading, setMemberInfoLoading] = useState(false);
  console.log(members.map(m => ({ name: m.name, status: m.status })));
  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        setLoading(true);
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          // Handle missing token: show error, redirect, or return
          console.error('No JWT token found. User may need to log in again.');
          setLoading(false);
          return;
        }
        const userData = await getUserWithGroups(user.id, token);
        // Accept both { user: { groups: [...] } } and { groups: [...] }
        let groupsArr = [];
        if (userData && Array.isArray(userData.groups)) {
          groupsArr = userData.groups;
        } else if (userData && userData.user && Array.isArray(userData.user.groups)) {
          groupsArr = userData.user.groups;
        }
        setGroups(groupsArr);
        // Always select the latest group by default if none is selected or if the selected group is gone
        if (
          groupsArr.length > 0 &&
          (!selectedGroup || !groupsArr.some((g: GroupType) => g.id === selectedGroup))
        ) {
          setSelectedGroup(groupsArr[groupsArr.length - 1].id);
        }
        setLoading(false);
      }
    };
    fetchGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (selectedGroup) {
        setMembersLoading(true);
        const token = localStorage.getItem('jwt_token');
        if (!token) {
          console.error('No JWT token found. User may need to log in again.');
          setMembers([]);
          setMembersLoading(false);
          return;
        }
        const groupMembersResp = await getGroupMembers(selectedGroup, token);
        let groupMembers = [];
        if (groupMembersResp && Array.isArray(groupMembersResp)) {
          groupMembers = groupMembersResp;
        } else if (groupMembersResp && Array.isArray(groupMembersResp.members)) {
          groupMembers = groupMembersResp.members;
        }
        setMembers(groupMembers);
        setMembersLoading(false);
      }
    };
    
    fetchMembers();
  }, [selectedGroup]);
  
  const handleShareGroup = (groupCode: string) => {
    setSelectedGroupCode(groupCode);
    setShareModalOpen(true);
  };

  // Handler to fetch member info and open modal
  const handleMemberClick = (member: any) => {
    if (!member || !member.id) {
      console.error('handleMemberClick called with undefined member or member.id');
      setSelectedMember(null);
      setMemberInfoLoading(false);
      return;
    }
    setSelectedMember(member);
    setMemberInfoLoading(false);
  };

  // Handler to confirm a member and trigger group progression
  const handleConfirmMember = async (inviteId: string) => {
    if (!user) return;
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('No JWT token found. User may need to log in again.');
      return;
    }
    await confirmGroupMember(inviteId, token);
    await createNextGroupIfEligible(user.id, token);
    // Refresh group and member state
    const userData = await getUserWithGroups(user.id, token);
    if (userData && userData.groups) {
      setGroups(userData.groups);
      if (
        userData.groups.length > 0 &&
        (!selectedGroup || !userData.groups.some((g: GroupType) => g.id === selectedGroup))
      ) {
        setSelectedGroup(userData.groups[userData.groups.length - 1].id);
      }
    }
    if (selectedGroup) {
      const groupMembers = await getGroupMembers(selectedGroup, token);
      setMembers(groupMembers);
    }
  };

  const renderMember = (member: any, positionClass: string) => (
    <div
      className={`absolute ${positionClass} flex flex-col items-center cursor-pointer`}
      onClick={() => handleMemberClick(member)}
      key={member.id}
    >
      <div
        className={`w-24 h-24 rounded-lg flex items-center justify-center shadow-md border-4 ${
          member.owner_confirmed
            ? 'border-green-400 bg-green-50'
            : member.status === 'rejected'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 bg-gray-100'
        }`}
      >
        <Users className={`h-10 w-10 ${
          member.owner_confirmed
            ? 'text-green-600'
            : member.status === 'rejected'
            ? 'text-red-500'
            : 'text-gray-500'
        }`} />
      </div>
      <span
        className="text-sm mt-2 text-gray-700 max-w-[80px] w-20 truncate text-center overflow-hidden whitespace-nowrap block"
        title={member.name}
      >
        {member.name}
      </span>
      {member.status === 'rejected' ? (
        <span className="text-red-500 text-xs font-semibold whitespace-nowrap mt-1 flex items-center">
          <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
          </svg>
          Rejeté
        </span>
      ) : member.owner_confirmed ? null : (
        user && groups.find(g => g.id === selectedGroup)?.owner_id === user.id && (
          <button
            className="mt-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark whitespace-nowrap"
            onClick={e => {
              e.stopPropagation();
              handleConfirmMember(member.invite_id);
            }}
          >
            Confirmer
          </button>
        )
      )}
    </div>
  );

  const mainMembers = [
    ...members.filter(m => m.status !== 'rejected').slice(0, 4),
    ...members.filter(m => m.status === 'rejected').slice(0, 4 - members.filter(m => m.status !== 'rejected').length)
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Mes groupes</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe pour le moment</h3>
                <p className="text-gray-600 mb-6">
                  Vous obtiendrez automatiquement votre premier groupe une fois votre compte vérifié.
                </p>
                {user?.status === 'pending' && (
                  <p className="text-blue-600">
                    Votre compte est en attente de vérification. Veuillez patienter.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {/* Groups List */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">Vos groupes</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-200">
                      {groups.map((group) => (
                        <button
                          key={group.id}
                          onClick={() => setSelectedGroup(group.id)}
                          className={`w-full text-left px-6 py-4 focus:outline-none ${
                            selectedGroup === group.id ? 'bg-indigo-50' : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg ${
                              selectedGroup === group.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Users className="h-5 w-5" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium text-gray-900">
                                Groupe niveau  {group.group_number}
                              </h4>
                              <p className="text-sm text-gray-500">Code : {group.code}</p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Group Members */}
                <div className="md:col-span-2">
                  {selectedGroup && (
                    <motion.div 
                      key={selectedGroup}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white rounded-xl shadow-md overflow-hidden"
                    >
                      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="text-lg font-medium text-gray-900">
                          Membres du groupe
                        </h3>
                        <button
                          onClick={() => {
                            const group = groups.find(g => g.id === selectedGroup);
                            if (group) handleShareGroup(group.code);
                          }}
                          className="flex items-center text-sm text-primary hover:text-primary-dark"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Inviter
                        </button>
                      </div>
                      
                      {membersLoading ? (
                        <div className="flex justify-center items-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center py-8">
                          {/* SQUARE GRID visualization */}
                          <div className="relative w-96 h-96 mx-auto my-8">
                            {/* Top-left member (corner) */}
                            {mainMembers[0] && renderMember(mainMembers[0], "top-0 left-0")}

                            {/* Top-right member (corner) */}
                            {mainMembers[1] && renderMember(mainMembers[1], "top-0 right-0")}

                            {/* Bottom-right member (corner) */}
                            {mainMembers[2] && renderMember(mainMembers[2], "bottom-0 right-0")}

                            {/* Bottom-left member (corner) */}
                            {mainMembers[3] && renderMember(mainMembers[3], "bottom-0 left-0")}
                            {members.length > 4 &&
  members.slice(4).filter(m => m.status === 'rejected').slice(0, 4).map((member, idx) => {
    const positions = [
      "left-1/2 top-0 -translate-x-1/2",      // top of owner
      "top-1/2 right-0 -translate-y-1/2",     // right of owner
      "left-1/2 bottom-0 -translate-x-1/2",   // bottom of owner
      "top-1/2 left-0 -translate-y-1/2",      // left of owner
    ];
    return (
      <div
        key={member.id}
        className={`absolute ${positions[idx]} flex flex-col items-center z-20`}
        onClick={() => handleMemberClick(member)}
      >
        <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-md border-4 border-red-400 bg-red-50">
          <Users className="h-6 w-6 text-red-500" />
        </div>
        <span
          className="text-xs mt-1 text-red-500 max-w-[60px] w-14 truncate text-center overflow-hidden whitespace-nowrap block"
          title={member.name}
        >
          {member.name}
          
        </span>
        <span className="text-red-500 text-[10px] font-semibold whitespace-nowrap mt-0.5 flex items-center">
          Rejeté
        </span>
      </div>
    );
  })
}
                            {/* Owner in the center */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                              <div className="w-28 h-28 rounded-lg bg-primary text-white flex flex-col items-center justify-center shadow-lg border-4 border-white">
                                <Users className="h-12 w-12 mb-1" />
                                <span className="text-base font-semibold">Propriétaire</span>
                              </div>
                            </div>
                          </div>
                          {selectedGroup && (
                            <div className="mt-4 text-gray-600 text-sm text-center">
                              Créé le :{' '}
                              {(() => {
                                const group = groups.find(g => g.id === selectedGroup);
                                if (group && group.created_at) {
                                   const date = new Date(group.created_at);
                                   return date.toLocaleDateString();
                                }
                                return 'N/A';
                              })()}
                            </div>
             )}
                          {members.length === 0 && (
                            <div className="text-gray-400 mt-8">Aucun membre dans ce groupe pour le moment. Commencez à inviter des personnes !</div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Share Modal */}
        <ShareModal 
          groupCode={selectedGroupCode} 
          isOpen={shareModalOpen} 
          onClose={() => setShareModalOpen(false)} 
        />

        {/* Member Info Modal */}
        <MemberInfoModal
          isOpen={!!selectedMember}
          member={selectedMember}
          loading={memberInfoLoading}
          onClose={() => setSelectedMember(null)}
        />
      </div>
    </DashboardLayout>
  );
};

export default Groups;

