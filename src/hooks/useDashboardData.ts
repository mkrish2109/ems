import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { 
  DashboardData, 
  CombinedReportData, 
  CombinedReportSummary,
  Expense,
  Income 
} from "@/types/dashboard";

export const useDashboardData = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [role, setRole] = useState<"Family Head" | "Family Member" | "Solo User" | "Admin">("Family Head");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFamilyHead, setIsFamilyHead] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);

  const getColorByIndex = (index: number): string => {
    const colors = [
      "#008DD2", "#FF6B6B", "#4ECDC4", "#FFD166", "#6A0572",
      "#118AB2", "#EF476F", "#06D6A0", "#073B4C", "#7209B7",
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

  const isExpenseOrIncome = (
    v: Expense | Income | null
  ): v is Expense | Income => v !== null;

  const convertTimelineItems = useCallback((
    combinedTimeline: CombinedReportData['combined_timeline']
  ): Array<Expense | Income> => {
    return combinedTimeline
      .map((item): Expense | Income | null => {
        if (!item || !item.type) return null;

        const originalData = item.original_data || {};

        if (item.type === "expense") {
          return {
            expense_id: originalData.expense_id as number,
            amount: originalData.amount as string,
            description: originalData.description as string,
            expense_date: originalData.expense_date as string,
            payment_method: originalData.payment_method as string,
            category: {
              category_name:
                (originalData.other_category_name as string) ||
                ((originalData.category as { category_name: string })?.category_name) ||
                "Other",
            },
            member_user: {
              user_name: ((originalData.member_user as { user_name: string })?.user_name) || "Unknown",
            },
          } as Expense;
        }

        if (item.type === "income") {
          return {
            income_id: originalData.income_id as number,
            amount: originalData.amount as string,
            description: originalData.description as string,
            income_date: originalData.income_date as string,
            payment_method: originalData.payment_method as string,
            category: {
              income_category_name:
                ((originalData.category as { income_category_name: string })?.income_category_name) || "Other",
            },
            member_user: {
              user_name: ((originalData.member_user as { user_name: string })?.user_name) || "Unknown",
            },
          } as Income;
        }

        return null;
      })
      .filter(isExpenseOrIncome);
  }, []);

  const processDashboardData = useCallback((
    combinedData: CombinedReportData,
    userRole: "Family Head" | "Family Member" | "Solo User" | "Admin",
    familyHead: boolean
  ): DashboardData => {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const summary = combinedData.summary;
    const totalExpenses = summary.total_expense || 0;
    const totalIncome = summary.total_income || 0;
    const netBalance = summary.net_flow || 0;
    const savingsRate = summary.savings_rate || 0;

    const allConvertedTransactions = convertTimelineItems(
      combinedData.combined_timeline || []
    );

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

    let familyExpenses, categoryExpenses;

    if (familyHead) {
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
          const title = familyHead
            ? `${expense.member_user?.user_name || "Unknown"} - ${
                expense.category?.category_name || "Uncategorized"
              }`
            : `${expense.category?.category_name || "Uncategorized"}`;

          return {
            title,
            amount: -parseFloat(expense.amount),
            time: formatTimeAgo(new Date(expense.expense_date)),
            type: "expense" as const,
            user: expense.member_user?.user_name,
          };
        } else {
          const income = transaction as Income;
          const title = familyHead
            ? `${income.member_user?.user_name || "Unknown"} - ${
                income.category?.income_category_name || "Uncategorized"
              }`
            : `${income.category?.income_category_name || "Uncategorized"}`;

          return {
            title,
            amount: parseFloat(income.amount),
            time: formatTimeAgo(new Date(income.income_date)),
            type: "income" as const,
            user: income.member_user?.user_name,
          };
        }
      });

    const financialHealth = combinedData.financial_health || {
      health_score: 0,
      health_status: "Unknown",
      recommendations: [],
    };

    const notifications = [
      "Monthly budget review due",
      "2 unpaid expenses pending",
    ];

    const dashboardData: DashboardData = {
      totalExpenses,
      totalIncome,
      netBalance,
      todayExpenses,
      todayIncome,
      recentTransactions: allTransactions,
      notifications,
      savingsRate,
      financialHealth,
      ...(familyHead ? { familyExpenses } : { categoryExpenses }),
    };

    setData(dashboardData);
    return dashboardData;
  }, [convertTimelineItems]);

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
          const familyData = await response.json();
          const hasFamilyMembers = familyData.data && familyData.data.length > 0;
          setHasFamily(hasFamilyMembers);
        }
      } catch (err) {
        console.error("Error checking family status:", err);
        setHasFamily(false);
      }
    };

    if (isFamilyHead) {
      checkFamilyStatus();
    }
  }, [isFamilyHead]);

  useEffect(() => {
    const fetchCombinedData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = Cookies.get("access_token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        const today = new Date();
        const startDate = startOfMonth(today);
        const endDate = endOfMonth(today);

        const reportType = isFamilyHead && hasFamily ? "family" : "personal";

        const params = new URLSearchParams({
          report_type: reportType,
          period: "monthly",
          data_type: "combined",
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        });

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
          processDashboardData(combinedResponse.data, role, isFamilyHead);
        } else {
          throw new Error(
            combinedResponse.message || "Failed to load dashboard data"
          );
        }
      } catch (err) {
        console.error("❌ Error fetching combined dashboard data:", err);
        setError("Failed to load dashboard data");
        setData({
          totalExpenses: 0,
          totalIncome: 0,
          netBalance: 0,
          todayExpenses: 0,
          todayIncome: 0,
          recentTransactions: [],
          notifications: [],
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
  }, [role, isFamilyHead, hasFamily, processDashboardData]);

  return {
    data,
    loading,
    error,
    role,
    isFamilyHead,
    hasFamily,
    refetch: () => {
      // You can implement refetch logic here if needed
    }
  };
};