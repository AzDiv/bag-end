import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import AuthLayout from '../../components/Layout/AuthLayout';
import PaymentInstructions from '../../components/UI/PaymentInstruction';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signUp, user } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  
  // Extract invite code from URL if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setInviteCode(code);
    }
  }, [location]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    // Validate Moroccan WhatsApp number: starts with +212 or 0, followed by 9 digits
    const moroccoRegex = /^(?:\+212|0)([ \-]?\d){9}$/;
    if (!moroccoRegex.test(whatsapp)) {
      toast.error('Veuillez entrer un numéro WhatsApp marocain valide (ex. : +212612345678 ou 0612345678)');
      return;
    }

    if (!inviteCode) {
      toast.error('Le code d\'invitation est requis');
      return;
    }
    
    setLoading(true);
    
    try {
      const { success, error } = await signUp(email, password, name, inviteCode, whatsapp);
      
      if (success) {
        toast.success('Inscription réussie !');
        const telegramMessage = encodeURIComponent(
        `Bonjour, je viens de m'inscrire. Je suis ${name}, mon numéro WhatsApp est ${whatsapp} et mon email est ${email}.`
        );
        // Redirection vers Telegram avec le message préformaté
        window.open(`https://t.me/boombag2025?text=${telegramMessage}`, '_blank');
        navigate('/dashboard');
      } else {
        throw new Error(error);
      }
    } catch (error: any) {
      toast.error(error.message || 'Échec de l\'inscription');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Créez votre compte" 
      subtitle="Rejoignez la communauté et commencez à progresser"
    >
      <motion.form 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6" 
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nom complet
          </label>
          <div className="mt-1">
            <input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Entrez votre nom complet"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Adresse e-mail
          </label>
          <div className="mt-1">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Entrez votre e-mail"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <div className="mt-1 relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              placeholder="Créez un mot de passe"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmer le mot de passe
          </label>
          <div className="mt-1">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Confirmez votre mot de passe"
            />
          </div>
        </div>

        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
            Code d'invitation <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="input"
              placeholder="Entrez le code d'invitation"
              required // <-- make it required
            />
          </div>
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            Numéro WhatsApp
          </label>
          <div className="mt-1">
            <input
              id="whatsapp"
              name="whatsapp"
              type="text"
              required
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="input"
              placeholder="Entrez votre numéro WhatsApp"
            />
          </div>
        </div>

        <div className="mb-6">
          <PaymentInstructions />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full btn btn-primary flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Créer un compte
          </button>
        </div>

        <div className="text-sm text-center">
          Vous avez déjà un compte ?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Se connecter
          </Link>
        </div>
      </motion.form>
    </AuthLayout>
  );
};

export default Register;