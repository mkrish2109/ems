import React from 'react';

const SecurityTips: React.FC = () => {
  return (
    <div className="mt-8 p-4 bg-blue-50 rounded-[16px] border border-blue-200">
      <h4 className="text-[16px] font-semibold text-[#052C4D] mb-2">Password Tips</h4>
      <ul className="text-sm text-gray-600 space-y-1">
        <li>• Use at least 6 characters</li>
        <li>• Include uppercase and lowercase letters</li>
        <li>• Include numbers and special characters</li>
        <li>• Avoid using personal information</li>
        <li>• Don&#39;t reuse old passwords</li>
      </ul>
    </div>
  );
};

export default SecurityTips;