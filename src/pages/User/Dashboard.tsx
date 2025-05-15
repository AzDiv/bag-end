import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import PlanSelection from '../../components/UI/PlanSelection';
import ProgressStats from '../../components/UI/ProgressStats';
import GroupCard from '../../components/UI/GroupCard';
import ShareModal from '../../components/UI/ShareModal';
import { getUserWithGroups } from '../../lib/supabase';
import { UserWithGroupDetails, Group } from '../../types/database.types';
import { Share2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserWithGroupDetails | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedGroupCode, setSelectedGroupCode] = useState('');
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        setLoading(true);
        const userData = await getUserWithGroups(user.id);
        setUserData(userData);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);
  
  useEffect(() => {
    // Remove or increase the interval duration
    // Or remove this effect entirely if not needed
    // const interval = setInterval(() => {
    //   refreshUser();
    // }, 60000); // every minute

    // return () => clearInterval(interval);
  }, [refreshUser]);
  
  const handleShareGroup = (groupCode: string) => {
    setSelectedGroupCode(groupCode);
    setShareModalOpen(true);
  };
  
  // Show plan selection if user hasn't selected a plan yet
  if (user && !user.pack_type) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Boom Bag!</h1>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Next Step: Choose Your Plan
            </h2>
            <p className="text-gray-600 mb-6">
              Select a plan that fits your goals to continue setting up your account.
            </p>
            <PlanSelection />
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Show pending verification message if user has selected a plan but is not yet verified
  if (user && user.pack_type && user.status === 'pending') {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Verification Pending</h1>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <Share2 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-800">
                    Your Account is Pending Verification
                  </h2>
                  <p className="text-gray-600">
                    We've received your plan selection and are waiting for payment confirmation.
                  </p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-blue-800 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside text-blue-700 space-y-2">
                  <li>Send your payment using one of the methods below</li>
                  <li>Submit proof of payment via Telegram or WhatsApp</li>
                  <li>Wait for admin verification (usually within 24 hours)</li>
                  <li>Once verified, you'll gain access to your group and features</li>
                </ol>
              </div>
              
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Methods:</h3>
                <div className="flex flex-wrap gap-4">
                  <a 
                    href="https://t.me/boombag2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn bg-[#0088cc] text-white hover:bg-[#0077b5] focus:ring-blue-500"
                  >
                    Submit via Telegram
                  </a>
                  {/*<a 
                    href="https://wa.me/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn bg-[#25D366] text-white hover:bg-[#128C7E] focus:ring-green-500"
                  >
                    Submit via WhatsApp
                  </a>*/}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Show main dashboard for verified users
  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {userData && (
              <div className="space-y-6">
                {/* Progress Stats */}
                <ProgressStats user={userData} />
                
                {/* Groups */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Your Groups</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Manage your groups and track their progress
                    </p>
                  </div>
                  
                  <div className="px-6 py-5">
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((groupNumber, idx) => {
                        const group = userData.groups?.find(g => g.group_number === groupNumber);
                        const packType = user?.pack_type || 'starter';
                        // Define levels and amounts
                        const starterAmounts = ['$10', '$20', '$30'];
                        const goldAmounts = ['$50', '$100', '$200'];
                        const isGold = packType === 'gold';
                        const amount = isGold ? goldAmounts[idx] : starterAmounts[idx];

                        if (group) {
                          // Show real group card, use group.members and group.verified_members
                          return (
                            <GroupCard
                              key={group.id}
                              group={group}
                              memberCount={group.members ?? 0}
                              verifiedCount={group.verified_members ?? 0}
                              onShareLink={handleShareGroup}
                              packType={packType}
                            />
                          );
                        } else {
                          // Show locked card
                          return (
                            <div
                              key={groupNumber}
                              className="bg-gray-100 rounded-xl shadow-md flex flex-col items-center justify-center p-8 opacity-60 relative"
                            >
                              <div className="absolute top-4 right-4 text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11V7a4 4 0 10-8 0v4M6 15v2a2 2 0 002 2h8a2 2 0 002-2v-2M6 15h12" />
                                </svg>
                              </div>
                              <div className="text-2xl font-bold text-gray-500 mb-2">Level {groupNumber} Group</div>
                              <div className="text-lg text-gray-400 mb-4">{amount}</div>
                              <div className="text-gray-400">Locked</div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
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
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;