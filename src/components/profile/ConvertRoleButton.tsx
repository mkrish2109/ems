"use client";

import { SiConvertio } from 'react-icons/si';

interface ConvertRoleButtonProps {
  roleName?: string;
  converting: boolean;
  onConvert: () => void;
}

export const ConvertRoleButton: React.FC<ConvertRoleButtonProps> = ({
  roleName,
  converting,
  onConvert,
}) => {
  if (roleName !== 'Solo User') return null;

  return (
    <button
      onClick={onConvert}
      disabled={converting}
      title="Convert to Family Head"
      className={`absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 rounded-[10px] border border-[#008DD2] text-[#008DD2] text-[14px] font-medium hover:bg-[#008DD2]/10 transition-all ${
        converting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      <SiConvertio className="text-[18px]" />
      {converting ? 'Converting...' : 'Convert'}
    </button>
  );
};