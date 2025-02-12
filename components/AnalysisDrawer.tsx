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
    { month: string; resolved: number; total: number }[]
  >([]);

  // Status card colors mapping
  const statusColors = {
    Open: "bg-blue-50",
    Resolved: "bg-green-50",
    Pending: "bg-blue-50",
    Overdue: "bg-blue-50",
  };

  // Graph colors
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

    const monthlyStats: Record<string, { resolved: number; total: number }> =
      {};
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    feedback.forEach((item) => {
      const date = new Date(item.createdAt);
      if (date >= oneYearAgo) {
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        if (!monthlyStats[monthKey]) {
          monthlyStats[monthKey] = { resolved: 0, total: 0 };
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="h-[80vh] overflow-y-auto">
        <DrawerHeader>
          <DrawerTitle>Feedback Analysis</DrawerTitle>
          <DrawerDescription>
            Overview of feedback status and trends
          </DrawerDescription>
        </DrawerHeader>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <Card
                key={status}
                className={statusColors[status as keyof typeof statusColors]}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {status}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Monthly Resolved vs Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full">
                <svg width="100%" height="100%" viewBox="0 0 400 200">
                  {monthlyData.map((data, index) => {
                    const x = (index / (monthlyData.length - 1)) * 380 + 10;
                    const totalHeight =
                      (data.total /
                        Math.max(...monthlyData.map((d) => d.total))) *
                      180;
                    const resolvedHeight =
                      (data.resolved /
                        Math.max(...monthlyData.map((d) => d.total))) *
                      180;
                    return (
                      <g key={data.month}>
                        <rect
                          x={x - 8}
                          y={200 - totalHeight}
                          width="16"
                          height={totalHeight}
                          fill={TOTAL_BAR_COLOR}
                          className="opacity-90"
                        />
                        <rect
                          x={x - 8}
                          y={200 - resolvedHeight}
                          width="16"
                          height={resolvedHeight}
                          fill={RESOLVED_BAR_COLOR}
                          className="opacity-90"
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded" />
                    <span className="text-sm text-gray-600">Total Issues</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span className="text-sm text-gray-600">
                      Resolved Issues
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-500">
                <span>{monthlyData[0]?.month}</span>
                <span>{monthlyData[monthlyData.length - 1]?.month}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
