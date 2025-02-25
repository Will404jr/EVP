"use client";

import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FeedbackItem {
  _id: string;
  status: "Open" | "Resolved" | "Pending" | "Overdue";
  createdAt: string;
}

interface AnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  feedback: FeedbackItem[];
}

export function AnalysisDrawer({
  isOpen,
  onClose,
  feedback,
}: AnalysisDrawerProps) {
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [monthlyData, setMonthlyData] = useState<
    { month: string; resolved: number; total: number; displayMonth: string }[]
  >([]);

  // Status card colors mapping - enhanced with better colors
  const statusColors = {
    Open: "bg-blue-100 border-blue-300",
    Resolved: "bg-green-100 border-green-300",
    Pending: "bg-amber-100 border-amber-300",
    Overdue: "bg-red-100 border-red-300",
  };

  // Graph colors with better contrast
  const TOTAL_BAR_COLOR = "#3b82f6"; // blue-500
  const RESOLVED_BAR_COLOR = "#22c55e"; // green-500

  useEffect(() => {
    const counts: Record<string, number> = {
      Open: 0,
      Resolved: 0,
      Pending: 0,
      Overdue: 0,
    };
    feedback.forEach((item) => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    setStatusCounts(counts);

    const monthlyStats: Record<
      string,
      { resolved: number; total: number; displayMonth: string }
    > = {};
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    feedback.forEach((item) => {
      const date = new Date(item.createdAt);
      if (date >= oneYearAgo) {
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        // Create a user-friendly month display (e.g., "Jan '23")
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const displayMonth = `${monthNames[date.getMonth()]} '${date
          .getFullYear()
          .toString()
          .slice(2)}`;

        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { resolved: 0, total: 0, displayMonth };
        }
        monthlyStats[monthKey].total++;
        if (item.status === "Resolved") {
          monthlyStats[monthKey].resolved++;
        }
      }
    });

    const sortedMonthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));

    setMonthlyData(sortedMonthlyData);
  }, [feedback]);

  // Function to format percentage
  const getResolvedPercentage = (resolved: number, total: number) => {
    if (total === 0) return "0%";
    return `${Math.round((resolved / total) * 100)}%`;
  };

  // Calculate max value for graph scale with some padding
  const maxValue = Math.max(...monthlyData.map((d) => d.total), 1) * 1.1;

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh] overflow-y-auto bg-[#13263c]">
        <DrawerHeader>
          <DrawerTitle className="text-white text-xl">
            Feedback Analysis
          </DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Overview of feedback status and trends
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          {/* Status Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Card
                key={status}
                className={`${
                  statusColors[status as keyof typeof statusColors]
                } border shadow-sm transition-all hover:shadow-md`}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-800">
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {count}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {count > 0
                      ? `${Math.round(
                          (count / feedback.length) * 100
                        )}% of total`
                      : "No data"}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Graph Card */}
          <Card className="border shadow">
            <CardHeader className="pb-2 border-b">
              <CardTitle className="text-lg font-semibold">
                Monthly Resolved vs Total Issues
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {monthlyData.length > 0 ? (
                <>
                  {/* Chart Area */}
                  <div className="h-[220px] w-full bg-white rounded-lg p-4">
                    <svg width="100%" height="100%" viewBox="0 0 400 200">
                      {/* Bars */}
                      {monthlyData.map((data, index) => {
                        // Calculate bar width and positioning
                        const barWidth = 16;
                        const barGap = 6;
                        const groupWidth = barWidth * 2 + barGap;
                        const totalWidth = monthlyData.length * groupWidth;

                        // Center the bars if there are few months
                        const startX =
                          totalWidth < 380 ? (400 - totalWidth) / 2 : 10;

                        const x = startX + index * groupWidth + barWidth / 2;

                        // Calculate heights relative to the max value
                        const totalHeight = (data.total / maxValue) * 160;
                        const resolvedHeight = (data.resolved / maxValue) * 160;

                        return (
                          <g key={data.month}>
                            {/* Total bar */}
                            <rect
                              x={x}
                              y={180 - totalHeight}
                              width={barWidth}
                              height={totalHeight}
                              fill={TOTAL_BAR_COLOR}
                              rx="2"
                              className="opacity-80"
                            />

                            {/* Resolved bar */}
                            <rect
                              x={x + barWidth + barGap}
                              y={180 - resolvedHeight}
                              width={barWidth}
                              height={resolvedHeight}
                              fill={RESOLVED_BAR_COLOR}
                              rx="2"
                              className="opacity-90"
                            />

                            {/* Value labels on top of bars */}
                            <text
                              x={x + barWidth / 2}
                              y={175 - totalHeight}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#334155"
                              fontWeight="medium"
                            >
                              {data.total}
                            </text>

                            <text
                              x={x + barWidth + barGap + barWidth / 2}
                              y={175 - resolvedHeight}
                              textAnchor="middle"
                              fontSize="9"
                              fill="#14532d"
                              fontWeight="medium"
                            >
                              {data.resolved}
                            </text>

                            {/* X-axis line */}
                            <line
                              x1="10"
                              y1="180"
                              x2="390"
                              y2="180"
                              stroke="#e2e8f0"
                              strokeWidth="1"
                            />

                            {/* Month labels */}
                            <text
                              x={x + barWidth / 2 + barGap / 2}
                              y="195"
                              textAnchor="middle"
                              fontSize="10"
                              fill="#64748b"
                            >
                              {data.displayMonth}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex justify-between mt-4">
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded" />
                        <span className="text-sm text-gray-600">
                          Total Issues
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        <span className="text-sm text-gray-600">
                          Resolved Issues
                        </span>
                      </div>
                    </div>

                    {/* Average resolution rate */}
                    <div className="text-sm text-gray-600">
                      Overall Resolution Rate:
                      <span className="ml-1 font-medium">
                        {getResolvedPercentage(
                          monthlyData.reduce(
                            (sum, data) => sum + data.resolved,
                            0
                          ),
                          monthlyData.reduce((sum, data) => sum + data.total, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  No data available for the selected time period
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
