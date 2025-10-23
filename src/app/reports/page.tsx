"use client";

import Cookies from "js-cookie";
import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import PageHeader from "@/components/ui/PageHeader";
import { AiOutlineCalendar, AiOutlineFilter } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Updated interfaces based on the new API response
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

interface FamilyMember {
  user_id: number;
  user_name: string;
  email: string;
  mobile: string;
  role_id: number;
  created_at: string;
  updated_at: string;
  email_verified_at: string;
  role: {
    role_id: number;
    role_name: string;
    is_active: number;
    created_at: string;
    updated_at: string;
  };
}

interface ExpenseCategory {
  category_id: number;
  category_name: string;
  description: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface IncomeCategory {
  income_category_id: number;
  income_category_name: string;
  type: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

interface UserRole {
  role_id: number;
  role_name: string;
  is_active: number;
  created_at: string;
  updated_at: string;
}

// Custom MultiSelect Dropdown Component
interface MultiSelectDropdownProps {
  label: string;
  options: Array<{ value: number; label: string }>;
  selectedValues: number[];
  onSelectionChange: (selected: number[]) => void;
  placeholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  label,
  options,
  selectedValues,
  onSelectionChange,
  placeholder = "Select options...",
  isLoading = false,
  emptyMessage = "No options available",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (value: number) => {
    if (selectedValues.includes(value)) {
      onSelectionChange(selectedValues.filter((v) => v !== value));
    } else {
      onSelectionChange([...selectedValues, value]);
    }
  };

  const selectAll = () => {
    onSelectionChange(options.map((opt) => opt.value));
  };

  const clearAll = () => {
    onSelectionChange([]);
  };

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder;
    if (selectedValues.length === 1) {
      const selectedOption = options.find(
        (opt) => opt.value === selectedValues[0]
      );
      return selectedOption?.label || placeholder;
    }
    return `${selectedValues.length} selected`;
  };

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-[#052C4D] mb-1">
        {label}
      </label>

      {/* Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-[#008DD2] text-[#052C4D] flex justify-between items-center cursor-pointer"
      >
        <span
          className={`${
            selectedValues.length === 0 ? "text-gray-400" : "text-[#052C4D]"
          }`}
        >
          {getDisplayText()}
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2 border-b border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[#052C4D]">
                {selectedValues.length} selected
              </span>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-xs text-[#008DD2] hover:text-[#0070f3] cursor-pointer"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <div className="p-2">
            {isLoading ? (
              <div className="text-center py-2 text-sm text-gray-500">
                Loading...
              </div>
            ) : options.length === 0 ? (
              <div className="text-center py-2 text-sm text-gray-500">
                {emptyMessage}
              </div>
            ) : (
              options.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 py-2 px-3 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={() => toggleOption(option.value)}
                    className="h-4 w-4 text-[#008DD2] border-gray-300 rounded focus:ring-[#008DD2]"
                  />
                  <span className="text-sm text-[#052C4D] flex-1">
                    {option.label}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Reports() {
  const today = new Date();
  const [startDate, setStartDate] = useState(startOfMonth(today));
  const [endDate, setEndDate] = useState(endOfMonth(today));
  const [summary, setSummary] = useState<CombinedReportSummary | null>(null);
  const [loading, setLoading] = useState(false);

  // Sidebar state
  const [showFilters, setShowFilters] = useState(false);
  const [period, setPeriod] = useState("custom");
  const [reportType, setReportType] = useState("personal");
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<
    number[]
  >([]);
  const [selectedIncomeCategories, setSelectedIncomeCategories] = useState<
    number[]
  >([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [dataType, setDataType] = useState<"expense" | "income" | "combined">(
    "combined"
  );

  // Family members state
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(true);

  // Categories state
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(
    []
  );
  const [incomeCategories, setIncomeCategories] = useState<IncomeCategory[]>(
    []
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // User role and family status state
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isFamilyHead, setIsFamilyHead] = useState(false);
  const [hasFamily, setHasFamily] = useState(false);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);

  // Track if we should fetch data (for member report type)
  const [shouldFetchData, setShouldFetchData] = useState(true);

  // Dynamic items per page based on screen height
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // Calculate dynamic items per page based on screen height
  useEffect(() => {
    const calculateItemsPerPage = () => {
      const screenHeight = window.innerHeight;

      if (screenHeight < 700) {
        return 3;
      } else if (screenHeight < 800) {
        return 4;
      } else {
        return 6;
      }
    };

    setItemsPerPage(calculateItemsPerPage());

    const handleResize = () => {
      setItemsPerPage(calculateItemsPerPage());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load user info and check if family head
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        const token = Cookies.get("access_token");

        if (!token) {
          console.error("No access token found");
          setIsLoadingUserInfo(false);
          return;
        }

        console.log("Fetching user profile...");

        // Try multiple possible endpoints for user profile
        const endpoints = [
          `${BASE_URL}/profile`,
          `${BASE_URL}/profile`,
          `${BASE_URL}/auth/profile`,
          `${BASE_URL}/me`,
        ];

        let userData = null;
        let lastError = null;

        for (const endpoint of endpoints) {
          try {
            console.log(`Trying endpoint: ${endpoint}`);
            const response = await fetch(endpoint, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (response.ok) {
              userData = await response.json();
              console.log("User profile data from", endpoint, ":", userData);
              break;
            } else {
              lastError = `Endpoint ${endpoint}: ${response.status} ${response.statusText}`;
              console.warn(`Failed with ${endpoint}:`, response.status);
            }
          } catch (error) {
            lastError = `Endpoint ${endpoint}: ${error}`;
            console.warn(`Error with ${endpoint}:`, error);
          }
        }

        if (!userData) {
          console.log(
            "All profile endpoints failed, trying to extract role from family members API..."
          );

          // Fallback: Try to get role info from family members API
          try {
            const familyResponse = await fetch(`${BASE_URL}/family/members`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });

            if (familyResponse.ok) {
              const familyData = await familyResponse.json();
              console.log("Family data for role detection:", familyData);

              // Try to extract current user's role from family data
              if (familyData.family_head) {
                // If we can access family_head, current user might be the head
                setUserRole(familyData.family_head.role);
                setIsFamilyHead(
                  familyData.family_head.role?.role_name === "Family Head"
                );
              } else if (familyData.data && Array.isArray(familyData.data)) {
                // Look for current user in the members array
                const currentUserMember = familyData.data.find(
                  (member: FamilyMember) =>
                    member.role?.role_name === "Family Head"
                );
                if (currentUserMember) {
                  setUserRole(currentUserMember.role);
                  setIsFamilyHead(true);
                }
              }
            }
          } catch (fallbackError) {
            console.error(
              "Fallback role detection also failed:",
              fallbackError
            );
          }

          console.error("All user profile endpoints failed:", lastError);
          setIsLoadingUserInfo(false);
          return;
        }

        // Extract user role from successful response
        let userRoleData: UserRole | null = null;

        // Handle different response formats
        if (userData.role) {
          userRoleData = userData.role;
        } else if (userData.data?.role) {
          userRoleData = userData.data.role;
        } else if (userData.user?.role) {
          userRoleData = userData.user.role;
        }

        setUserRole(userRoleData);

        // Check if user is Family Head
        if (userRoleData && userRoleData.role_name === "Family Head") {
          console.log("User is Family Head");
          setIsFamilyHead(true);
        } else {
          console.log(
            "User is not Family Head, role:",
            userRoleData?.role_name
          );
          setIsFamilyHead(false);
        }
      } catch (error) {
        console.error("Error loading user info:", error);
        // Set default values on error
        setIsFamilyHead(false);
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    loadUserInfo();
  }, [BASE_URL]);

  // Load categories - both expense and income
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const token = Cookies.get("access_token");

        if (!token) {
          console.error("No access token found");
          setExpenseCategories([]);
          setIncomeCategories([]);
          return;
        }

        console.log("Fetching categories...");

        // Fetch expense categories
        const expenseResponse = await fetch(`${BASE_URL}/expense-categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch income categories
        const incomeResponse = await fetch(`${BASE_URL}/income-categories`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "Expense categories response status:",
          expenseResponse.status
        );
        console.log(
          "Income categories response status:",
          incomeResponse.status
        );

        // Process expense categories
        if (expenseResponse.ok) {
          const data = await expenseResponse.json();
          console.log("Expense categories API response:", data);

          let expenseCategoriesData: ExpenseCategory[] = [];
          if (Array.isArray(data)) {
            expenseCategoriesData = data;
          } else if (data.data && Array.isArray(data.data)) {
            expenseCategoriesData = data.data;
          } else if (data.categories && Array.isArray(data.categories)) {
            expenseCategoriesData = data.categories;
          }

          console.log("Loaded expense categories:", expenseCategoriesData);
          setExpenseCategories(expenseCategoriesData);
        } else {
          const errorText = await expenseResponse.text();
          console.error(
            "Failed to fetch expense categories:",
            expenseResponse.status,
            errorText
          );
          setExpenseCategories([]);
        }

        // Process income categories
        if (incomeResponse.ok) {
          const data = await incomeResponse.json();
          console.log("Income categories API response:", data);

          let incomeCategoriesData: IncomeCategory[] = [];
          if (Array.isArray(data)) {
            incomeCategoriesData = data;
          } else if (data.data && Array.isArray(data.data)) {
            incomeCategoriesData = data.data;
          } else if (data.categories && Array.isArray(data.categories)) {
            incomeCategoriesData = data.categories;
          }

          console.log("Loaded income categories:", incomeCategoriesData);
          setIncomeCategories(incomeCategoriesData);
        } else {
          const errorText = await incomeResponse.text();
          console.error(
            "Failed to fetch income categories:",
            incomeResponse.status,
            errorText
          );
          setIncomeCategories([]);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
        setExpenseCategories([]);
        setIncomeCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, [BASE_URL]);

  // Load family members with improved error handling and family status check
  useEffect(() => {
    const loadFamilyMembers = async () => {
      try {
        setIsLoadingMembers(true);
        const token = Cookies.get("access_token");

        if (!token) {
          console.error("No access token found");
          setFamilyMembers([]);
          setHasFamily(false);
          return;
        }

        console.log("Fetching family members...");

        const response = await fetch(`${BASE_URL}/family/members`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Family members API response:", data);

          let members: FamilyMember[] = [];
          let hasFamilyData = false;

          // Handle different response formats
          if (Array.isArray(data)) {
            // If response is directly an array
            members = data;
            hasFamilyData = data.length > 0;
          } else if (data.data && Array.isArray(data.data)) {
            // If response has data property with array (Family Head response)
            members = data.data;
            hasFamilyData = data.data.length > 0;
          } else if (data.family_head || data.family_members) {
            // If response has family_head and family_members (Family Member response)
            members = [
              ...(data.family_head ? [data.family_head] : []),
              ...(data.family_members || []),
            ];
            hasFamilyData = true;
          } else if (data.members && Array.isArray(data.members)) {
            // If response has members property
            members = data.members;
            hasFamilyData = data.members.length > 0;
          }

          // Set family status
          setHasFamily(hasFamilyData);
          console.log("Has family data:", hasFamilyData);

          // Filter out Family Head - show only regular members for member selection
          // Check the nested role.role_name property

          const filteredMembers = members.filter(
            (member) => member?.role && member.role.role_name !== "Family Head"
          );

          console.log(
            "Filtered members (excluding Family Head):",
            filteredMembers
          );
          setFamilyMembers(filteredMembers);
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to fetch family members:",
            response.status,
            errorText
          );
          setFamilyMembers([]);
          setHasFamily(false);
        }
      } catch (error) {
        console.error("Error loading family members:", error);
        setFamilyMembers([]);
        setHasFamily(false);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    // Only load family members if user info is loaded
    if (!isLoadingUserInfo) {
      loadFamilyMembers();
    }
  }, [BASE_URL, isLoadingUserInfo]);

  // Update report type and handle member selector visibility
  const handleReportTypeChange = (type: string) => {
    setReportType(type);

    // If changing to personal or family, clear member selection and fetch data immediately
    if (type !== "member") {
      setSelectedMembers([]);
      setShouldFetchData(true);
    } else {
      // For member type, don't fetch data until member is selected
      setShouldFetchData(false);
    }
  };

  // Handle member selection change
  const handleMemberSelectionChange = (memberIds: number[]) => {
    setSelectedMembers(memberIds);

    // Only enable data fetching if we have at least one member selected
    if (memberIds.length > 0) {
      setShouldFetchData(true);
    } else {
      setShouldFetchData(false);
      setSummary(null); // Clear summary if no members selected
    }
  };

  // Handle expense category selection change
  const handleExpenseCategorySelectionChange = (categoryIds: number[]) => {
    setSelectedExpenseCategories(categoryIds);
  };

  // Handle income category selection change
  const handleIncomeCategorySelectionChange = (categoryIds: number[]) => {
    setSelectedIncomeCategories(categoryIds);
  };

  // Fetch combined data when component mounts or filters change
  useEffect(() => {
    const fetchCombinedData = async () => {
      // Don't fetch data for member report type until members are selected
      if (reportType === "member" && !shouldFetchData) {
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get("access_token");
        const params = new URLSearchParams({
          report_type: reportType,
          period: period,
          data_type: dataType,
          ...(period === "custom" && {
            start_date: format(startDate, "yyyy-MM-dd"),
            end_date: format(endDate, "yyyy-MM-dd"),
          }),
        });

        // Add array values properly
        if (selectedExpenseCategories.length > 0) {
          selectedExpenseCategories.forEach((id) =>
            params.append("expense_category_id[]", id.toString())
          );
        }

        if (selectedIncomeCategories.length > 0) {
          selectedIncomeCategories.forEach((id) =>
            params.append("income_category_id[]", id.toString())
          );
        }

        if (reportType === "member" && selectedMembers.length > 0) {
          selectedMembers.forEach((id) =>
            params.append("member_id[]", id.toString())
          );
        }

        console.log("Fetching combined data with params:", params.toString());

        const response = await fetch(
          `${BASE_URL}/combined/summary?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Combined API Response:", data);

          if (data.success && data.data) {
            setSummary(data);
          } else {
            console.error("API returned error:", data.message);
            setSummary(null);
          }
          setCurrentPage(1);
        } else {
          console.error("API Error:", response.status, response.statusText);
        }
      } catch (error) {
        console.error("Error fetching combined data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCombinedData();
  }, [
    startDate,
    endDate,
    period,
    reportType,
    selectedMembers,
    selectedExpenseCategories,
    selectedIncomeCategories,
    dataType,
    shouldFetchData,
    BASE_URL,
  ]);

  const generateReport = async () => {
    try {
      const token = Cookies.get("access_token");
      const requestBody: any = {
        report_type: reportType,
        format: "pdf",
        period: period,
        data_type: dataType,
        ...(period === "custom" && {
          start_date: format(startDate, "yyyy-MM-dd"),
          end_date: format(endDate, "yyyy-MM-dd"),
        }),
        ...(selectedExpenseCategories.length > 0 && {
          expense_category_id: selectedExpenseCategories,
        }),
        ...(selectedIncomeCategories.length > 0 && {
          income_category_id: selectedIncomeCategories,
        }),
        ...(reportType === "member" &&
          selectedMembers.length > 0 && {
            member_id: selectedMembers,
          }),
      };

      console.log("Generating report with body:", requestBody);

      const response = await fetch(`${BASE_URL}/combined/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const timestamp = format(new Date(), "yyyy_MM_dd_HH_mm_ss");
        a.download = `financial_report_${timestamp}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to generate report:", response.status);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  // Reset filters
  const resetFilters = () => {
    setReportType("personal");
    setPeriod("custom");
    setDataType("combined");
    setSelectedExpenseCategories([]);
    setSelectedIncomeCategories([]);
    setSelectedMembers([]);
    setStartDate(startOfMonth(today));
    setEndDate(endOfMonth(today));
    setShouldFetchData(true); // Enable data fetching for personal report
  };

  // Apply filters and close sidebar
  const applyFilters = () => {
    // If report type is member but no members selected, don't fetch data
    if (reportType === "member" && selectedMembers.length === 0) {
      setShouldFetchData(false);
      setSummary(null); // Clear any existing data
    } else {
      setShouldFetchData(true);
    }
    setShowFilters(false);
  };

  // Calculate summary values from API data using the new structure
  const totalIncome = summary?.data?.summary?.total_income || 0;
  const totalExpenses = summary?.data?.summary?.total_expense || 0;
  const netBalance = summary?.data?.summary?.net_flow || 0;

  // Get current items based on data type - UPDATED to use combined_timeline
  // Type guard to narrow to Expense | Income
  const isExpenseOrIncome = (
    v: Expense | Income | null
  ): v is Expense | Income => v !== null;

  const getCurrentItems = (): Array<Expense | Income> => {
    if (!summary?.data) return [];

    // Use the combined_timeline array from the new API response
    const combinedTimeline = summary.data.combined_timeline || [];

    // Convert the combined_timeline items to the format expected by the UI
    const convertedItems = combinedTimeline
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

    // Sort by date (newest first)
    return convertedItems.sort((a: Expense | Income, b: Expense | Income) => {
      const dateA = "expense_date" in a ? a.expense_date : a.income_date;
      const dateB = "expense_date" in b ? b.expense_date : b.income_date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  };

  // Pagination calculations
  const currentItems = getCurrentItems();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedItems = currentItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(currentItems.length / itemsPerPage);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 3;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }

    return pageNumbers;
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Get period display text
  const getPeriodDisplayText = () => {
    switch (period) {
      case "daily":
        return "Daily";
      case "weekly":
        return "Weekly";
      case "monthly":
        return "Monthly";
      case "yearly":
        return "Yearly";
      case "all":
        return "All Time";
      case "custom":
        return `${format(startDate, "MMM d, yyyy")} - ${format(
          endDate,
          "MMM d, yyyy"
        )}`;
      default:
        return "Custom Date Range";
    }
  };

  // Safe check for items array
  const hasItems = currentItems.length > 0;

  // Render transaction item based on type
  const renderTransactionItem = (item: Expense | Income) => {
    const isExpense = "expense_id" in item;
    const amount = parseFloat(item.amount);
    const date = isExpense ? item.expense_date : item.income_date;
    const categoryName = isExpense
      ? item.category.category_name
      : item.category.income_category_name;
    const description = item.description || "No description";

    // Safely handle null member_user
    const userName = item.member_user?.user_name || "Unknown";
    const userInitial = userName.charAt(0).toUpperCase();

    return (
      <div
        key={
          isExpense ? `expense-${item.expense_id}` : `income-${item.income_id}`
        }
        className="flex items-center"
      >
        <div className="w-[50px] h-[50px] bg-[#008DD2] rounded-full flex items-center justify-center mr-[12px]">
          <span className="text-white text-[20px] font-medium">
            {userInitial}
          </span>
        </div>
        <div className="flex-1">
          <h4 className="text-[20px] font-medium text-[#052C4D] leading-none">
            {description}
          </h4>
          <p className="text-[12px] text-[#052C4D] mt-1">
            {format(new Date(date), "d MMMM")} • {categoryName}
          </p>
        </div>
        <span
          className={`text-[20px] font-medium ${
            isExpense ? "text-[#FF0004]" : "text-[#26BB84]"
          }`}
        >
          {isExpense ? "-" : "+"} ${Math.abs(amount).toFixed(2)}
        </span>
      </div>
    );
  };

  // Determine available report types based on user role and family status
  const getAvailableReportTypes = () => {
    if (isFamilyHead && hasFamily) {
      return [
        { value: "personal", label: "Personal Report" },
        { value: "member", label: "Member Report" },
        { value: "family", label: "Family Report" },
      ];
    } else if (isFamilyHead && !hasFamily) {
      // Family Head but no family members (solo)
      return [{ value: "personal", label: "Personal Report" }];
    } else {
      // Regular family member or solo user
      return [{ value: "personal", label: "Personal Report" }];
    }
  };

  // Prepare member options for multi-select
  const memberOptions = familyMembers.map((member) => ({
    value: member.user_id,
    label: member.user_name,
  }));

  // Prepare expense category options for multi-select
  const expenseCategoryOptions = expenseCategories.map((cat) => ({
    value: cat.category_id,
    label: cat.category_name,
  }));

  // Prepare income category options for multi-select
  const incomeCategoryOptions = incomeCategories.map((cat) => ({
    value: cat.income_category_id,
    label: cat.income_category_name,
  }));

  const availableReportTypes = getAvailableReportTypes();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="relative w-full max-w-[390px] min-h-[844px] bg-[#008dd2]/10 shadow-lg flex flex-col">
        <PageHeader title="Reports" />

        <div className="flex-1 mt-[18px] px-6 space-y-4">
          {/* Period Display - Shows selected period or custom date range */}
          {period !== "custom" && (
            <div className="flex justify-between items-center mb-[20px]">
              <div className="flex justify-center items-center w-full h-[44px] bg-white rounded-2xl shadow-sm">
                <div className="flex items-center gap-1 text-[#052C4D]">
                  <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                  <span className="text-[16px] font-normal">
                    {getPeriodDisplayText()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Date Pickers - Only show when custom period is selected */}
          {period === "custom" && (
            <div className="flex justify-between items-center mb-[20px] relative">
              <div className="flex justify-center items-center w-[160px] h-[44px] bg-white rounded-2xl shadow-sm relative">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => date && setStartDate(date)}
                  dateFormat="MMM d, yyyy"
                  popperClassName="!z-[100]"
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                      fn: (state) => state,
                    },
                  ]}
                  customInput={
                    <div className="flex items-center gap-1 mt-[5px] text-[#052C4D] cursor-pointer">
                      <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                      <span className="text-[16px] font-normal">
                        {format(startDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  }
                />
              </div>
              <div className="flex justify-center items-center w-[160px] h-[44px] bg-white rounded-2xl shadow-sm relative">
                <DatePicker
                  selected={endDate}
                  onChange={(date) => date && setEndDate(date)}
                  dateFormat="MMM d, yyyy"
                  popperClassName="!z-[100]"
                  popperPlacement="bottom-end"
                  popperModifiers={[
                    {
                      name: "preventOverflow",
                      options: {
                        boundary: "viewport",
                      },
                      fn: (state) => state,
                    },
                  ]}
                  customInput={
                    <div className="flex items-center gap-1 mt-[5px] text-[#052C4D] cursor-pointer">
                      <AiOutlineCalendar className="h-[21px] w-[20px] text-[#008DD2]" />
                      <span className="text-[16px] font-normal">
                        {format(endDate, "MMM d, yyyy")}
                      </span>
                    </div>
                  }
                />
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div>
            <div className="flex justify-between items-center mb-[7px]">
              <h3 className="text-[20px] font-semibold text-[#052C4D]">
                Summary
              </h3>
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 text-[#008DD2] text-sm font-medium cursor-pointer"
              >
                <AiOutlineFilter className="h-5 w-5" />
                Filters
              </button>
            </div>
            <div className="flex justify-between gap">
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
                <span className="text-[12px] text-[#052C4D]">Net Balance</span>
                <span
                  className={`text-[12px] font-semibold ${
                    netBalance >= 0 ? "text-[#26BB84]" : "text-[#F44749]"
                  }`}
                >
                  ${netBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Transactions Section with Pagination */}
          <div className="mt-3 flex-1 flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[20px] font-semibold text-[#052C4D]">
                Transaction
              </h3>
              {hasItems && (
                <span className="text-sm text-[#052C4D]">
                  {currentPage} of {totalPages}
                </span>
              )}
            </div>

            {/* Transactions List Container with dynamic height */}
            <div className="flex-1 overflow-auto space-y-4 mb-4 min-h-[200px]">
              {loading ? (
                <div className="text-center py-4">
                  <span className="text-[#052C4D]">
                    Loading transactions...
                  </span>
                </div>
              ) : reportType === "member" && selectedMembers.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-[#052C4D]">
                    Please select family members to view transactions
                  </span>
                </div>
              ) : paginatedItems.length > 0 ? (
                paginatedItems.map(renderTransactionItem)
              ) : (
                <div className="text-center py-4">
                  <span className="text-[#052C4D]">
                    {summary
                      ? "No transactions found for selected filters"
                      : "Select filters to load transactions"}
                  </span>
                </div>
              )}
            </div>

            {/* Pagination Controls - Only show if there are multiple pages */}
            {hasItems && currentItems.length > itemsPerPage && (
              <div className="mt-auto">
                <Pagination className="mb-2">
                  <PaginationContent className="text-[#008DD2] flex-wrap justify-center">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          currentPage > 1 && handlePageChange(currentPage - 1)
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => handlePageChange(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer bg-transparent min-w-[40px]"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          currentPage < totalPages &&
                          handlePageChange(currentPage + 1)
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-auto sticky bottom-0 px-6">
          <div className="my-4">
            <button
              onClick={generateReport}
              disabled={
                !hasItems ||
                (reportType === "member" && selectedMembers.length === 0)
              }
              className="w-full h-[56px] bg-[#008DD2] rounded-2xl flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="text-[18px] font-bold text-white">
                Export as PDF
              </span>
            </button>
          </div>
        </div>

        {/* Filters Sidebar for Mobile */}
        {showFilters && (
          <div className="absolute inset-0 z-50">
            {/* Backdrop with reduced opacity */}
            <div
              className="absolute inset-0 bg-[#000]/50"
              onClick={() => setShowFilters(false)}
            />

            {/* Sidebar - positioned inside the device frame */}
            <div className="absolute top-0 right-0 h-full w-[300px] bg-white shadow-lg">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-[#052C4D]">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <IoClose className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="p-4 h-[calc(100%-80px)] overflow-y-auto space-y-4">
                {/* Report Type - Only show if user is Family Head */}
                {isFamilyHead && (
                  <div>
                    <label className="block text-sm font-medium text-[#052C4D] mb-1">
                      Report Type
                    </label>
                    <select
                      value={reportType}
                      onChange={(e) => handleReportTypeChange(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008DD2] text-[#052C4D]"
                    >
                      {availableReportTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {!hasFamily && isFamilyHead && (
                      <p className="text-xs text-gray-500 mt-1">
                        Add family members to access Member and Family reports
                      </p>
                    )}
                  </div>
                )}

                {/* Member Selector - Show when report type is member and user is Family Head */}
                {reportType === "member" && isFamilyHead && (
                  <MultiSelectDropdown
                    label="Select Member(s)"
                    options={memberOptions}
                    selectedValues={selectedMembers}
                    onSelectionChange={handleMemberSelectionChange}
                    placeholder="Select members..."
                    isLoading={isLoadingMembers}
                    emptyMessage="No family members available"
                  />
                )}

                {/* Data Type Selector */}
                <div>
                  <label className="block text-sm font-medium text-[#052C4D] mb-1">
                    Data Type
                  </label>
                  <select
                    value={dataType}
                    onChange={(e) =>
                      setDataType(
                        e.target.value as "expense" | "income" | "combined"
                      )
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008DD2] text-[#052C4D]"
                  >
                    <option value="combined">Combined</option>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>

                {/* Expense Categories - Show for expense or combined data types */}
                {(dataType === "expense" || dataType === "combined") && (
                  <MultiSelectDropdown
                    label="Expense Categories"
                    options={expenseCategoryOptions}
                    selectedValues={selectedExpenseCategories}
                    onSelectionChange={handleExpenseCategorySelectionChange}
                    placeholder="Select expense categories..."
                    isLoading={isLoadingCategories}
                    emptyMessage="No expense categories available"
                  />
                )}

                {/* Income Categories - Show for income or combined data types */}
                {(dataType === "income" || dataType === "combined") && (
                  <MultiSelectDropdown
                    label="Income Categories"
                    options={incomeCategoryOptions}
                    selectedValues={selectedIncomeCategories}
                    onSelectionChange={handleIncomeCategorySelectionChange}
                    placeholder="Select income categories..."
                    isLoading={isLoadingCategories}
                    emptyMessage="No income categories available"
                  />
                )}

                {/* Period Filter */}
                <div>
                  <label className="block text-sm font-medium text-[#052C4D] mb-1">
                    Period
                  </label>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#008DD2] text-[#052C4D]"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom Date Range</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute bottom-4 left-4 right-4 space-y-3">
                <button
                  onClick={resetFilters}
                  className="w-full py-3 border border-[#008DD2] text-[#008DD2] rounded-lg font-medium hover:bg-blue-50 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
                <button
                  onClick={applyFilters}
                  className="w-full py-3 bg-[#008DD2] text-white rounded-lg font-medium hover:bg-[#0070f3] transition-colors cursor-pointer"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}