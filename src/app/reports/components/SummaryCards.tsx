'use client';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalIncome,
  totalExpenses,
  netBalance,
}) => {
  return (
    <div className="flex justify-between gap-2">
      <div className="w-[100px] h-[45px] bg-[#26BB84] rounded-[5px] flex flex-col items-center justify-center">
        <span className="text-[12px] text-white">Total Income</span>
        <span className="text-[12px] font-semibold text-white">
          ${totalIncome.toFixed(2)}
        </span>
      </div>

      <div className="w-[100px] h-[45px] bg-[#F44749] rounded-[5px] flex flex-col items-center justify-center">
        <span className="text-[12px] text-white">Total Expenses</span>
        <span className="text-[12px] font-semibold text-white">
          ${totalExpenses.toFixed(2)}
        </span>
      </div>

      <div className="w-[100px] h-[45px] bg-white rounded-[5px] flex flex-col items-center justify-center">
        <span className="text-[12px]">Net Balance</span>
        <span className={`text-[12px] font-semibold ${
          netBalance >= 0 ? 'text-green-500' : 'text-red-500'
        }`}>
          ${netBalance.toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default SummaryCards;