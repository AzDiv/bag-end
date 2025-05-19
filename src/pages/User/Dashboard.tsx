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
import { AlertCircle, InfoIcon, CheckCircle, Link2, AlertTriangle } from 'lucide-react';
import PaymentInstructions from '../../components/UI/PaymentInstruction'; 

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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Bienvenue sur Boom Bag !</h1>
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Prochaine étape : choisissez votre plan
            </h2>
            <p className="text-gray-600 mb-6">
              Sélectionnez un plan adapté à vos objectifs pour continuer la configuration de votre compte.
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
        <div className="min-h-[calc(100vh-80px)] py-8 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-7 gap-8"
          >
            {/* Section principale */}
            <div className="lg:col-span-4 bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h1 className="text-xl font-bold text-gray-900">Vérification en cours</h1>
              </div>
              
              <div className="p-6">
                <div className="flex items-start mb-6">
                  <div className="p-3 bg-yellow-100 rounded-full flex-shrink-0">
                    <AlertCircle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                      Votre compte est en attente de vérification
                    </h2>
                    <p className="text-gray-600 mt-1">
                      Nous avons bien reçu votre sélection de plan et attendons la confirmation de votre paiement.
                    </p>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-5 rounded-lg mb-6 border border-blue-100">
                  <h3 className="font-medium text-blue-800 mb-3 flex items-center">
                    <InfoIcon className="h-5 w-5 mr-2" />
                    Prochaines étapes:
                  </h3>
                  <ol className="list-decimal list-inside text-blue-700 space-y-3 pl-1">
                    <li className="pb-2 border-b border-blue-100">Envoyez votre paiement en utilisant l'une des méthodes ci-dessous</li>
                    <li className="pb-2 border-b border-blue-100">Soumettez une preuve de paiement via Telegram ou WhatsApp</li>
                    <li className="pb-2 border-b border-blue-100">Attendez la vérification de l'administrateur (généralement sous 24 heures)</li>
                    <li>Une fois vérifié, vous aurez accès à votre groupe et à toutes les fonctionnalités</li>
                  </ol>
                </div>
                
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                    <Link2 className="h-5 w-5 mr-2 text-gray-500" />
                    Contactez-nous pour finaliser votre inscription :
                  </h3>
                  <div className="flex flex-wrap gap-4">
                    <a 
                      href="https://t.me/boombag2025" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn bg-[#0088cc] text-white hover:bg-[#0077b5] focus:ring-blue-500 flex items-center"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-1.68 8.057c-.133.644-.489.8-.989.498L11 13.117l-2.125 2.058c-.235.237-.432.434-.887.434l.307-4.378 7.968-7.194c.346-.307-.075-.478-.532-.172L5.412 10.17l-2.247-.745c-.49-.158-.497-.479.109-.711l17.764-6.84c.424-.175.81.106.656.564z" />
                      </svg>
                      Contacter via Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section latérale avec instructions de paiement */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden sticky top-20">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-800">Instructions de paiement</h2>
                </div>
                
                <div className="p-6">
                  <PaymentInstructions />
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3 flex-shrink-0" />
                      <p className="text-sm text-yellow-700">
                        Après le paiement, envoyez une capture d'écran de votre preuve de paiement à notre équipe via Telegram.
                      </p>
                    </div>
                  </div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {userData && (
              <div className="space-y-6">
                
                {/* Groups */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Vos Groupes</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Gérez vos groupes et suivez leurs progrès
                    </p>
                  </div>
                  
                  <div className="px-6 py-5">
                    <div className="grid md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((groupNumber, idx) => {
                        const group = userData.groups?.find(g => g.group_number === groupNumber);
                        const packType = user?.pack_type || 'starter';
                        // Define levels and amounts
                        const starterAmounts = ['5$', '10$', '20$'];
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
                              <div className="text-2xl font-bold text-gray-500 mb-2">Groupe Niveau {groupNumber}</div>
                              <div className="text-lg text-gray-400 mb-4">{amount}</div>
                              <div className="text-gray-400">Verrouillé</div>
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Progress Stats */}
                <ProgressStats user={userData} />

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