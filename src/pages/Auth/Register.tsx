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
      toast.error('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    // Validate Moroccan WhatsApp number: starts with +212 or 0, followed by 9 digits
    const moroccoRegex = /^(?:\+212|0)([ \-]?\d){9}$/;
    if (!moroccoRegex.test(whatsapp)) {
      toast.error('Please enter a valid Moroccan WhatsApp number (e.g. +212612345678 or 0612345678)');
      return;
    }

    if (!inviteCode) {
      toast.error('Invite code is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const { success, error } = await signUp(email, password, name, inviteCode, whatsapp);
      
      if (success) {
        toast.success('Registration successful!');
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
      toast.error(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <AuthLayout 
      title="Create your account" 
      subtitle="Join the community and start progressing"
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
            Full Name
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
              placeholder="Enter your full name"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
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
              placeholder="Enter your email"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
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
              placeholder="Create a password"
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
            Confirm Password
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
              placeholder="Confirm your password"
            />
          </div>
        </div>

        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium text-gray-700">
            Invite Code <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              id="inviteCode"
              name="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="input"
              placeholder="Enter invite code"
              required // <-- make it required
            />
          </div>
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp Number
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
              placeholder="Enter your WhatsApp number"
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
            Create account
          </button>
        </div>

        <div className="text-sm text-center">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
            Sign in
          </Link>
        </div>
      </motion.form>
    </AuthLayout>
  );
};

export default Register;