import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { IncomeCategory } from "@/types/income";

export const useIncomeCategories = () => {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncomeCategories = async () => {
    try {
      const accessToken = Cookies.get("access_token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/income-categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (res.ok) {
        const data: IncomeCategory[] = await res.json();
        setCategories(data);
      } else {
        setError("Failed to fetch income categories");
      }
    } catch {
      setError("Failed to fetch income categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeCategories();
  }, []);

  return { categories, loading, error, refetch: fetchIncomeCategories };
};