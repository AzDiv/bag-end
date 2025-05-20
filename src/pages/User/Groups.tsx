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

  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        setLoading(true);
        const userData = await getUserWithGroups(user.id);
        if (userData && userData.groups) {
          setGroups(userData.groups);
          // Always select the latest group by default if none is selected or if the selected group is gone
          if (
            userData.groups.length > 0 &&
            (!selectedGroup || !userData.groups.some((g: GroupType) => g.id === selectedGroup))
          ) {
            setSelectedGroup(userData.groups[userData.groups.length - 1].id);
          }
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
        const groupMembers = await getGroupMembers(selectedGroup);
        // Map to include owner_confirmed in each member object
        setMembers(
          groupMembers
            .filter(member => member.referred_user !== null)
            .map(member => ({
              ...member.referred_user,
              owner_confirmed: member.owner_confirmed,
              invite_id: member.id // keep invite id for confirmation
            }))
        );
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
  const handleMemberClick = async (memberId: string) => {
    setMemberInfoLoading(true);
    const memberInfo = await getUserById(memberId);
    setSelectedMember(memberInfo);
    setMemberInfoLoading(false);
  };

  // Handler to confirm a member and trigger group progression
  const handleConfirmMember = async (inviteId: string) => {
    if (!user) return;
    await confirmGroupMember(inviteId);
    await createNextGroupIfEligible(user.id);
    // Refresh group and member state
    const userData = await getUserWithGroups(user.id);
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
      const groupMembers = await getGroupMembers(selectedGroup);
      setMembers(
        groupMembers
          .filter((member: any) => member.referred_user !== null)
          .map((member: any) => ({
            ...member.referred_user,
            owner_confirmed: member.owner_confirmed,
            invite_id: member.id
          }))
      );
    }
  };

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
                          {/* Circle visualization */}
                          <div className="relative w-72 h-72">
                            {/* Owner in center */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                              <div className="w-24 h-24 rounded-full bg-primary text-white flex flex-col items-center justify-center shadow-lg border-4 border-white">
                                <Users className="h-10 w-10 mb-1" />
                                <span className="text-xs font-semibold">Propriétaire</span>
                              </div>
                            </div>
                            {/* Members around in a circle, with extra vertical margin to avoid overlap with owner */}
                            {members.map((member, idx) => {
                              const angle = (2 * Math.PI * idx) / members.length;
                              const radius = 130;
                              // Add extra margin to avoid overlap with owner (shift up/down if near top/bottom)
                              let y = 144 + radius * Math.sin(angle) - 36;
                              // Only adjust if not exactly left or right
                              if (angle !== 0 && (angle < Math.PI / 2 || angle > 3 * Math.PI / 2)) y -= 18; // top
                              if (angle !== Math.PI && (angle > Math.PI / 2 && angle < 3 * Math.PI / 2)) y += 18; // bottom
                              const x = 144 + radius * Math.cos(angle) - 36;
                              return (
                                <div
                                  key={member.id}
                                  className="absolute flex flex-col items-center"
                                  style={{ left: `${x}px`, top: `${y}px` }}
                                  onClick={() => handleMemberClick(member.id)}
                                >
                                  <div className={`w-18 h-18 rounded-full flex items-center justify-center shadow-md border-4 ${member.owner_confirmed ? 'border-green-400 bg-green-50' : member.status === 'rejected' ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-100'} cursor-pointer hover:scale-105 transition-transform`}>
                                    <Users className={`h-8 w-8 ${member.owner_confirmed ? 'text-green-600' : member.status === 'rejected' ? 'text-red-500' : 'text-gray-500'}`} />
                                  </div>
                                  <span className="text-xs mt-1 mb-1 text-gray-700 truncate max-w-[100px] text-center">{member.name}</span>
                                  {member.status === 'rejected' ? (
                                    <span className="text-red-500 text-xs font-semibold whitespace-nowrap mt-1 flex items-center">
                                      <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-12.728 12.728M5.636 5.636l12.728 12.728" />
                                      </svg>
                                      Rejeté
                                    </span>
                                  ) : member.owner_confirmed ? (
                                    <span className="text-green-500 text-xs font-semibold whitespace-nowrap mt-1">✔ Confirmé</span>
                                  ) : (
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
                            })}
                          </div>
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