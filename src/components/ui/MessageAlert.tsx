import React from 'react';
import { MessageType } from '@/types/auth';

interface MessageAlertProps {
  type: MessageType['type'];
  text: string;
}

const MessageAlert: React.FC<MessageAlertProps> = ({ type, text }) => {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-700 border border-green-200';
      case 'error':
        return 'bg-red-100 text-red-700 border border-red-200';
      default:
        return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
  };

  return (
    <div className={`px-4 py-2 rounded-[16px] text-[14px] ${getAlertStyles()}`}>
      {text}
    </div>
  );
};

export default MessageAlert; 