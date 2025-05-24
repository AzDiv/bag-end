import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { joinGroupAsExistingUser } from '../../lib/supabase';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Layout/DashboardLayout';

const Join: React.FC = () => {
  const { user, refreshUser } = useAuthStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const [status, setStatus] = useState<'idle'|'joining'|'success'|'error'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    const tryJoin = async () => {
      if (user && code) {
        setStatus('joining');
        const token = localStorage.getItem('jwt_token');
        const result = await joinGroupAsExistingUser(user.id, code, token!);
        if (result.success) {
          setStatus('success');
          await refreshUser();
          setTimeout(() => {
            navigate('/join-group?joined=success', { replace: true });
          }, 1200);
        } else {
          setStatus('error');
          setError(result.error || 'Erreur lors de la tentative de rejoindre le groupe.');
        }
      }
    };
    tryJoin();
  }, [user, code, refreshUser, navigate]);

  if (!user) {
    return (
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-10 text-center">
          <h1 className="text-2xl font-bold mb-4">Connexion requise</h1>
          <p>Veuillez vous connecter pour rejoindre un groupe avec un code d'invitation.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto py-10 text-center">
        {status === 'joining' && <div className="text-lg text-gray-700">Rejoindre le groupe...</div>}
        {status === 'success' && <div className="text-green-600 text-lg font-semibold">Vous avez rejoint le groupe avec succès !</div>}
        {status === 'error' && <div className="text-red-500 text-lg font-semibold">{error}</div>}
        {status === 'idle' && <div className="text-lg text-gray-700">Préparation...</div>}
      </div>
    </DashboardLayout>
  );
};

export default Join;
