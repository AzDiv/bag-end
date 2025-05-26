import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Share2, Award, DollarSign } from 'lucide-react';
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
    ? 'Niveau 1' 
    : group.group_number === 2 
      ? 'Niveau 2' 
      : 'Niveau 3';

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/join?code=${group.code}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Lien d’invitation copié dans le presse-papiers !');
  };

  const isCompleted = verifiedCount >= 4;

  // Badge value logic
  let badgeValue = '';
  let badgeColor = '';
  
  if (packType === 'gold') {
    badgeValue = group.group_number === 1 ? '50' : group.group_number === 2 ? '100' : group.group_number === 3 ? '200' : '';
    badgeColor = 'bg-amber-500';
  } else {
    badgeValue = group.group_number === 1 ? '5' : group.group_number === 2 ? '10' : group.group_number === 3 ? '20' : '';
    badgeColor = 'bg-blue-500';
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.01 }}
      className={`bg-card rounded-xl shadow-lg overflow-hidden border border-secondary/30 ${isCompleted ? 'ring-2 ring-success' : ''}`}
    >
      <div className="px-6 py-5 border-b border-secondary relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Award className={`h-5 w-5 ${packType === 'gold' ? 'text-amber-500' : 'text-blue-500'}`} />
            <h3 className="text-lg font-semibold text-text-primary">{levelName}</h3>
          </div>
          
          {/* Nouveau badge amélioré */}
          <motion.div 
            className={`flex items-center justify-center ${badgeColor} text-white px-4 py-1.5 rounded-full shadow-md`}
            whileHover={{ scale: 1.05 }}
            initial={{ rotate: -3 }}
            animate={{ rotate: 0 }}
          >
            <DollarSign className="h-4 w-4 mr-0.5" />
            <span className="font-bold text-base">{badgeValue}</span>
          </motion.div>
        </div>
        
        <div className="flex items-center mt-1">
          <p className="text-sm text-text-secondary">
            Code du groupe : <span className="font-medium">{group.code}</span>
          </p>
          {isCompleted && (
            <motion.span 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="badge bg-success text-white ml-2 py-1 px-2 rounded-md flex items-center gap-1"
            >
              <span className="h-2 w-2 bg-white rounded-full inline-block"></span> Terminé
            </motion.span>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-secondary/20 p-2 rounded-full">
              <Users className="h-5 w-5 text-text-secondary" />
            </div>
            <span className="ml-2 text-sm text-text-secondary">
              Membres : <span className="font-semibold">{memberCount}</span>
            </span>
          </div>
          <div className="flex items-center">
            <div className="bg-success/10 p-2 rounded-full">
              <UserPlus className="h-5 w-5 text-success" />
            </div>
            <span className="ml-2 text-sm text-text-secondary">
              Vérifiés : <span className="font-semibold">{verifiedCount}</span>
            </span>
          </div>
        </div>
        
        <div className="mt-5">
          <div className="flex justify-between mb-1">
            <span className="text-xs font-medium text-text-secondary">Progression vers le prochain niveau</span>
            <span className="text-xs font-medium text-text-primary">{verifiedCount}/4</span>
          </div>
          <div className="w-full bg-secondary/30 rounded-full h-3 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((verifiedCount / 4) * 100, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`${packType === 'gold' ? 'bg-amber-500' : 'bg-primary'} rounded-full h-full relative`}
            >
              {verifiedCount > 0 && (
                <span className="absolute -right-1 -top-1 h-3 w-3 bg-white rounded-full shadow-md"></span>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      
      <div className="px-6 py-4 bg-secondary/10 flex justify-between">
        {isCompleted ? (
          <div className="w-full flex items-center justify-center text-success gap-2">
            <span className="font-semibold">Groupe complet</span>
            <Award className="h-5 w-5 text-success" />
          </div>
        ) : (
          <>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onShareLink(group.code)}
              className="flex items-center px-3 py-2 text-sm text-text-primary bg-card border border-secondary rounded-md hover:bg-secondary-light transition-colors"
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={copyInviteLink}
              className={`px-4 py-2 text-sm text-white rounded-md transition-colors ${
                packType === 'gold' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              Copier le lien d’invitation
            </motion.button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default GroupCard;