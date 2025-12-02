"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  X,
  TrendingUp,
  Users,
  Calendar,
  Building2,
  BarChart3,
  PieChart,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Filter,
} from "lucide-react";

// Updated MoodItem interface to use userId instead of username
interface MoodItem {
  _id: string;
  mood: "good" | "fair" | "bad";
  userId: string; // Changed from username to userId
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
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("week");
  const [userMap, setUserMap] = useState<
    Record<string, { displayName: string }>
  >({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch user data for all users in the mood data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!moods || moods.length === 0) return;

      setIsLoadingUsers(true);
      try {
        // Collect all unique user IDs
        const userIds = new Set<string>();
        moods.forEach((mood) => {
          if (mood.userId) userIds.add(mood.userId);
        });

        // Create a map of user data
        const userDataMap: Record<string, { displayName: string }> = {};

        // Fetch user data for each ID
        for (const userId of userIds) {
          try {
            const response = await fetch(
              `https://askyourmd.nssfug.org/api/users/${userId}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                userDataMap[userId] = {
                  displayName: data.user.displayName || "Unknown User",
                };
              }
            }
          } catch (error) {
            console.error(`Error fetching user ${userId}:`, error);
          }
        }

        setUserMap(userDataMap);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    if (isOpen && moods && moods.length > 0) {
      fetchUserData();
    }
  }, [isOpen, moods]);

  // Get user display name from ID
  const getUserDisplayName = (userId: string): string => {
    if (!userId) return "Unknown User";
    const user = userMap[userId];
    return user ? user.displayName : "Unknown User";
  };

  // Get user initials
  const getUserInitials = (userId: string): string => {
    if (!userId) return "UN";
    const user = userMap[userId];
    if (!user) return "UN";
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter moods based on selected department and timeframe
  const filteredMoods = moods.filter((mood) => {
    const departmentMatch =
      selectedDepartment === "all" || mood.department === selectedDepartment;

    const moodDate = new Date(mood.createdAt);
    const now = new Date();

    let timeframeMatch = true;
    if (selectedTimeframe === "day") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      timeframeMatch = moodDate >= today;
    } else if (selectedTimeframe === "week") {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      timeframeMatch = moodDate >= oneWeekAgo;
    } else if (selectedTimeframe === "month") {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(now.getMonth() - 1);
      timeframeMatch = moodDate >= oneMonthAgo;
    }

    return departmentMatch && timeframeMatch;
  });

  // Calculate mood statistics
  const totalMoods = filteredMoods.length;
  const goodMoods = filteredMoods.filter((mood) => mood.mood === "good").length;
  const fairMoods = filteredMoods.filter((mood) => mood.mood === "fair").length;
  const badMoods = filteredMoods.filter((mood) => mood.mood === "bad").length;

  const goodPercentage =
    totalMoods > 0 ? Math.round((goodMoods / totalMoods) * 100) : 0;
  const fairPercentage =
    totalMoods > 0 ? Math.round((fairMoods / totalMoods) * 100) : 0;
  const badPercentage =
    totalMoods > 0 ? Math.round((badMoods / totalMoods) * 100) : 0;

  // Get unique departments
  const departments = ["all", ...new Set(moods.map((mood) => mood.department))];

  const getDepartmentColor = (department: string) => {
    const colors = {
      "People & Culture": "from-purple-400 to-purple-600",
      "Marketing and Corporate Affairs": "from-pink-400 to-pink-600",
      Finance: "from-green-400 to-green-600",
      TES: "from-blue-400 to-blue-600",
      Commercial: "from-orange-400 to-orange-600",
      ERM: "from-red-400 to-red-600",
      "E & G": "from-teal-400 to-teal-600",
      Strategy: "from-indigo-400 to-indigo-600",
      PDU: "from-cyan-400 to-cyan-600",
      "MD/DMDs Office": "from-amber-400 to-amber-600",
      "Legal & Board Affairs": "from-slate-400 to-slate-600",
      Investments: "from-emerald-400 to-emerald-600",
      "Internal Audit": "from-violet-400 to-violet-600",
    };
    return (
      colors[department as keyof typeof colors] || "from-gray-400 to-gray-600"
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh] bg-gradient-to-br from-blue-500 via-gray-100 to-blue-500 border-0 shadow-2xl">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>

        <DrawerHeader className="bg-gradient-to-r from-blue-50 to-white border-b border-gray-100 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12" />

          <div className="flex justify-between items-center relative">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg animate-pulse" />
              <DrawerTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-500" />
                Mood Analysis Dashboard
              </DrawerTitle>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-red-50 hover:text-red-500 transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <div className="p-6 overflow-y-auto">
          {/* Filter Controls */}
          <Card className="p-6 mb-6 bg-gradient-to-r from-white to-gray-50 border-0 shadow-lg rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-indigo-500" />
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onValueChange={setSelectedDepartment}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    {departments.map((dept) => (
                      <SelectItem
                        key={dept}
                        value={dept}
                        className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                      >
                        <div className="flex items-center gap-2">
                          {dept !== "all" && (
                            <div
                              className={`w-2 h-2 rounded-full bg-gradient-to-r ${getDepartmentColor(
                                dept
                              )}`}
                            />
                          )}
                          {dept === "all" ? "All Departments" : dept}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-500" />
                  Timeframe
                </label>
                <Select
                  value={selectedTimeframe}
                  onValueChange={setSelectedTimeframe}
                >
                  <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl">
                    <SelectItem
                      value="day"
                      className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    >
                      Today
                    </SelectItem>
                    <SelectItem
                      value="week"
                      className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    >
                      Last 7 days
                    </SelectItem>
                    <SelectItem
                      value="month"
                      className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                    >
                      Last 30 days
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl p-1 shadow-sm">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <PieChart className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="details"
                className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                <Users className="w-4 h-4 mr-2" />
                Details
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Mood Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 group">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Smile className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {goodPercentage}%
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-green-700">
                        Good Mood
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                        {goodMoods} responses
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 group">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Meh className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {fairPercentage}%
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-blue-700">
                        Fair Mood
                      </div>
                      <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0">
                        {fairMoods} responses
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-gray-50 to-slate-50 border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all duration-300 group">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-400 to-slate-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <Frown className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                      {badPercentage}%
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-gray-700">
                        Bad Mood
                      </div>
                      <Badge className="bg-gradient-to-r from-gray-500 to-slate-600 text-white border-0">
                        {badMoods} responses
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Progress Bar */}
              <Card className="p-6 bg-gradient-to-r from-white to-gray-50 border-0 shadow-lg rounded-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-indigo-500" />
                      Mood Distribution
                    </h3>
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {totalMoods} total responses
                    </div>
                  </div>

                  <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500 ease-out"
                      style={{ width: `${goodPercentage}%` }}
                    />
                    <div
                      className="absolute top-0 h-full bg-gradient-to-r from-blue-400 to-indigo-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${fairPercentage}%`,
                        left: `${goodPercentage}%`,
                      }}
                    />
                    <div
                      className="absolute top-0 h-full bg-gradient-to-r from-gray-400 to-slate-500 transition-all duration-500 ease-out"
                      style={{
                        width: `${badPercentage}%`,
                        left: `${goodPercentage + fairPercentage}%`,
                      }}
                    />
                  </div>

                  <div className="flex justify-center items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                      <span className="text-gray-700">
                        Good ({goodPercentage}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                      <span className="text-gray-700">
                        Fair ({fairPercentage}%)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-slate-500" />
                      <span className="text-gray-700">
                        Bad ({badPercentage}%)
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {totalMoods === 0 && (
                <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg rounded-2xl">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <BarChart3 className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        No Data Available
                      </h3>
                      <p className="text-gray-500">
                        No mood data available for the selected filters.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {isLoadingUsers ? (
                <Card className="p-12 text-center bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg rounded-2xl">
                  <div className="space-y-4">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Loading User Data
                      </h3>
                      <p className="text-gray-500">
                        Please wait while we fetch user information...
                      </p>
                    </div>
                  </div>
                </Card>
              ) : filteredMoods.length > 0 ? (
                <Card className="bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg rounded-2xl overflow-hidden">
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-500" />
                      Individual Responses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            User
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Department
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Mood
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                            Date
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredMoods.map((mood, index) => (
                          <tr
                            key={mood._id}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                              index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                                    {getUserInitials(mood.userId)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium text-gray-900">
                                  {getUserDisplayName(mood.userId)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge
                                className={`bg-gradient-to-r ${getDepartmentColor(
                                  mood.department
                                )} text-white border-0 shadow-sm`}
                              >
                                {mood.department}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {mood.mood === "good" ? (
                                  <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 rounded-full border border-green-200">
                                    <Smile className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-700">
                                      Good
                                    </span>
                                  </div>
                                ) : mood.mood === "fair" ? (
                                  <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1.5 rounded-full border border-blue-200">
                                    <Meh className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-700">
                                      Fair
                                    </span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-slate-50 px-3 py-1.5 rounded-full border border-gray-200">
                                    <Frown className="w-4 h-4 text-gray-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Bad
                                    </span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(mood.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              ) : (
                <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg rounded-2xl">
                  <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        No Data Available
                      </h3>
                      <p className="text-gray-500">
                        No mood data available for the selected filters.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
