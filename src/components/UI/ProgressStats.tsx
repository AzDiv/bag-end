import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Target, Award } from 'lucide-react';
import { UserWithGroupDetails } from '../../types/database.types';

interface ProgressStatsProps {
  user: UserWithGroupDetails;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({ user }) => {
  const maxLevel = 3;
  const currentLevel = user.current_level || 0;
  const levelProgress = (currentLevel / maxLevel) * 100;
  
  // Find the latest group (highest group_number)
  const latestGroup = Array.isArray(user.groups) && user.groups.length > 0
    ? user.groups.reduce((prev, curr) => (curr.group_number > prev.group_number ? curr : prev), user.groups[0])
    : null;

  const members = latestGroup?.members ?? 0;
  const verifiedMembers = latestGroup?.verified_members ?? 0;
  const nextLevelNeeded = 4 - (verifiedMembers % 4);

  const stats = [
    {
      name: 'Membres au total',
      value: members,
      icon: Users,
      color: 'bg-primary-light text-primary-dark'
    },
    {
      name: 'Membres vérifiés',
      value: verifiedMembers,
      icon: UserCheck,
      color: 'bg-success text-success'
    },
    {
      name: 'Niveau actuel',
      value: currentLevel,
      icon: Target,
      color: 'bg-secondary-light text-secondary-dark'
    },
    {
      name: 'Prochain niveau dans',
      value: `${nextLevelNeeded} membres`,
      icon: Award,
      color: 'bg-secondary-light text-secondary-dark'
    }
  ];

  return (
    <div className="bg-card rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-secondary">
        <h3 className="text-lg font-medium text-text-primary">Votre progression</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Suivez votre croissance et vos réalisations
        </p>
      </div>
      
      <div className="px-6 py-5">
        <div className="flex items-center mb-1">
          <span className="text-sm font-medium text-text-secondary">
            Progression du niveau ({currentLevel}/{maxLevel})
          </span>
          <span className="ml-auto text-sm font-medium text-text-secondary">
            {Math.round(levelProgress)}%
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2.5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${levelProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2.5 rounded-full bg-primary"
          ></motion.div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex items-center p-4 bg-secondary-light rounded-lg"
            >
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-text-secondary">{stat.name}</p>
                <p className="text-lg font-semibold text-text-primary">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressStats;