import { DashboardData } from "@/types/dashboard";
import CurrencyFormatter from "@/components/ui/CurrencyFormatter";

interface FinancialSummaryProps {
  data: DashboardData;
  isFamilyHead: boolean;
  hasFamily: boolean;
}

export default function FinancialSummary({ data, isFamilyHead, hasFamily }: FinancialSummaryProps) {
  return (
    <div className="h-auto bg-white rounded-[10px] mt-[12px] mx-auto pt-[12px] pb-[8px] px-[11px] shadow-sm">
      <h4 className="text-[14px] font-semibold text-[#052C4D]">
        {isFamilyHead && hasFamily
          ? "Family Financial Summary"
          : "Financial Summary"}
      </h4>
      <div className="flex justify-between items-center mt-[2px]">
        <div>
          <h3 className="text-[18px] font-medium text-[#008DD2]">
            <CurrencyFormatter amount={data.netBalance} />
          </h3>
          <div className="mt-[4px] text-[12px] text-[#052C4D]">
            <p>Net Balance</p>
            <p>Income: <CurrencyFormatter amount={data.totalIncome} /></p>
            <p>Expenses: <CurrencyFormatter amount={data.totalExpenses} /></p>
          </div>
        </div>
        <div className="text-right text-[12px] text-[#052C4D]">
          <p>Todays Income: <CurrencyFormatter amount={data.todayIncome} /></p>
          <p>Todays Expenses: <CurrencyFormatter amount={data.todayExpenses} /></p>
          <p>Savings Rate: {data.savingsRate.toFixed(1)}%</p>
          <p
            className={`font-semibold ${
              data.financialHealth.health_status === "Excellent"
                ? "text-green-600"
                : data.financialHealth.health_status === "Good"
                ? "text-blue-600"
                : data.financialHealth.health_status === "Fair"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            Health: {data.financialHealth.health_status}
          </p>
        </div>
      </div>
    </div>
  );
}