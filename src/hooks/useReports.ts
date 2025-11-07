import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { format } from 'date-fns';
import { CombinedReportSummary, ReportsFilters } from '@/types/reports';

// Define the type for the PDF generation request body
type GenerateReportRequestBody = {
  report_type: string;
  format: 'pdf';
  period: string;
  data_type: string;
  start_date?: string;
  end_date?: string;
  expense_category_id?: number[];
  income_category_id?: number[];
  member_id?: number[];
};

export const useReports = (filters: ReportsFilters, shouldFetchData: boolean) => {
  const [summary, setSummary] = useState<CombinedReportSummary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCombinedData = async () => {
      if (filters.reportType === 'member' && !shouldFetchData) {
        return;
      }

      setLoading(true);
      try {
        const token = Cookies.get('access_token');
        const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
        
        const params = new URLSearchParams({
          report_type: filters.reportType,
          period: filters.period,
          data_type: filters.dataType,
          ...(filters.period === 'custom' && {
            start_date: format(filters.startDate, 'yyyy-MM-dd'),
            end_date: format(filters.endDate, 'yyyy-MM-dd'),
          }),
        });

        filters.selectedExpenseCategories.forEach((id) =>
          params.append('expense_category_id[]', id.toString())
        );

        filters.selectedIncomeCategories.forEach((id) =>
          params.append('income_category_id[]', id.toString())
        );

        if (filters.reportType === 'member' && filters.selectedMembers.length > 0) {
          filters.selectedMembers.forEach((id) =>
            params.append('member_id[]', id.toString())
          );
        }

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
          if (data.success && data.data) {
            setSummary(data);
          } else {
            setSummary(null);
          }
        }
      } catch (error) {
        console.error('Error fetching combined data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCombinedData();
  }, [filters, shouldFetchData]);

  const generateReport = async () => {
    try {
      const token = Cookies.get('access_token');
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const requestBody: GenerateReportRequestBody = {
        report_type: filters.reportType,
        format: 'pdf',
        period: filters.period,
        data_type: filters.dataType,
        ...(filters.period === 'custom' && {
          start_date: format(filters.startDate, 'yyyy-MM-dd'),
          end_date: format(filters.endDate, 'yyyy-MM-dd'),
        }),
        ...(filters.selectedExpenseCategories.length > 0 && {
          expense_category_id: filters.selectedExpenseCategories,
        }),
        ...(filters.selectedIncomeCategories.length > 0 && {
          income_category_id: filters.selectedIncomeCategories,
        }),
        ...(filters.reportType === 'member' &&
          filters.selectedMembers.length > 0 && {
            member_id: filters.selectedMembers,
          }),
      };

      const response = await fetch(`${BASE_URL}/combined/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const timestamp = format(new Date(), 'yyyy_MM_dd_HH_mm_ss');
        a.download = `financial_report_${timestamp}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  return { summary, loading, generateReport };
};