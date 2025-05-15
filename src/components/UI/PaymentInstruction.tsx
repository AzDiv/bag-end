import React from 'react';
import { Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import QRCodeImage from '../../assets/qrtrustwallet.jpeg';

interface PaymentInstructionsProps {
  className?: string;
}

const PaymentInstructions: React.FC<PaymentInstructionsProps> = ({ className }) => {
  const walletAddress = "TU2Tv1sR8Kr18KeVb3Xz5bwp595e73HQU3";
  const trustWalletLink =
    "https://link.trustwallet.com/send?coin=195&address=TU2Tv1sR8Kr18KeVb3Xz5bwp595e73HQU3&token_id=TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

  const copyWalletAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied to clipboard");
  };

  const openTrustWallet = () => {
    window.open(trustWalletLink, "_blank");
    toast.success("Opening Trust Wallet");
  };

  return (
    <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
      <h3 className="text-xl font-bold mb-4 text-center">
        <span className="bg-gray-100 px-4 py-2 rounded-md inline-block shadow-sm">
          <span className="text-gray-800">Frais D'inscription :</span>
          <span className="text-2xl ml-2 text-gray-900 tracking-tight">4$</span>
        </span>
      </h3>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center">
          <h4 className="font-medium mb-2 text-gray-700">Trust Wallet USDT</h4>
          <div className="bg-white p-2 rounded-lg mb-2 shadow-sm">
            <img
              src={QRCodeImage}
              alt="Trust Wallet QR Code"
              className="w-36 h-36 object-cover rounded-md"
            />
          </div>
          <p className="text-sm text-center text-gray-500">Scan this QR code with Trust Wallet to pay</p>
          <button 
            onClick={openTrustWallet}
            className="mt-2 flex items-center px-3 py-1 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-gray-700"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Trust Wallet
          </button>
        </div>

        <div className="flex flex-col items-center">
          <h4 className="font-medium mb-2 text-gray-700">USDT Wallet Address</h4>
          <div className="bg-gray-100 p-3 rounded-lg mb-2 flex items-center max-w-full">
            <code className="text-xs break-all text-gray-800">{walletAddress}</code>
            <button 
              onClick={copyWalletAddress}
              className="ml-2 flex items-center justify-center h-6 w-6 text-gray-500 hover:text-gray-700"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          <p className="text-sm text-center text-gray-500 mb-2">Adresse publique pour recevoir USDT</p>
          <p className="text-xs text-center text-gray-500">Please send only USDT (TRC20) to this address</p>
        </div>
      </div>

      <p className="text-xs text-center mt-4 text-gray-500">
        Your contribution helps us maintain and improve the BOOM BAG platform. Thank you for your support!
      </p>
    </div>
  );
};

export default PaymentInstructions;