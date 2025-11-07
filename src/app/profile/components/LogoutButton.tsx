interface LogoutButtonProps {
  onLogout: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (
    <div className="my-[27px] px-6">
      <button
        onClick={onLogout}
        className="w-full h-[56px] bg-[#008DD2] rounded-[16px] flex items-center justify-center hover:bg-[#007cba] transition-colors cursor-pointer"
      >
        <span className="text-[18px] font-bold text-white">Logout</span>
      </button>
    </div>
  );
};

export default LogoutButton;