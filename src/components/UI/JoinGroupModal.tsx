import React, { useState } from 'react';

interface JoinGroupModalProps {
  onClose: () => void;
  onJoin: (groupCode: string) => Promise<{ success: boolean; error?: string }>;
  errorMessage?: string;
}

const JoinGroupModal: React.FC<JoinGroupModalProps> = ({ onClose, onJoin, errorMessage }) => {
  const [groupCode, setGroupCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const result = await onJoin(groupCode.trim());
    setLoading(false);
    if (!result.success) setError(result.error || 'Erreur inconnue');
    else {
      setSuccess('Vous avez rejoint le groupe !');
      setTimeout(() => onClose(), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm"
      >
        <h2 className="text-lg font-semibold mb-4">Entrer le code du groupe</h2>
        <input
          className="input w-full mb-3 border border-gray-200 rounded px-3 py-2"
          value={groupCode}
          onChange={e => setGroupCode(e.target.value)}
          placeholder="Code du groupe"
          required
        />
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        {errorMessage && <div className="text-red-500 text-sm mb-2">{errorMessage}</div>}
        <div className="flex gap-2 mt-2">
          <button type="submit" className="btn-primary flex-1" disabled={loading}>Rejoindre</button>
          <button type="button" className="btn flex-1" onClick={onClose} disabled={loading}>Annuler</button>
        </div>
      </form>
    </div>
  );
};

export default JoinGroupModal;
