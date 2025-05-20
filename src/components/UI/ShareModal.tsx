import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Link2, Share2, Check, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  groupCode: string;
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ groupCode, isOpen, onClose }) => {
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  
  const inviteLink = `${window.location.origin}/join?code=${groupCode}`;
  
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('Copié dans le presse-papiers !', {
      icon: '📋',
      style: {
        borderRadius: '10px',
        background: '#333',
        color: '#fff',
      },
    });
  };
  
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Rejoins mon groupe Boom Bag avec le code : ${groupCode}\n${inviteLink}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = encodeURIComponent(`Rejoins mon groupe Boom Bag avec le code : ${groupCode}`);
    window.open(`https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${text}`, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoins mon groupe Boom Bag !',
          text: 'Je t’invite à rejoindre mon groupe Boom Bag',
          url: inviteLink,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(inviteLink, 'link');
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25 } },
    exit: { opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }
  };

  const shareButtonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.98, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60"
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-card rounded-2xl max-w-md w-full mx-auto shadow-2xl border border-secondary/30 overflow-hidden"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header with gradient using project colors */}
            <div className="bg-gradient-to-r from-primary/90 to-primary p-5 text-white relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-success via-primary to-secondary"></div>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-primary-dark">Partager l'invitation</h3>
                <motion.button 
                  className="text-primary-light hover:text-primary-dark bg-gray rounded-full p-1.5"
                  onClick={onClose}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>
              <p className="text-sm text-primary mt-1">Invitez vos amis à rejoindre votre groupe</p>
            </div>
            
            <div className="p-6 space-y-5">
              {/* Invite Link */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Lien d'invitation
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm overflow-hidden">
                  <div className="relative flex-grow focus-within:z-10">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Link2 className="h-5 w-5 text-text-secondary" />
                    </div>
                    <input
                      type="text"
                      value={inviteLink}
                      readOnly
                      className="block w-full rounded-l-lg pl-10 py-3 sm:text-sm border-secondary/30 bg-card text-text-primary focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <motion.button
                    variants={shareButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    type="button"
                    onClick={() => copyToClipboard(inviteLink, 'link')}
                    className="relative inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-r-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {copied === 'link' ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Invite Code */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">
                  Code d'invitation
                </label>
                <div className="flex items-center justify-center relative">
                  <motion.div 
                    className="py-3 px-8 w-full bg-secondary/10 rounded-lg border border-secondary/30 flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                  >
                    <span className="font-mono text-xl text-text-primary tracking-wider">{groupCode}</span>
                  </motion.div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copyToClipboard(groupCode, 'code')}
                    className="absolute right-3 bg-card shadow-md rounded-full p-2"
                  >
                    {copied === 'code' ? (
                      <Check className="h-4 w-4 text-success" />
                    ) : (
                      <Copy className="h-4 w-4 text-text-secondary" />
                    )}
                  </motion.button>
                </div>
              </div>
              
              {/* Share Options */}
              <div className="pt-2">
                <div className="text-sm font-medium text-text-primary mb-3">
                  Partager via
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* WhatsApp */}
                    <motion.button
                    variants={shareButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={shareToWhatsApp}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#25D366] text-white hover:bg-[#1DA851] transition-colors"
                    >
                    <div className="mb-2 bg-white/20 p-2 rounded-full">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" className="h-6 w-6">
                        <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.274-.101-.474-.15-.673.15-.2.301-.767.966-.94 1.164-.173.199-.347.223-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.452-.52.151-.174.2-.3.3-.498.099-.2.05-.374-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.57-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.18 2.095 3.195 5.076 4.483.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.571-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-medium">WhatsApp</span>
                  </motion.button>
                  
                  {/* Telegram */}
                    <motion.button
                    variants={shareButtonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={shareToTelegram}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#229ED9] text-white hover:bg-[#1b8cc7] transition-colors"
                    >
                    <div className="mb-2 bg-white/20 p-2 rounded-full">
                      <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" fill="none" className="h-6 w-6">
                        <path d="M22.05 1.577c-.393-.016-.784.08-1.117.235-.484.186-4.92 1.902-9.41 3.64-2.26.873-4.518 1.746-6.256 2.415-1.737.67-3.045 1.168-3.114 1.192-.46.16-1.082.362-1.61.984-.133.155-.267.354-.335.628s-.038.622.095.895c.265.547.714.773 1.244.976 1.76.564 3.58 1.102 5.087 1.608.556 1.96 1.09 3.927 1.618 5.89.174.394.553.54.944.544l.035.001c.32.003.64-.117.868-.43 1.18-1.622 3.08-4.224 3.93-5.483.482.208 1.16.503 1.87.814 1.58.685 3.38 1.472 4.08 1.77.46.2.86.29 1.21.29.87 0 1.38-.622 1.57-.995.19-.37.32-.89.19-1.434-.13-.54-.5-1.01-1.09-1.41-.28-.188-5.15-3.35-5.46-3.56-.3-.2-.65-.29-1-.29-.1 0-.19.01-.29.02-2.3.23-8.31 4.32-8.91 4.75.97-3.39 3.62-12.73 3.75-13.12.2-.6.05-1.22-.46-1.63C22.85 1.67 22.45 1.58 22.05 1.577z" fill="currentColor" />
                      </svg>
                    </div>
                    <span className="font-medium">Telegram</span>
                  </motion.button>
                </div>
              </div>
            </div>
            
            {/* Footer with wave effect using project colors */}
            <div className="h-2 bg-gradient-to-r from-success via-primary to-secondary"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ShareModal;