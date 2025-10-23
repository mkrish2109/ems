import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role") as "Family Head" | "Family Member" | null;

  if (role === "Family Head") {
    // Family Head → Family-wise expenses
    const data = {
      totalExpenses: 2500,
      today: 270,
      familyExpenses: [
        { name: "Dad", amount: 400, color: "#008DD2" },
        { name: "Mother", amount: 300, color: "#052C4D" },
        { name: "Brother", amount: 200, color: "#89D200" },
        { name: "Sister", amount: 250, color: "#AF00D2" },
        { name: "Brother 01", amount: 150, color: "#BF0003" },
        { name: "Grandmother", amount: 220, color: "#FFB412" },
      ],
      recentTransactions: [
        { title: "Milk", amount: 20, time: "10:50am, Today" },
        { title: "Shopping", amount: 250, time: "10:30 AM" },
        { title: "Snack", amount: 50, time: "1:00 PM" },
        { title: "Pizza party", amount: 100, time: "6:30 PM" },
        { title: "Milk123", amount: 20, time: "10:50am, Today" },
        { title: "Shopping", amount: 250, time: "10:50am, Yesterday" },
        { title: "Snack", amount: 50, time: "10:50am, Yesterday" },
        { title: "Pizza party", amount: 100, time: "10:50am, 14/09/2025" },
        { title: "xyz", amount: 1000, time: "10:50am, 13/09/2025" },
        { title: "xyz1", amount: 1000, time: "10:50am, 11/09/2025" },
        { title: "xyz3", amount: 1000, time: "10:50am, 11/09/2025" },
      ],
      notifications: [
        "Brother expenses weekly budget high",
        "Dad exceeded daily limit",
        "Unusual expense detected",
      ],
    };

    return NextResponse.json(data);
  } else {
    // Family Member → Category-wise expenses
    const data = {
      totalExpenses: 520,
      today: 120,
      categoryExpenses: [
        { category: "Food", amount: 80, color: "#008DD2" },
        { category: "Shopping", amount: 90, color: "#AF00D2" },
        { category: "Travel", amount: 150, color: "#FFB412" },
        { category: "Entertainment", amount: 200, color: "#89D200" },
      ],
      recentTransactions: [
        { title: "Grocery", amount: 40, time: "9:30 AM" },
        { title: "Bus Ticket", amount: 20, time: "11:00 AM" },
        { title: "Snacks", amount: 60, time: "2:00 PM" },
        { title: "Grocery", amount: 40, time: "9:30 AM" },
        { title: "Bus Ticket", amount: 20, time: "11:00 AM" },
        { title: "Snacks", amount: 60, time: "2:00 PM" },
        { title: "Grocery", amount: 40, time: "9:30 AM" },
        { title: "Bus Ticket", amount: 20, time: "11:00 AM" },
        { title: "Snacks", amount: 60, time: "2:00 PM" },
      ],
      notifications: [
        "Budget limit crossed",
        "Unusual expense detected",
        "Unusual expense detected",
      ],
    };

    return NextResponse.json(data);
  }
}
