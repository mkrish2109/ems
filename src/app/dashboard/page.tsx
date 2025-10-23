"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { IoMdSettings } from "react-icons/io";
import { FaPlus } from "react-icons/fa";
import logo from "../../../public/assets/Icon/logo.svg";
import roundplus from "../../../public/assets/Icon/roundplus.svg";
import report from "../../../public/assets/Icon/report.svg";
import user from "../../../public/assets/Icon/user.svg";
import users from "../../../public/assets/Icon/users.svg";
import home from "../../../public/assets/Icon/home.svg";
import { PieChart, Pie, Cell, LabelList, ResponsiveContainer } from "recharts";
import Cookies from "js-cookie";
import PageLoader from "@/components/ui/PageLoader";
import NotificationPermissionModal from "@/components/NotificationPermissionModal";
import NotificationCard from "@/components/NotificationCard";
import { format, startOfMonth, endOfMonth } from "date-fns";

// Updated interfaces to match report page structure
interface Expense {
  expense_id: number;
  amount: string;
  description: string;
  expense_date: string;
  payment_method: string;
  category: { category_name: string };
  member_user: { user_name: string };
}

interface Income {
  income_id: number;
  amount: string;
  description: string;
  income_date: string;
  payment_method: string;
  category: { income_category_name: string };
  member_user: { user_name: string };
}

interface CombinedReportData {
  summary: {
    total_income: number;
    total_expense: number;
    net_flow: number;
    data_type: string;
    income_count: number;
    expense_count: number;
    period: string;
    start_date: string;
    end_date: string;
    savings_rate: number;
    expense_to_income_ratio: number;
  };
  monthly_trend: Array<{
    month: string;
    income_total: number;
    expense_total: number;
    income_count: number;
    expense_count: number;
    net_flow: number;
  }>;
  expense_details: {
    expenses: Expense[];
    category_breakdown: Record<
      string,
      { total: number; count: number; percentage: number }
    >;
    payment_method_breakdown: Record<
      string,
      { total: number; count: number; percentage: number }
    >;
  };
  income_details: {
    incomes: Income[];
    category_breakdown: Record<
      string,
      { total: number; count: number; percentage: number }
    >;
    payment_method_breakdown: Record<
      string,
      { total: number; count: number; percentage: number }
    >;
  };
  financial_health: {
    savings_rate: number;
    health_score: number;
    health_status: string;
    monthly_income: number;
    monthly_expense: number;
    recommendations: string[];
  };
  metadata: {
    report_type: string;
    period: string;
    data_type: string;
    start_date: string;
    end_date: string;
    generated_by: string;
    generated_at: string;
    user_id: number;
    time_range: string;
  };
  // New field from the API response
  combined_timeline: Array<{
    id: number;
    type: string;
    amount: string | number;
    absolute_amount: string;
    description: string | null;
    category: string;
    date: string;
    created_at: string;
    updated_at: string;
    user_name: string;
    payment_method: string | null;
    original_data: any;
  }>;
}

interface CombinedReportSummary {
  success: boolean;
  data: CombinedReportData;
  message?: string;
}

