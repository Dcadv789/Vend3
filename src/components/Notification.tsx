import React from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

export function Notification({ message, onClose }: NotificationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 transform transition-all animate-fade-in">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
          <p className="text-gray-800 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}