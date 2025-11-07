import Link from "next/link";
import { DashboardData } from "@/types/dashboard";
import CurrencyFormatter from "@/components/ui/CurrencyFormatter";

interface RecentTransactionsProps {
  data: DashboardData;
}

export default function RecentTransactions({ data }: RecentTransactionsProps) {
  return (
    <div className="bg-white rounded-[10px] mx-auto pt-[13px] pb-[10px] px-[11px] shadow-sm">
      <div className="flex justify-between items-center mb-[2px]">
        <h4 className="text-[14px] font-semibold text-[#052C4D]">
          Recent Transactions
        </h4>
        {data.recentTransactions && data.recentTransactions.length > 0 && (
          <h4 className="text-[12px] text-[#008dd2]">
            <Link href="/reports">View all</Link>
          </h4>
        )}
      </div>

      {data.recentTransactions.slice(0, 4).map((transaction, idx) => (
        <div
          key={idx}
          className="border-b border-[#008DD2] border-opacity-30 mb-1"
        >
          <div className="flex justify-between items-center">
            <div className="flex ">
              <h4 className="text-[14px] text-[#008DD2]">
                {transaction.title}
              </h4>
              <div className="flex items-center">
                <span className="text-[8px] text-[#052C4D] ml-[15px] mt-[6px]">
                  {transaction.time}
                </span>
              </div>
            </div>
            <CurrencyFormatter 
              amount={transaction.amount}
              className={`text-[14px] ${
                transaction.amount >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              showPlusSign={true}
            />
          </div>
        </div>
      ))}
    </div>
  );
}