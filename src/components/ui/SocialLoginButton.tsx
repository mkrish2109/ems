import { ButtonHTMLAttributes } from 'react';

interface SocialLoginButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  text: string;
}

export default function SocialLoginButton({ icon, text, ...props }: SocialLoginButtonProps) {
  return (
    <button
      {...props}
      className="w-full h-14 border border-[#052C4D] rounded-2xl flex items-center justify-center hover:bg-gray-50"
    >
      {icon}
      <span className="text-[16px] text-[#1C1C1C]">{text}</span>
    </button>
  );
}