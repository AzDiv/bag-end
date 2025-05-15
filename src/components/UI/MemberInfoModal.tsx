import React, { useState } from 'react';
import { X, User, Mail, Clock, Phone, AlertCircle, CheckCircle, Copy, CheckCheck } from 'lucide-react';

interface MemberInfoModalProps {
  isOpen: boolean;
  member: any;
  loading: boolean;
  onClose: () => void;
}

const MemberInfoModal: React.FC<MemberInfoModalProps> = ({ isOpen, member, loading, onClose }) => {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative border border-gray-200">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-3">Member Info</h2>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : member ? (
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <span className="font-medium w-24 text-gray-600">Name:</span> 
              <span className="text-gray-800 font-medium">{member.name}</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <span className="font-medium w-24 text-gray-600">Email:</span> 
              <span className="text-gray-800">{member.email}</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10">
                <AlertCircle className="h-5 w-5 text-gray-500" />
              </div>
              <span className="font-medium w-24 text-gray-600">Status:</span> 
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(member.status)}`}>
                {member.status}
              </span>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10">
                <Clock className="h-5 w-5 text-gray-500" />
              </div>
              <span className="font-medium w-24 text-gray-600">Joined:</span> 
              <span className="text-gray-800">{member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}</span>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10">
                <Phone className="h-5 w-5 text-gray-500" />
              </div>
              <span className="font-medium w-24 text-gray-600">WhatsApp:</span> 
              <span className="text-gray-800">{member.whatsapp || '-'}</span>
              
              {member.whatsapp && (
                <button 
                  onClick={() => copyToClipboard(member.whatsapp)}
                  className="ml-3 p-1.5 rounded-md hover:bg-gray-100 transition-colors border border-gray-200"
                  title="Copy phone number"
                >
                  {copied ? 
                    <CheckCheck className="h-4 w-4 text-green-500" /> : 
                    <Copy className="h-4 w-4 text-gray-500" />
                  }
                </button>
              )}
            </div>
            
            {member.status === 'pending' && (
              <div className="flex items-start mt-4 bg-yellow-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  This member is waiting for admin verification.
                </p>
              </div>
            )}
            
            {member.status === 'active' && member.owner_confirmed && (
              <div className="flex items-start mt-4 bg-green-50 p-3 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  This member is fully verified and confirmed. They count towards your group progression.
                </p>
              </div>
            )}
            
            {member.status === 'active' && !member.owner_confirmed && (
              <div className="flex items-start mt-4 bg-blue-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-700">
                  This member is verified by admin. Please confirm them to count towards your group progression.
                </p>
              </div>
            )}
            
            {member.status === 'rejected' && (
              <div className="flex items-start mt-4 bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">
                  This member was rejected and does not count towards group progression.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500 py-6 text-center">No member data found.</div>
        )}
      </div>
    </div>
  );
};

export default MemberInfoModal;
