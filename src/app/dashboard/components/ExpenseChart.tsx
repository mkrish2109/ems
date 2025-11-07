import { PieChart, Pie, Cell, LabelList, ResponsiveContainer } from "recharts";
import { DashboardData } from "@/types/dashboard";

interface ExpenseChartProps {
  data: DashboardData;
  isFamilyHead: boolean;
}

export default function ExpenseChart({ data, isFamilyHead }: ExpenseChartProps) {
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

  if (!chartData || chartData.length === 0) {
    return null;
  }

  return (
    <div className="h-auto bg-white rounded-[10px] mx-auto py-[13px] px-[11px] shadow-sm">
      <div className="max-[360px]:flex-col max-[360px]:gap-2">
        <h4 className="text-[14px] font-semibold text-[#052C4D] mb-[7px]">
          {isFamilyHead
            ? "Family Wise Expenses"
            : "Category Wise Expenses"}
        </h4>
        <div className="flex justify-between items-center max-[360px]:flex-col max-[360px]:items-center max-[360px]:gap-4">
          {/* Chart Section */}
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
  );
}