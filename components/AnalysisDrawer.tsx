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
import { X } from "lucide-react";

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
            const response = await fetch(`/api/users/${userId}`);
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

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="flex justify-between items-center">
          <DrawerTitle className="text-xl font-bold">Mood Analysis</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <Select
                value={selectedDepartment}
                onValueChange={setSelectedDepartment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeframe
              </label>
              <Select
                value={selectedTimeframe}
                onValueChange={setSelectedTimeframe}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-yellow-50 border-yellow-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">😊</div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {goodPercentage}%
                    </div>
                    <div className="text-sm text-yellow-700">
                      Good ({goodMoods})
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">😐</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {fairPercentage}%
                    </div>
                    <div className="text-sm text-blue-700">
                      Fair ({fairMoods})
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-gray-50 border-gray-200">
                  <div className="text-center">
                    <div className="text-4xl mb-2">😔</div>
                    <div className="text-2xl font-bold text-gray-600">
                      {badPercentage}%
                    </div>
                    <div className="text-sm text-gray-700">
                      Bad ({badMoods})
                    </div>
                  </div>
                </Card>
              </div>

              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden mb-4">
                <div
                  className="absolute top-0 left-0 h-full bg-yellow-400"
                  style={{ width: `${goodPercentage}%` }}
                ></div>
                <div
                  className="absolute top-0 left-0 h-full bg-blue-400"
                  style={{
                    width: `${goodPercentage + fairPercentage}%`,
                    left: `${goodPercentage}%`,
                  }}
                ></div>
                <div
                  className="absolute top-0 left-0 h-full bg-gray-400"
                  style={{
                    width: `${badPercentage}%`,
                    left: `${goodPercentage + fairPercentage}%`,
                  }}
                ></div>
              </div>

              <div className="text-center text-sm text-gray-500 mb-6">
                Based on {totalMoods} responses{" "}
                {selectedDepartment !== "all"
                  ? `from ${selectedDepartment}`
                  : ""}
              </div>

              {totalMoods === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No mood data available for the selected filters.
                </div>
              )}
            </TabsContent>
            <TabsContent value="details" className="pt-4">
              {isLoadingUsers ? (
                <div className="text-center py-8">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                  <p className="mt-4 text-gray-500">Loading user data...</p>
                </div>
              ) : filteredMoods.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          User
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Department
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Mood
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredMoods.map((mood) => (
                        <tr key={mood._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {getUserDisplayName(mood.userId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mood.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                mood.mood === "good"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : mood.mood === "fair"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {mood.mood === "good"
                                ? "😊 Good"
                                : mood.mood === "fair"
                                ? "😐 Fair"
                                : "😔 Bad"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(mood.createdAt).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No mood data available for the selected filters.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
