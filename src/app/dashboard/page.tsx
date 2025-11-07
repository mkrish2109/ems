"use client";

import Link from "next/link";
import PageLoader from "@/components/ui/PageLoader";
import { useDashboardData } from "@/hooks/useDashboardData";
import DashboardHeader from "./components/DashboardHeader";
import FinancialSummary from "./components/FinancialSummary";
import ExpenseChart from "./components/ExpenseChart";
import RecentTransactions from "./components/RecentTransactions";
import BottomNavigation from "./components/BottomNavigation";
import NotificationCard from "@/components/NotificationCard";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";

export default function Dashboard() {
  const { data, loading, error, role, isFamilyHead, hasFamily } = useDashboardData();

  if (loading) {
    return <PageLoader />;
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-red-500 text-xl mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <PageLoader />;
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        {/* Header */}
        <DashboardHeader role={role} isFamilyHead={isFamilyHead} />

        {/* Notification Permission Prompt */}
          <NotificationPermissionModal />

        {/* Action Buttons */}
        <div className="mt-3 px-6 w-full flex justify-between items-center">
          <Link href="/addExpense">
            <button className="w-[160px] h-[50px] bg-[#008DD2] rounded-[10px] flex items-center justify-center max-[375px]:w-[130px] cursor-pointer">
              <span className="text-[16px] font-bold text-white">
                Add Expense
              </span>
            </button>
          </Link>
          <Link href="/add-income">
            <button className="w-[160px] h-[50px] bg-[#26BB84] rounded-[10px] flex items-center justify-center max-[375px]:w-[130px] cursor-pointer">
              <span className="text-[16px] font-bold text-white">
                Add Income
              </span>
            </button>
          </Link>
        </div>

        {/* Dashboard Content */}
        <div className="px-6 space-y-3">
          <FinancialSummary 
            data={data} 
            isFamilyHead={isFamilyHead} 
            hasFamily={hasFamily} 
          />
          
          <ExpenseChart 
            data={data} 
            isFamilyHead={isFamilyHead} 
          />
          
          <RecentTransactions data={data} />
          
          <NotificationCard  />
        </div>

        {/* Bottom Navigation */}
        <BottomNavigation isFamilyHead={isFamilyHead} />
      </div>
    </div>
  );
}