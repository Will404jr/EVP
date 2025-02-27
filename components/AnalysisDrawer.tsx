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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Users,
  Info,
} from "lucide-react";

interface MoodItem {
  _id: string;
  mood: "good" | "fair" | "bad";
  username: string;
  department: string;
  createdAt: string;
}

interface AnalysisDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  moods: MoodItem[];
}

export function AnalysisDrawer({
  isOpen,
  onClose,
  moods,
}: AnalysisDrawerProps) {
  const [moodCounts, setMoodCounts] = useState<Record<string, number>>({});
  const [departmentMoods, setDepartmentMoods] = useState<
    {
      department: string;
      good: number;
      fair: number;
      bad: number;
      total: number;
      score: number;
    }[]
  >([]);
  const [topDepartment, setTopDepartment] = useState<string>("");
  const [bottomDepartment, setBottomDepartment] = useState<string>("");
  const [overallScore, setOverallScore] = useState<number>(0);

  // Mood colors using improved palette
  const GOOD_COLOR = "#10b981"; // emerald-500
  const FAIR_COLOR = "#3b82f6"; // blue-500
  const BAD_COLOR = "#ef4444"; // red-500

  // Emoji mapping
  const moodEmojis = {
    good: "😊",
    fair: "😐",
    bad: "😔",
  };

  useEffect(() => {
    // Calculate overall mood counts
    const counts: Record<string, number> = {
      good: 0,
      fair: 0,
      bad: 0,
    };

    moods.forEach((item) => {
      counts[item.mood] = (counts[item.mood] || 0) + 1;
    });
    setMoodCounts(counts);

    // Calculate department mood breakdown
    const departmentData: Record<
      string,
      { good: number; fair: number; bad: number; total: number }
    > = {};

    moods.forEach((item) => {
      if (!departmentData[item.department]) {
        departmentData[item.department] = {
          good: 0,
          fair: 0,
          bad: 0,
          total: 0,
        };
      }

      departmentData[item.department][item.mood]++;
      departmentData[item.department].total++;
    });

    // Convert to array and calculate mood scores
    // Score calculation: (good * 1 + fair * 0.5 + bad * 0) / total * 100
    const departments = Object.entries(departmentData).map(([dept, data]) => ({
      department: dept,
      ...data,
      score:
        data.total > 0
          ? ((data.good * 1 + data.fair * 0.5) / data.total) * 100
          : 0,
    }));

    // Sort by score for analysis
    const sortedDepartments = [...departments].sort(
      (a, b) => b.score - a.score
    );

    // Find top and bottom departments (if more than one department exists)
    if (sortedDepartments.length > 1) {
      setTopDepartment(sortedDepartments[0].department);
      setBottomDepartment(
        sortedDepartments[sortedDepartments.length - 1].department
      );
    }

    // Calculate overall company mood score
    const totalEmployees = moods.length;
    const totalGood = counts.good;
    const totalFair = counts.fair;
    if (totalEmployees > 0) {
      setOverallScore(
        ((totalGood * 1 + counts.fair * 0.5) / totalEmployees) * 100
      );
    }

    // Sort alphabetically for display
    setDepartmentMoods(
      departments.sort((a, b) => a.department.localeCompare(b.department))
    );
  }, [moods]);

  // Function to get a color based on mood score
  const getMoodScoreColor = (score: number): string => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-green-600";
    if (score >= 40) return "text-yellow-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  // Function to get a background color class based on mood score
  const getMoodScoreBgColor = (score: number): string => {
    if (score >= 80) return "bg-emerald-100";
    if (score >= 60) return "bg-green-100";
    if (score >= 40) return "bg-yellow-100";
    if (score >= 20) return "bg-orange-100";
    return "bg-red-100";
  };

  // Function to get emoji based on score
  const getScoreEmoji = (score: number): string => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    if (score >= 40) return "😐";
    if (score >= 20) return "😔";
    return "😞";
  };

  // Get status text based on overall score
  const getOverallStatus = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Neutral";
    if (score >= 20) return "Concerning";
    return "Critical";
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh] flex flex-col bg-gradient-to-b from-[#13263c] to-[#0f1a2a]">
        <DrawerHeader className="border-b border-[#2a3f59] pb-4">
          <DrawerTitle className="text-white text-2xl flex items-center gap-2">
            <span className="bg-[#6CBE45] p-1 rounded text-white">
              <Users size={20} />
            </span>
            Team Mood Dashboard
          </DrawerTitle>
          <DrawerDescription className="text-gray-300">
            Tracking employee sentiment across all departments
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Overall Mood Score Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-center md:text-left">
                    <h3 className="text-lg font-medium text-blue-200">
                      Company Mood Score
                    </h3>
                    <div className="flex items-center mt-1 gap-2">
                      <span className="text-4xl font-bold">
                        {overallScore.toFixed(1)}%
                      </span>
                      <span className="text-3xl">
                        {getScoreEmoji(overallScore)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-blue-200">
                      Status:{" "}
                      <span className="font-medium">
                        {getOverallStatus(overallScore)}
                      </span>
                    </div>
                  </div>

                  <div className="h-14 w-1 bg-blue-700 hidden md:block"></div>

                  <div className="flex justify-center gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold">
                        {moodCounts.good || 0}
                      </div>
                      <div className="text-sm text-blue-200 flex items-center justify-center gap-1">
                        <span className="text-lg">😊</span> Good
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">
                        {moodCounts.fair || 0}
                      </div>
                      <div className="text-sm text-blue-200 flex items-center justify-center gap-1">
                        <span className="text-lg">😐</span> Fair
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold">
                        {moodCounts.bad || 0}
                      </div>
                      <div className="text-sm text-blue-200 flex items-center justify-center gap-1">
                        <span className="text-lg">😔</span> Bad
                      </div>
                    </div>
                  </div>
                </div>

                {topDepartment && bottomDepartment && (
                  <div className="mt-4 pt-4 border-t border-blue-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="text-green-400" size={18} />
                      <span className="text-sm">
                        Highest morale:{" "}
                        <span className="font-medium">{topDepartment}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="text-red-400" size={18} />
                      <span className="text-sm">
                        Needs attention:{" "}
                        <span className="font-medium">{bottomDepartment}</span>
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs for different views */}
            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-[#1e3a5c]">
                <TabsTrigger
                  value="visualization"
                  className="text-white data-[state=active]:bg-[#2a4a6d]"
                >
                  Visualization
                </TabsTrigger>
                <TabsTrigger
                  value="comparison"
                  className="text-white data-[state=active]:bg-[#2a4a6d]"
                >
                  Department Comparison
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="text-white data-[state=active]:bg-[#2a4a6d]"
                >
                  Detailed Analysis
                </TabsTrigger>
              </TabsList>

              {/* Visualization Tab */}
              <TabsContent value="visualization" className="mt-0">
                <Card className="border-0 shadow bg-[#1e3a5c]">
                  <CardHeader className="pb-2 border-b border-[#2a4a6d]">
                    <CardTitle className="text-lg font-semibold text-white">
                      Department Mood Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {departmentMoods.length > 0 ? (
                      <>
                        {/* Chart Area */}
                        <div className="h-[320px] w-full rounded-lg p-4">
                          <svg width="100%" height="100%" viewBox="0 0 400 300">
                            {/* Department Bars */}
                            {departmentMoods.map((dept, index) => {
                              // Bar positioning
                              const barHeight = 28;
                              const barGap = 20;
                              const y = 10 + index * (barHeight + barGap);

                              // Calculate widths for mood segments
                              const totalWidth = 260;
                              const goodWidth =
                                dept.total > 0
                                  ? (dept.good / dept.total) * totalWidth
                                  : 0;
                              const fairWidth =
                                dept.total > 0
                                  ? (dept.fair / dept.total) * totalWidth
                                  : 0;
                              const badWidth =
                                dept.total > 0
                                  ? (dept.bad / dept.total) * totalWidth
                                  : 0;

                              return (
                                <g key={dept.department}>
                                  {/* Department label */}
                                  <text
                                    x="0"
                                    y={y + barHeight / 2 + 4}
                                    fontSize="12"
                                    fill="#f8fafc"
                                    fontWeight="bold"
                                    textAnchor="start"
                                  >
                                    {dept.department}
                                  </text>

                                  {/* Good mood bar */}
                                  <rect
                                    x="100"
                                    y={y}
                                    width={goodWidth}
                                    height={barHeight}
                                    fill={GOOD_COLOR}
                                    rx="3"
                                  />
                                  {goodWidth > 30 && (
                                    <text
                                      x={100 + goodWidth / 2}
                                      y={y + barHeight / 2 + 4}
                                      fontSize="11"
                                      fill="white"
                                      textAnchor="middle"
                                      fontWeight="bold"
                                    >
                                      {dept.good}
                                    </text>
                                  )}

                                  {/* Fair mood bar */}
                                  <rect
                                    x={100 + goodWidth}
                                    y={y}
                                    width={fairWidth}
                                    height={barHeight}
                                    fill={FAIR_COLOR}
                                    rx="0"
                                  />
                                  {fairWidth > 30 && (
                                    <text
                                      x={100 + goodWidth + fairWidth / 2}
                                      y={y + barHeight / 2 + 4}
                                      fontSize="11"
                                      fill="white"
                                      textAnchor="middle"
                                      fontWeight="bold"
                                    >
                                      {dept.fair}
                                    </text>
                                  )}

                                  {/* Bad mood bar */}
                                  <rect
                                    x={100 + goodWidth + fairWidth}
                                    y={y}
                                    width={badWidth}
                                    height={barHeight}
                                    fill={BAD_COLOR}
                                    rx="0"
                                  />
                                  {badWidth > 30 && (
                                    <text
                                      x={
                                        100 +
                                        goodWidth +
                                        fairWidth +
                                        badWidth / 2
                                      }
                                      y={y + barHeight / 2 + 4}
                                      fontSize="11"
                                      fill="white"
                                      textAnchor="middle"
                                      fontWeight="bold"
                                    >
                                      {dept.bad}
                                    </text>
                                  )}

                                  {/* Mood score with improved styling */}
                                  <g>
                                    <circle
                                      cx="380"
                                      cy={y + barHeight / 2}
                                      r="16"
                                      fill={
                                        dept.score >= 80
                                          ? "#10b981"
                                          : dept.score >= 60
                                          ? "#22c55e"
                                          : dept.score >= 40
                                          ? "#facc15"
                                          : dept.score >= 20
                                          ? "#f97316"
                                          : "#ef4444"
                                      }
                                    />
                                    <text
                                      x="380"
                                      y={y + barHeight / 2 + 4}
                                      fontSize="11"
                                      fill="white"
                                      fontWeight="bold"
                                      textAnchor="middle"
                                    >
                                      {dept.score.toFixed(0)}
                                    </text>
                                  </g>
                                </g>
                              );
                            })}
                          </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex justify-between mt-2 p-4 bg-[#16304d] rounded-lg">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: GOOD_COLOR }}
                              />
                              <span className="text-sm text-gray-200">
                                Good
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: FAIR_COLOR }}
                              />
                              <span className="text-sm text-gray-200">
                                Fair
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: BAD_COLOR }}
                              />
                              <span className="text-sm text-gray-200">Bad</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Info size={16} className="text-gray-300" />
                            <span className="text-sm text-gray-300">
                              Score: Good (100%), Fair (50%), Bad (0%)
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-gray-400">
                            No mood data available
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comparison Tab */}
              <TabsContent value="comparison" className="mt-0">
                <Card className="border-0 shadow bg-[#1e3a5c]">
                  <CardHeader className="pb-2 border-b border-[#2a4a6d]">
                    <CardTitle className="text-lg font-semibold text-white">
                      Department Mood Comparison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {departmentMoods.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {departmentMoods.map((dept) => (
                          <Card
                            key={dept.department}
                            className={`border-0 ${getMoodScoreBgColor(
                              dept.score
                            )} bg-opacity-10`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-md font-medium text-white">
                                  {dept.department}
                                </CardTitle>
                                <Badge
                                  className={`${getMoodScoreColor(
                                    dept.score
                                  )} bg-white`}
                                >
                                  {getScoreEmoji(dept.score)}{" "}
                                  {dept.score.toFixed(1)}%
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="mt-2">
                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                  <div className="flex h-2.5 rounded-l-full">
                                    <div
                                      className="h-2.5 rounded-l-full"
                                      style={{
                                        width: `${
                                          (dept.good / dept.total) * 100
                                        }%`,
                                        backgroundColor: GOOD_COLOR,
                                      }}
                                    ></div>
                                    <div
                                      className="h-2.5"
                                      style={{
                                        width: `${
                                          (dept.fair / dept.total) * 100
                                        }%`,
                                        backgroundColor: FAIR_COLOR,
                                      }}
                                    ></div>
                                    <div
                                      className="h-2.5 rounded-r-full"
                                      style={{
                                        width: `${
                                          (dept.bad / dept.total) * 100
                                        }%`,
                                        backgroundColor: BAD_COLOR,
                                      }}
                                    ></div>
                                  </div>
                                </div>

                                <div className="flex justify-between mt-2 text-xs text-gray-300">
                                  <div className="flex items-center">
                                    <span className="mr-1 text-lg">😊</span>{" "}
                                    {dept.good} (
                                    {((dept.good / dept.total) * 100).toFixed(
                                      1
                                    )}
                                    %)
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-1 text-lg">😐</span>{" "}
                                    {dept.fair} (
                                    {((dept.fair / dept.total) * 100).toFixed(
                                      1
                                    )}
                                    %)
                                  </div>
                                  <div className="flex items-center">
                                    <span className="mr-1 text-lg">😔</span>{" "}
                                    {dept.bad} (
                                    {((dept.bad / dept.total) * 100).toFixed(1)}
                                    %)
                                  </div>
                                </div>

                                <div className="mt-3 text-sm text-gray-300">
                                  Total employees:{" "}
                                  <span className="font-medium text-white">
                                    {dept.total}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-gray-400">
                            No mood data available
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Details Tab */}
              <TabsContent value="details" className="mt-0">
                <Card className="border-0 shadow bg-[#1e3a5c]">
                  <CardHeader className="pb-2 border-b border-[#2a4a6d]">
                    <CardTitle className="text-lg font-semibold text-white">
                      Detailed Mood Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {departmentMoods.length > 0 ? (
                      <div className="overflow-hidden rounded-lg">
                        <table className="min-w-full divide-y divide-[#2a4a6d]">
                          <thead className="bg-[#16304d]">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Department
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Good 😊
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Fair 😐
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Bad 😔
                              </th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Total
                              </th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                                Mood Score
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-[#1e3a5c] divide-y divide-[#2a4a6d]">
                            {departmentMoods.map((dept) => (
                              <tr
                                key={dept.department}
                                className="hover:bg-[#2a4a6d]"
                              >
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-white">
                                  {dept.department}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  <span className="font-medium text-white">
                                    {dept.good}
                                  </span>
                                  {dept.total > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      (
                                      {((dept.good / dept.total) * 100).toFixed(
                                        1
                                      )}
                                      %)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  <span className="font-medium text-white">
                                    {dept.fair}
                                  </span>
                                  {dept.total > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      (
                                      {((dept.fair / dept.total) * 100).toFixed(
                                        1
                                      )}
                                      %)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center text-gray-300">
                                  <span className="font-medium text-white">
                                    {dept.bad}
                                  </span>
                                  {dept.total > 0 && (
                                    <span className="text-xs text-gray-400 ml-1">
                                      (
                                      {((dept.bad / dept.total) * 100).toFixed(
                                        1
                                      )}
                                      %)
                                    </span>
                                  )}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-medium text-white">
                                  {dept.total}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                  <span
                                    className={`font-medium ${getMoodScoreColor(
                                      dept.score
                                    )}`}
                                  >
                                    {dept.score.toFixed(1)}%
                                  </span>
                                </td>
                              </tr>
                            ))}

                            {/* Total row */}
                            <tr className="bg-[#16304d]">
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-white">
                                All Departments
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-white">
                                {moodCounts.good || 0}
                                {moods.length > 0 && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    (
                                    {(
                                      ((moodCounts.good || 0) / moods.length) *
                                      100
                                    ).toFixed(1)}
                                    %)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-white">
                                {moodCounts.fair || 0}
                                {moods.length > 0 && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    (
                                    {(
                                      ((moodCounts.fair || 0) / moods.length) *
                                      100
                                    ).toFixed(1)}
                                    %)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-white">
                                {moodCounts.bad || 0}
                                {moods.length > 0 && (
                                  <span className="text-xs text-gray-400 ml-1">
                                    (
                                    {(
                                      ((moodCounts.bad || 0) / moods.length) *
                                      100
                                    ).toFixed(1)}
                                    %)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-bold text-white">
                                {moods.length}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                <span
                                  className={`font-bold ${getMoodScoreColor(
                                    overallScore
                                  )}`}
                                >
                                  {overallScore.toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="h-[200px] flex items-center justify-center">
                        <div className="text-center">
                          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-gray-400">
                            No mood data available
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
