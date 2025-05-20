import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import { getUserWithGroups } from '../../lib/supabase';
import { Link, Share2, Copy, Gift } from 'lucide-react';
import toast from 'react-hot-toast';
import { Group } from '../../types/database.types';

const Invite: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [copyStatus, setCopyStatus] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        setLoading(true);
        const userData = await getUserWithGroups(user.id);
        
        if (userData && userData.groups) {
          setGroups(userData.groups);
          
          if (userData.groups.length > 0) {
            setSelectedGroup(userData.groups[userData.groups.length - 1]);
          }
        }
        
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, [user]);
  
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(prev => ({ ...prev, [type]: true }));
    toast.success('Copied to clipboard!');
    
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [type]: false }));
    }, 2000);
  };
  
  const generateInviteLink = (code: string) => {
    return `${window.location.origin}/join?code=${code}`;
  };
  
  const shareInvite = async () => {
    if (!selectedGroup) return;
    
    const inviteUrl = generateInviteLink(selectedGroup.code);
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Boom Bag group!',
          text: 'I invite you to join my Boom Bag group',
          url: inviteUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard(inviteUrl, 'link');
      }
    } else {
      copyToClipboard(inviteUrl, 'link');
    }
  };
  
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Inviter des membres</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {groups.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-6 text-center">
                <Gift className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun groupe disponible</h3>
                <p className="text-gray-600 mb-6">
                  Vous devez être vérifié et avoir au moins un groupe pour inviter des membres.
                </p>
                {user?.status === 'pending' && (
                  <p className="text-blue-600">
                    Votre compte est en attente de vérification. Une fois vérifié, vous obtiendrez automatiquement votre premier groupe.
                  </p>
                )}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="px-6 py-5 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Partager votre invitation</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Invitez des amis à rejoindre votre groupe et progressez ensemble
                  </p>
                </div>
                
                <div className="px-6 py-5">
                  {selectedGroup && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Lien d'invitation</h3>
                        <div className="flex items-center">
                          <div className="flex-1 flex items-center border border-gray-300 rounded-l-md py-2 px-3 bg-gray-50">
                            <Link className="h-5 w-5 text-gray-400 mr-2" />
                            <input
                              type="text"
                              readOnly
                              className="block w-full min-w-0 flex-1 bg-gray-50 border-0 focus:ring-0 sm:text-sm"
                              value={generateInviteLink(selectedGroup.code)}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(generateInviteLink(selectedGroup.code), 'link')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 border-l-0 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            <Copy className={`h-4 w-4 mr-2 ${copyStatus['link'] ? 'text-green-500' : 'text-gray-500'}`} />
                            {copyStatus['link'] ? 'Copié' : 'Copier'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Code d'invitation</h3>
                        <div className="flex items-center">
                          <div className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 bg-gray-50 text-center font-mono">
                            {selectedGroup.code}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(selectedGroup.code, 'code')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 border-l-0 rounded-r-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                          >
                            <Copy className={`h-4 w-4 mr-2 ${copyStatus['code'] ? 'text-green-500' : 'text-gray-500'}`} />
                            {copyStatus['code'] ? 'Copié !' : 'Copier'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <button
                          type="button"
                          onClick={shareInvite}
                          className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Partager l'invitation
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="px-6 py-4 bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">How It Works</h3>
                  <ol className="list-decimal list-inside text-gray-600 space-y-1 text-sm">
                    <li>Share your invite link or code with friends</li>
                    <li>When they sign up using your invite, they'll be part of your group</li>
                    <li>Once they get verified, you'll progress towards the next level</li>
                    <li>Every 4 verified members helps you advance to the next level</li>
                  </ol>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Invite;