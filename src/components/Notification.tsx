import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  type?: 'success' | 'error';
}

export function Notification({ message, onClose, type = 'success' }: NotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all animate-fade-in border-l-4 ${
        type === 'success' ? 'border-green-500' : 'border-red-500'
      }`}>
        <div className="flex items-center justify-center space-x-2">
          {type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <XCircle className="w-5 h-5 text-red-500" />
          )}
          <p className={`font-medium ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>{message}</p>
        </div>
      </div>
    </div>
  );
}