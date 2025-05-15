import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/Layout/DashboardLayout';
import { useAuthStore } from '../../store/authStore';
import toast from 'react-hot-toast';
import { Phone, Mail, User, Save, ExternalLink } from 'lucide-react';

const Settings: React.FC = () => {
  const { user, updateUserProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setEmail(user?.email || '');
    setWhatsapp(user?.whatsapp || '');
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateUserProfile({ name, email, whatsapp });
    setLoading(false);
    if (result.success) {
      toast.success('Profile updated!');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Paramètres du compte</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">Informations personnelles</h2>
                <p className="text-sm text-gray-500">Mettez à jour vos informations de profil</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <User className="h-4 w-4 mr-2 text-gray-400" />
                    Nom complet
                  </label>
                  <input
                    type="text"
                    className="input w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Mail className="h-4 w-4 mr-2 text-gray-400" />
                    Adresse email
                  </label>
                  <input
                    type="email"
                    className="input w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center text-sm font-medium text-gray-700">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    WhatsApp
                  </label>
                  <input
                    type="text"
                    className="input w-full border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    value={whatsapp}
                    onChange={e => setWhatsapp(e.target.value)}
                    placeholder="Entrez votre numéro WhatsApp"
                  />
                  <p className="text-xs text-gray-500">Format recommandé: +212661616161</p>
                </div>
                
                <div className="pt-4">
                  <button
                    className="btn btn-primary w-full sm:w-auto flex items-center justify-center"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin mr-2">●</span>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Enregistrer les modifications
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Side Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-800">À propos</h2>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Logo */}
                <div className="flex justify-center">
                  <div className="p-4 bg-gray-50 rounded-md w-32 h-32 flex items-center justify-center">
                    <img 
                      src="/icon-logo.png" 
                      alt="Logo" 
                      className="max-w-full max-h-full"
                      onError={(e) => { 
                        e.currentTarget.src = 'https://via.placeholder.com/120?text=LOGO';
                      }}
                    />
                  </div>
                </div>
                
                {/* Brief Paragraph */}
                <div>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Bienvenue dans votre espace de gestion personnel. Ici, vous pouvez mettre à jour vos informations 
                    de contact et gérer vos préférences pour une meilleure expérience.
                  </p>
                </div>
                
                {/* Telegram Link */}
                <div className="pt-2">
                  <a 
                    href="https://t.me/boombag2025" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2 px-4 bg-[#0088cc] text-white rounded-lg hover:bg-[#0077b5] transition-colors w-full"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.069l-1.68 8.057c-.133.644-.489.8-.989.498L11 13.117l-2.125 2.058c-.235.237-.432.434-.887.434l.307-4.378 7.968-7.194c.346-.307-.075-.478-.532-.172L5.412 10.17l-2.247-.745c-.49-.158-.497-.479.109-.711l17.764-6.84c.424-.175.81.106.656.564z" />
                    </svg>
                    Any further support needed 
                  </a>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
