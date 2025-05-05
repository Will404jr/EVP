"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Menu, X, Search, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { AdminFeedbackCard } from "@/components/AdminFeedbackCard";
import { Input } from "@/components/ui/input";
import { AnalysisDrawer } from "@/components/AnalysisDrawer";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SessionData {
  id?: string;
  isLoggedIn: boolean;
  username?: string;
  email?: string;
  personnelType?: string;
}

interface Comment {
  userId: string; // Changed from username
  comment: string;
  createdAt: Date;
}

interface FeedbackItem {
  _id: string;
  title: string;
  department: string;
  concern: string;
  possibleSolution: string;
  submittedBy: string | null; // Now stores user ID
  assignedTo: string | null; // Now stores user ID
  status: "Open" | "Resolved" | "Pending" | "Overdue";
  likes: string[]; // Array of user IDs
  dislikes: string[]; // Array of user IDs
  comments: Comment[];
  approved: boolean;
  createdAt: string;
  validity: {
    startDate: Date;
    endDate: Date;
  };
}

interface MoodItem {
  _id: string;
  mood: "good" | "fair" | "bad";
  userId: string; // Changed from username
  department: string;
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [moodData, setMoodData] = useState<MoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const router = useRouter();

  const updateFeedbackStatus = useCallback(
    async (id: string, status: string) => {
      try {
        const res = await fetch(`/api/feedback/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        });
        if (!res.ok) throw new Error("Failed to update feedback status");
      } catch (error) {
        console.error("Error updating feedback status:", error);
      }
    },
    []
  );

  const fetchFeedback = useCallback(async () => {
    try {
      setIsPolling(true);
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedback(data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setIsPolling(false);
      setIsLoading(false);
    }
  }, []);

  // Function to fetch mood data
  const fetchMoodData = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/getMood");
      const data = await response.json();
      setMoodData(data);
    } catch (error) {
      console.error("Failed to fetch mood data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        setSession(data);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };

    setIsLoading(true);
    fetchSession();
    fetchFeedback();

    // Set up polling for fetchFeedback every 5 seconds
    const feedbackInterval = setInterval(fetchFeedback, 5000);

    // Clean up interval on component unmount
    return () => clearInterval(feedbackInterval);
  }, [fetchFeedback]);

  useEffect(() => {
    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
        setIsSearchExpanded(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    const response = await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ isLoggedIn: false }),
    });
    if (response.ok) {
      setSession(null);
      router.push("/");
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.concern.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleFeedbackUpdate = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/feedback/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update feedback");
      const updatedFeedback = await res.json();
      setFeedback(
        feedback.map((item) => (item._id === id ? updatedFeedback : item))
      );
    } catch (error) {
      console.error("Error updating feedback:", error);
    }
  };

  // Function to handle opening the analysis drawer
  const handleOpenAnalysis = () => {
    fetchMoodData(); // Fetch mood data when opening drawer
    setIsAnalysisDrawerOpen(true);
  };

  if (session?.personnelType !== "Md") {
    return <div>Access Denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-sm px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and title - always visible */}
          <div className="flex items-center">
            <div className="text-xl sm:text-2xl font-bold text-white">
              Your Voice Admin
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 rounded-full"
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-gray-800 rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Desktop user dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={handleOpenAnalysis}
              className="bg-[#6CBE45] hover:bg-green-700 text-white flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Mood Analysis</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-blue-950 hover:bg-blue-900 rounded-full flex items-center justify-center h-10 w-10"
                >
                  <Avatar className="h-9 w-9 border-2 border-white">
                    <AvatarFallback className="bg-blue-950 text-white">
                      {session?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 p-2 bg-white rounded-lg shadow-lg"
              >
                <div className="px-2 py-2 bg-blue-50 rounded-md mb-2">
                  <p className="font-medium text-blue-950 text-lg">
                    {session?.username}
                  </p>
                  <p className="text-blue-700 text-sm">{session?.email}</p>
                  <p className="text-blue-500 text-xs mt-1">Admin</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 rounded-md p-2 mt-1">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 rounded-md p-2">
                  Manage Users
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md p-2 mt-1 font-medium"
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile expanded search bar */}
        {isSearchExpanded && (
          <div className="md:hidden mt-4 px-1">
            <Input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-black pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        )}

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-900 rounded-lg p-4 space-y-4 animate-fadeIn">
            <Button
              onClick={() => {
                handleOpenAnalysis();
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#6CBE45] hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Mood Analysis</span>
            </Button>

            <div className="bg-blue-900 rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border-2 border-white">
                  <AvatarFallback className="bg-blue-950 text-white">
                    {session?.username?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">{session?.username}</p>
                  <p className="text-blue-200 text-sm">{session?.email}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="text-white border-white hover:bg-blue-800"
                >
                  Profile
                </Button>
                <Button
                  variant="outline"
                  className="text-red-300 border-red-300 hover:bg-red-900 hover:text-white"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-auto">
            {/* Desktop search bar */}
            <div className="hidden md:block">
              <Input
                type="text"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-96 bg-white text-black pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Desktop Analysis button is in the navbar */}
          <div className="md:hidden w-full">
            <Button
              onClick={handleOpenAnalysis}
              className="bg-[#6CBE45] hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Mood Analysis</span>
            </Button>
          </div>
        </div>

        {isLoading && !isPolling ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredFeedback.length > 0 ? (
              filteredFeedback.map((item) => (
                <AdminFeedbackCard
                  key={item._id}
                  feedback={item}
                  onUpdate={handleFeedbackUpdate}
                  users={[]} // This prop is no longer needed as we fetch users from Azure AD
                />
              ))
            ) : (
              <div className="text-center py-10 text-gray-400">
                No feedback matches your search
              </div>
            )}
          </div>
        )}
      </main>

      {/* Updated AnalysisDrawer for mood data */}
      <AnalysisDrawer
        isOpen={isAnalysisDrawerOpen}
        onClose={() => setIsAnalysisDrawerOpen(false)}
        moods={moodData}
      />
    </div>
  );
}
