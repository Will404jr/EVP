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
import { User, Menu, X, Search, BarChart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminFeedbackCard } from "@/components/AdminFeedbackCard";
import { users } from "@/lib/user";
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

interface FeedbackItem {
  _id: string;
  title: string;
  department: string;
  concern: string;
  possibleSolution: string;
  submittedBy: string | null;
  assignedTo: string | null;
  status: "Open" | "Resolved" | "Pending" | "Overdue";
  likes: string[];
  dislikes: string[];
  comments: { username: string; comment: string; createdAt: Date }[];
  approved: boolean;
  createdAt: string;
  validity: {
    startDate: Date;
    endDate: Date;
  };
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [session, setSession] = useState<SessionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const router = useRouter();

  const checkFeedbackValidity = useCallback((feedbackItem: FeedbackItem) => {
    const currentDate = new Date();
    const endDate = new Date(feedbackItem.validity.endDate);

    if (currentDate > endDate && feedbackItem.status !== "Resolved") {
      return { ...feedbackItem, status: "Overdue" };
    }
    return feedbackItem;
  }, []);

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
    const res = await fetch("/api/feedback");
    const data = await res.json();
    const updatedFeedback = data.map((item: FeedbackItem) => {
      const checkedItem = checkFeedbackValidity(item);
      if (checkedItem.status !== item.status) {
        updateFeedbackStatus(checkedItem._id, checkedItem.status);
      }
      return checkedItem;
    });
    setFeedback(updatedFeedback);
  }, [checkFeedbackValidity, updateFeedbackStatus]);

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data);
    };

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
    const matchesFilter = filter === "All" || item.status === filter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.concern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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

  if (session?.personnelType !== "Admin") {
    return <div>Access Denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-sm px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and title - always visible */}
          <div className="flex items-center">
            <div className="text-xl sm:text-2xl font-bold text-white">
              EVP Admin
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

          {/* Desktop filter buttons */}
          <div className="hidden md:flex items-center justify-center space-x-2">
            {["All", "Open", "Pending", "Resolved", "Overdue"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "ghost"}
                className={`${
                  filter === status
                    ? "bg-[#6CBE45] hover:bg-green-700 text-white rounded-full"
                    : "text-gray-300 hover:text-white hover:bg-gray-800 rounded-full"
                } transition-all duration-200`}
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {/* Desktop user dropdown */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              onClick={() => setIsAnalysisDrawerOpen(true)}
              className="bg-[#6CBE45] hover:bg-green-700 text-white flex items-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Analysis</span>
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
            <div className="grid grid-cols-2 gap-2">
              {["All", "Open", "Pending", "Resolved", "Overdue"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={filter === status ? "default" : "ghost"}
                    className={`${
                      filter === status
                        ? "bg-[#6CBE45] hover:bg-green-700 text-white"
                        : "text-gray-300 hover:text-white hover:bg-gray-800"
                    } w-full transition-all duration-200`}
                    onClick={() => {
                      setFilter(status);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {status}
                  </Button>
                )
              )}
            </div>

            <Button
              onClick={() => {
                setIsAnalysisDrawerOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#6CBE45] hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Analysis</span>
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
              onClick={() => setIsAnalysisDrawerOpen(true)}
              className="bg-[#6CBE45] hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            >
              <BarChart className="h-4 w-4" />
              <span>Analysis</span>
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <AdminFeedbackCard
                key={item._id}
                feedback={item}
                onUpdate={handleFeedbackUpdate}
                users={users}
              />
            ))
          ) : (
            <div className="text-center py-10 text-gray-400">
              No feedback matches your current filters
            </div>
          )}
        </div>
      </main>

      <AnalysisDrawer
        isOpen={isAnalysisDrawerOpen}
        onClose={() => setIsAnalysisDrawerOpen(false)}
        feedback={feedback}
      />
    </div>
  );
}
