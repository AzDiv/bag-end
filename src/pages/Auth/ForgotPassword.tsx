import React, { useState } from 'react';
import { requestPasswordReset } from '../../lib/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await requestPasswordReset(email);
    setLoading(false);
    if (res.success) {
      setToken(res.token);
      toast.success('Token généré. Utilisez-le sur la page de réinitialisation.');
    } else {
      toast.error(res.error || 'Erreur');
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Mot de passe oublié</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Votre email"
          required
          className="input w-full"
        />
        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Envoi...' : 'Réinitialiser le mot de passe'}
        </button>
      </form>
      {token && (
        <div className="mt-6 bg-yellow-50 p-4 rounded">
          <p className="mb-2">Votre token de réinitialisation :</p>
          <code className="break-all">{token}</code>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