type DashboardData = {
  totalExpenses: number;
  totalIncome: number;
  netBalance: number;
  todayExpenses: number;
  todayIncome: number;
  familyExpenses?: { name: string; amount: number; color: string }[];
  categoryExpenses?: { category: string; amount: number; color: string }[];
  recentTransactions: {
    title: string;
    amount: number;
    time: string;
    type: "expense" | "income";
    user?: string;
  }[];
  savingsRate: number;
  financialHealth: {
    health_score: number;
    health_status: string;
    recommendations: string[];
  };
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [role, setRole] = useState<
    "Family Head" | "Family Member" | "Solo User" | "Admin"
  >("Family Head");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [combinedData, setCombinedData] =
    useState<CombinedReportSummary | null>(null);
  const [isFamilyHead, setIsFamilyHead] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);

  // Load role from cookies and check if user is family head
  useEffect(() => {
    const storedRole = Cookies.get("userRole") as
      | "Family Head"
      | "Family Member"
      | "Solo User"
      | "Admin"
      | undefined;
    if (storedRole) {
      setRole(storedRole);
      setIsFamilyHead(storedRole === "Family Head");
    }
  }, []);

  // Check if user has family members
  useEffect(() => {
    const checkFamilyStatus = async () => {
      try {
        const token = Cookies.get("access_token");
        if (!token) return;

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/family/members`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          // Check if there are any family members (excluding the head)
          const hasFamilyMembers = data.data && data.data.length > 0;
          setHasFamily(hasFamilyMembers);
        }
      } catch (error) {
        console.error("Error checking family status:", error);
        setHasFamily(false);
      }
    };

    if (isFamilyHead) {
      checkFamilyStatus();
    }
  }, [isFamilyHead]);

  // Type guard to narrow to Expense | Income
  const isExpenseOrIncome = (
    v: Expense | Income | null
  ): v is Expense | Income => v !== null;

  // Convert combined_timeline items to Expense or Income format
  const convertTimelineItems = (
    combinedTimeline: any[]
  ): Array<Expense | Income> => {
    return combinedTimeline
      .map((item: any): Expense | Income | null => {
        if (!item || !item.type) return null;

        const originalData = item.original_data || {};

        if (item.type === "expense") {
          return {
            expense_id: originalData.expense_id,
            amount: originalData.amount,
            description: originalData.description,
            expense_date: originalData.expense_date,
            payment_method: originalData.payment_method,
            category: {
              category_name:
                originalData.other_category_name ||
                originalData.category?.category_name ||
                "Other",
            },
            member_user: {
              user_name: originalData.member_user?.user_name || "Unknown",
            },
          } as Expense;
        }

        if (item.type === "income") {
          return {
            income_id: originalData.income_id,
            amount: originalData.amount,
            description: originalData.description,
            income_date: originalData.income_date,
            payment_method: originalData.payment_method,
            category: {
              income_category_name:
                originalData.category?.income_category_name || "Other",
            },
            member_user: {
              user_name: originalData.member_user?.user_name || "Unknown",
            },
          } as Income;
        }

        return null;
      })
      .filter(isExpenseOrIncome);
  };

  // Fetch combined data for dashboard
  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = Cookies.get("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Use current month as default period for dashboard
        const today = new Date();
        const startDate = startOfMonth(today);
        const endDate = endOfMonth(today);

        // Determine report type: family head with family members should see family data
        const reportType = isFamilyHead && hasFamily ? "family" : "personal";

        const params = new URLSearchParams({
          report_type: reportType,
          period: "monthly",
          data_type: "combined",
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        });

          // console.log("Fetching combined data for dashboard...", {
          //   reportType,
          //   isFamilyHead,
          //   hasFamily,
          // });

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL
          }/combined/summary?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch combined data: ${response.status}`);
        }

        const combinedResponse: CombinedReportSummary = await response.json();

        if (combinedResponse.success && combinedResponse.data) {
          setCombinedData(combinedResponse);
          processDashboardData(combinedResponse.data, role, isFamilyHead);
        } else {
          throw new Error(
            combinedResponse.message || "Failed to load dashboard data"
          );
        }
      } catch (error) {
        console.error("❌ Error fetching combined dashboard data:", error);
        setError("Failed to load dashboard data");
        // Fallback to empty data
        setData({
          totalExpenses: 0,
          totalIncome: 0,
          netBalance: 0,
          todayExpenses: 0,
          todayIncome: 0,
          recentTransactions: [],
          savingsRate: 0,
          financialHealth: {
            health_score: 0,
            health_status: "Unknown",
            recommendations: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchCombinedData();
    }
  }, [role, isFamilyHead, hasFamily]);

  const processDashboardData = useCallback(
    (
      combinedData: CombinedReportData,
      role: "Family Head" | "Family Member" | "Solo User" | "Admin",
      isFamilyHead: boolean
    ): DashboardData => {
      const now = new Date();
      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get summary data
      const summary = combinedData.summary;
      const totalExpenses = summary.total_expense || 0;
      const totalIncome = summary.total_income || 0;
      const netBalance = summary.net_flow || 0;
      const savingsRate = summary.savings_rate || 0;

      // Convert combined_timeline to Expense/Income format
      const allConvertedTransactions = convertTimelineItems(
        combinedData.combined_timeline || []
      );

      // Calculate today's expenses and income using converted transactions
      const todayExpenses = allConvertedTransactions
        .filter(
          (transaction) =>
            "expense_id" in transaction &&
            new Date(transaction.expense_date) >= last24Hours
        )
        .reduce((sum, expense) => sum + parseFloat(expense.amount), 0);

      const todayIncome = allConvertedTransactions
        .filter(
          (transaction) =>
            "income_id" in transaction &&
            new Date(transaction.income_date) >= last24Hours
        )
        .reduce((sum, income) => sum + parseFloat(income.amount), 0);

      // Prepare chart data based on role using converted transactions
      let familyExpenses, categoryExpenses;

      if (isFamilyHead) {
        // Group expenses by member for family head view
        const memberExpensesMap = new Map();

        allConvertedTransactions
          .filter((transaction) => "expense_id" in transaction)
          .forEach((expense) => {
            const memberName = expense.member_user?.user_name || "Unknown";
            const currentAmount = memberExpensesMap.get(memberName) || 0;
            memberExpensesMap.set(
              memberName,
              currentAmount + parseFloat(expense.amount)
            );
          });

        familyExpenses = Array.from(memberExpensesMap.entries()).map(
          ([name, amount], index) => ({
            name,
            amount,
            color: getColorByIndex(index),
          })
        );
      } else {
        // Group expenses by category for member view
        const categoryExpensesMap = new Map();

        allConvertedTransactions
          .filter((transaction) => "expense_id" in transaction)
          .forEach((expense) => {
            const categoryName =
              expense.category?.category_name || "Uncategorized";
            const currentAmount = categoryExpensesMap.get(categoryName) || 0;
            categoryExpensesMap.set(
              categoryName,
              currentAmount + parseFloat(expense.amount)
            );
          });

        categoryExpenses = Array.from(categoryExpensesMap.entries()).map(
          ([category, amount], index) => ({
            category,
            amount,
            color: getColorByIndex(index),
          })
        );
      }

      // Prepare recent transactions (use converted transactions)
      const allTransactions = allConvertedTransactions
        .sort((a, b) => {
          const dateA = "expense_date" in a ? a.expense_date : a.income_date;
          const dateB = "expense_date" in b ? b.expense_date : b.income_date;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .slice(0, 7)
        .map((transaction) => {
          if ("expense_id" in transaction) {
            const expense = transaction as Expense;
            // For family head, show member name. For members, only show category.
            const title = isFamilyHead
              ? `${expense.member_user?.user_name || "Unknown"} - ${
                  expense.category?.category_name || "Uncategorized"
                }`
              : `${expense.category?.category_name || "Uncategorized"}`;

            return {
              title,
              amount: -parseFloat(expense.amount), // Negative for expenses
              time: formatTimeAgo(new Date(expense.expense_date)),
              type: "expense" as const,
              user: expense.member_user?.user_name,
            };
          } else {
            const income = transaction as Income;
            // For family head, show member name. For members, only show category.
            const title = isFamilyHead
              ? `${income.member_user?.user_name || "Unknown"} - ${
                  income.category?.income_category_name || "Uncategorized"
                }`
              : `${income.category?.income_category_name || "Uncategorized"}`;

            return {
              title,
              amount: parseFloat(income.amount), // Positive for income
              time: formatTimeAgo(new Date(income.income_date)),
              type: "income" as const,
              user: income.member_user?.user_name,
            };
          }
        });

      // Use financial health data from API
      const financialHealth = combinedData.financial_health || {
        health_score: 0,
        health_status: "Unknown",
        recommendations: [],
      };

      const dashboardData: DashboardData = {
        totalExpenses,
        totalIncome,
        netBalance,
        todayExpenses,
        todayIncome,
        recentTransactions: allTransactions,
        savingsRate,
        financialHealth,
        ...(isFamilyHead ? { familyExpenses } : { categoryExpenses }),
      };

      setData(dashboardData);
      return dashboardData;
    },
    []
  );

  // Helper functions
  const getColorByIndex = (index: number): string => {
    const colors = [
      "#008DD2",
      "#FF6B6B",
      "#4ECDC4",
      "#FFD166",
      "#6A0572",
      "#118AB2",
      "#EF476F",
      "#06D6A0",
      "#073B4C",
      "#7209B7",
    ];
    return colors[index % colors.length];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
  };

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

  // Prepare chart data based on role
  const chartData = isFamilyHead
    ? data.familyExpenses?.map((item) => ({
        name: item.name,
        value: item.amount,
        color: item.color,
      }))
    : data.categoryExpenses?.map((item) => ({
        name: item.category,
        value: item.amount,
        color: item.color,
      }));

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-40">
          <div className="relative w-full h-[94px] bg-white shadow-[0px_3px_3px_rgba(0,141,210,0.1)] rounded-b-[15px]">
            <div className="absolute bottom-0 w-full flex items-center justify-between px-6 mb-[15px]">
              <div className="flex items-center">
                <div className="w-[37px] h-[39px] relative mr-[25px]">
                  <Image src={logo} alt="logo" />
                </div>
                <h3 className="text-[16px] text-black">
                  Welcome,{" "}
                  {role === "Family Head"
                    ? "Family Head"
                    : role === "Solo User"
                    ? "Solo User"
                    : "Member"}
                </h3>
              </div>
              <div className="flex items-center text-[#008DD2]">
                {/* Profile icon visible for both Family Head and Family Member */}
                {(role === "Family Head" ||
                  role === "Family Member" ||
                  role === "Solo User" ||
                  role === "Admin") && (
                  <span className="mr-4">
                    <Link href="/profile">
                      <Image src={user} alt="user" />
                    </Link>
                  </span>
                )}

                {/* Add Member only for Family Head */}
                {isFamilyHead && (
                  <span className="mr-4">
                    <Link href="/addMember">
                      <FaPlus size={18} />
                    </Link>
                  </span>
                )}

                {/* Add Expense icon for everyone */}
                <span className="relative group">
                  <Link href="/addExpense">
                    <Image src={roundplus} alt="roundplus" />
                  </Link>
                  <span className="absolute top-full right-0 mt-1 whitespace-nowrap px-2 py-1 text-[12px] text-white bg-black rounded-md opacity-0 group-hover:opacity-100 transition duration-200 z-50">
                    Add Expense
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Permission Prompt */}
          <NotificationPermissionModal />

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

        <div className="px-6 space-y-3">
          {/* Financial Summary */}
          <div className="h-[135px] bg-white rounded-[10px] mt-[12px] mx-auto py-[12px] px-[11px] shadow-sm">
            <h4 className="text-[14px] font-semibold text-[#052C4D]">
              {isFamilyHead && hasFamily
                ? "Family Financial Summary"
                : "Financial Summary"}
            </h4>
            <div className="flex justify-between items-center mt-[2px]">
              <div>
                <h3 className="text-[18px] font-medium text-[#008DD2]">
                  {formatCurrency(data.netBalance)}
                </h3>
                <div className="mt-[4px] text-[12px] text-[#052C4D]">
                  <p>Net Balance</p>
                  <p>Income: {formatCurrency(data.totalIncome)}</p>
                  <p>Expenses: {formatCurrency(data.totalExpenses)}</p>
                </div>
              </div>
              <div className="text-right text-[12px] text-[#052C4D]">
                <p>Todays Income: {formatCurrency(data.todayIncome)}</p>
                <p>Todays Expenses: {formatCurrency(data.todayExpenses)}</p>
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

          {/* Family/Category Wise Expenses with Chart */}
          <div className="h-auto bg-white rounded-[10px] mx-auto py-[13px] px-[11px] shadow-sm">
            <div className="max-[360px]:flex-col max-[360px]:gap-2">
              <h4 className="text-[14px] font-semibold text-[#052C4D] mb-[7px]">
                {isFamilyHead
                  ? "Family Wise Expenses"
                  : "Category Wise Expenses"}
              </h4>
              <div className="flex justify-between items-center max-[360px]:flex-col max-[360px]:items-center max-[360px]:gap-4">
                {/* Chart Section */}
                {chartData && chartData.length > 0 && (
                  <div className="w-[150px] h-[87px] flex items-center justify-center order-2 max-[360px]:order-1">
                    <div className="w-full h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={20}
                            outerRadius={32.5}
                            dataKey="value"
                          >
                            {chartData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                            <LabelList
                              dataKey="value"
                              position="outside"
                              formatter={(label) => `$${label as number}`}
                              style={{
                                fontSize: 10,
                                fill: "#052C4D",
                              }}
                            />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Legend Section */}
                <div className="w-auto max-[360px]:w-full order-1 max-[360px]:order-2">
                  <div className="flex gap-[16px] max-[360px]:justify-evenly">
                    {/* First Column */}
                    <div className="flex flex-col gap-[2px]">
                      {chartData
                        ?.slice(0, Math.ceil(chartData.length / 2))
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <div
                              className="w-[10px] h-[10px] rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-[12px] font-medium text-[#052C4D]">
                              {item.name}
                            </span>
                          </div>
                        ))}
                    </div>

                    {/* Second Column */}
                    <div className="flex flex-col gap-[2px]">
                      {chartData
                        ?.slice(Math.ceil(chartData.length / 2))
                        .map((item, idx) => (
                          <div key={idx} className="flex items-center">
                            <div
                              className="w-[10px] h-[10px] rounded-full mr-2"
                              style={{ backgroundColor: item.color }}
                            ></div>
                            <span className="text-[12px] font-medium text-[#052C4D]">
                              {item.name}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-[10px] mx-auto py-[13px] px-[11px] shadow-sm">
            <div className="flex justify-between items-center mb-[2px]">
              <h4 className="text-[14px] font-semibold text-[#052C4D]">
                Recent Transactions
              </h4>
              {data.recentTransactions &&
                data.recentTransactions.length > 0 && (
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
                  <h4
                    className={`text-[14px] ${
                      transaction.amount >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(transaction.amount)}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {/* Notifications */}
          <NotificationCard maxItems={2} />
        </div>

        {/* Bottom Navigation */}
        <div className="mt-auto sticky bottom-0 ">
          <div className="w-full h-[94px] bg-white shadow-[0px_3px_3px_rgba(0,141,210,0.1)] rounded-t-[15px] mt-3">
            <div className="flex min-h-[48px] justify-evenly items-center py-5">
              <Link href="#" className="flex flex-col items-center">
                <Image src={home} alt="home" height={22} />
                <span className="text-[16px] font-medium text-[#052C4D] mt-1">
                  Dashboard
                </span>
              </Link>
              {isFamilyHead && (
                <Link href="/members" className="flex flex-col items-center">
                  <Image src={users} alt="users" height={22} />
                  <span className="text-[16px] font-medium text-[#052C4D] mt-1">
                    Members
                  </span>
                </Link>
              )}
              <Link href="/reports" className="flex flex-col items-center">
                <Image src={report} alt="report" height={22} />
                <span className="text-[16px] font-medium text-[#052C4D] mt-1">
                  Reports
                </span>
              </Link>
              <Link href="#" className="flex flex-col items-center">
                <IoMdSettings color="#008DD2" size={22} />
                <span className="text-[16px] font-medium text-[#052C4D] mt-1">
                  Setting
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
