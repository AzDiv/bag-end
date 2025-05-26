import React, { useState } from 'react';
import { resetPassword } from '../../lib/api';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();
  const params = new URLSearchParams(useLocation().search);
  const [token, setToken] = useState(params.get('token') || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await resetPassword(token, password);
    if (res.success) {
      setDone(true);
      toast.success('Mot de passe réinitialisé');
      setTimeout(() => navigate('/login'), 1500);
    } else {
      toast.error(res.error || 'Erreur');
    }
  };

  return done ? (
    <div className="max-w-md mx-auto py-10 text-green-600 text-center">Mot de passe réinitialisé !</div>
  ) : (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Réinitialiser le mot de passe</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input
          type="text"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="Token de réinitialisation"
          required
          className="input w-full"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Nouveau mot de passe"
          required
          className="input w-full"
        />
        <button type="submit" className="btn btn-primary w-full">
          Réinitialiser
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
