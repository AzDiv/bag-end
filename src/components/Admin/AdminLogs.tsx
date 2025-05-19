import React, { useState } from 'react';
import { Info, AlertTriangle, AlertCircle, Users as UsersIcon, CheckCircle, XCircle } from 'lucide-react';

export interface LogEntry {
  timestamp: string;
  message: string;
  level?: 'info' | 'warning' | 'error';
}

interface AdminLogsProps {
  logs: LogEntry[];
}

const LOG_TYPES = [
  { label: 'Tous', value: 'all' },
  { label: 'Vérifications', value: 'verifications' },
  { label: 'Rejetons', value: 'rejections' },
  { label: 'Groupes', value: 'groups' },
];

const ICONS = {
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  groups: UsersIcon,
  verifications: CheckCircle,
  rejections: XCircle,
};

function getLogType(log: LogEntry) {
  if (/verified|verification/i.test(log.message)) return 'verifications';
  if (/rejected|reject/i.test(log.message)) return 'rejections';
  if (/group/i.test(log.message)) return 'groups';
  return 'other';
}

const AdminLogs: React.FC<AdminLogsProps> = ({ logs }) => {
  const [filter, setFilter] = useState('all');

  // Sort logs by timestamp descending
  const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  // Filter logs by type
  const filteredLogs = filter === 'all' ? sortedLogs : sortedLogs.filter(log => getLogType(log) === filter);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Dernières informations</h2>
          <p className="mt-1 text-sm text-gray-500">Actions récentes du système et des administrateurs</p>
        </div>
        <select
          className="input w-48"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          {LOG_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="max-h-96 overflow-y-auto">
        <ul className="divide-y divide-gray-100">
          {filteredLogs.length === 0 ? (
            <li className="p-6 text-gray-500 text-center">Aucun journal disponible.</li>
          ) : (
            filteredLogs.map((log, idx) => {
              const type = getLogType(log);
              const Icon =
                type === 'verifications' ? ICONS.verifications :
                type === 'rejections' ? ICONS.rejections :
                type === 'groups' ? ICONS.groups :
                log.level === 'warning' ? ICONS.warning :
                log.level === 'error' ? ICONS.error :
                ICONS.info;
              const borderColor =
                type === 'verifications' ? 'border-green-500' :
                type === 'rejections' ? 'border-red-500' :
                type === 'groups' ? 'border-blue-400' :
                log.level === 'warning' ? 'border-yellow-400' :
                log.level === 'error' ? 'border-red-500' :
                'border-gray-300';
              return (
                <li
                  key={idx}
                  className={`px-6 py-4 flex items-start gap-4 border-l-4 ${borderColor} bg-white hover:bg-gray-50 transition`}
                >
                  <span className="mt-1">
                    <Icon className={`h-5 w-5 ${
                      type === 'verifications' ? 'text-green-500' :
                      type === 'rejections' ? 'text-red-500' :
                      type === 'groups' ? 'text-blue-400' :
                      log.level === 'warning' ? 'text-yellow-500' :
                      log.level === 'error' ? 'text-red-500' :
                      'text-gray-400'
                    }`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold uppercase tracking-wide ${
                      type === 'verifications' ? 'text-green-600' :
                      type === 'rejections' ? 'text-red-600' :
                      'text-gray-500'
                    }`}>
                      {type === 'verifications' ? 'Vérifié' :
                       type === 'rejections' ? 'Rejeté' :
                       type === 'groups' ? 'Groupe' : (log.level || 'info').toUpperCase()}
                    </span>
                      <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-sm text-gray-800 leading-snug">
                      {/* Highlight values in the message */}
                      {(() => {
                        // Highlight user name, email, group code, group number
                        const msg = log.message;
                        // User verification/rejection
                        const userMatch = msg.match(/User ([^\(]+) \(([^\)]+)\)/);
                        if (userMatch) {
                          return <>
                            Utilisateur <span className="font-semibold text-green-700">{userMatch[1].trim()}</span> (<span className="font-semibold text-primary">{userMatch[2]}</span>) {msg.includes('verified') ? 'a été vérifié.' : 'a été rejeté.'}
                          </>;
                        }
                        // Group creation
                        const groupMatch = msg.match(/Group #(\d+) \(code: ([^\)]+)\)/);
                        if (groupMatch) {
                          return <>
                            Groupe <span className="font-semibold text-blue-600">#{groupMatch[1]}</span> (code: <span className="font-mono font-semibold text-primary">{groupMatch[2]}</span>) was created.
                          </>;
                        }
                        // Fallback
                        return msg;
                      })()}
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
};

export default AdminLogs;
