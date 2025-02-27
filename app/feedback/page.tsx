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
import { Menu, X, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SubmitFeedbackDialog from "@/components/submit-feedback-dialogue";
import { FeedbackCard } from "@/components/FeedbackCard";
import MoodTracker from "@/components/mood";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SessionData {
  id?: string;
  isLoggedIn: boolean;
  username?: string;
  email?: string;
  personnelType?: string;
  department?: string;
}

interface FeedbackItem {
  _id: string;
  title: string;
  department: string;
  concern: string;
  possibleSolution: string;
  submittedBy: string | null;
  assignedTo: string | null;
  likes: string[];
  dislikes: string[];
  comments: { username: string; comment: string; createdAt: Date }[];
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [moodChecked, setMoodChecked] = useState(false);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data);
      return data;
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
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
    try {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      // Filter out unapproved feedback items
      const approvedFeedback = data.filter(
        (item: FeedbackItem) => item.approved
      );
      setFeedback(approvedFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
    }
  }, []);

  const checkMoodData = useCallback(async (username: string) => {
    try {
      const res = await fetch(`/api/mood?username=${username}`);
      const data = await res.json();
      if (!data.mood) {
        setShowMoodDialog(true);
      }
      setMoodChecked(true);
    } catch (error) {
      console.error("Error checking mood data:", error);
    }
  }, []);

  useEffect(() => {
    // Initial data loading
    const initializeData = async () => {
      const sessionData = await fetchSession();
      await fetchFeedback();

      // Only check mood if user is logged in
      if (sessionData?.isLoggedIn && sessionData.username) {
        await checkMoodData(sessionData.username);
      }
    };

    initializeData();

    // Only poll for feedback (less frequently - every 30 seconds)
    const feedbackInterval = setInterval(fetchFeedback, 30000);

    return () => {
      clearInterval(feedbackInterval);
    };
  }, [fetchSession, fetchFeedback, checkMoodData]);

  useEffect(() => {
    // Close mobile menu when window is resized to desktop size
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
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

  const handleMoodSubmit = async (mood: string) => {
    if (session?.username) {
      const res = await fetch("/api/mood", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mood,
          username: session.username,
          department: session.department,
        }),
      });
      if (res.ok) {
        setShowMoodDialog(false);
      }
    }
  };

  // Sort feedback by date (newest first)
  const sortedFeedback = [...feedback].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
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

  return (
    <div className="min-h-screen bg-transparent">
      <nav className="sticky top-0 z-50 bg-transparent backdrop-blur-sm px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo and title - always visible */}
          <div className="flex items-center">
            <div className="text-xl sm:text-2xl font-bold text-white">
              Your Voice
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-2">
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

          {/* Desktop user dropdown and submit feedback */}
          <div className="hidden md:flex items-center space-x-4">
            <SubmitFeedbackDialog />

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
                {session?.isLoggedIn ? (
                  <>
                    <div className="px-2 py-2 bg-blue-50 rounded-md mb-2">
                      <p className="font-medium text-blue-950 text-lg">
                        {session.username}
                      </p>
                      <p className="text-blue-700 text-sm">{session.email}</p>
                      <p className="text-blue-500 text-xs mt-1">
                        {session.personnelType || "User"}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer hover:bg-blue-50 rounded-md p-2 mt-1">
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer hover:bg-blue-50 rounded-md p-2"
                      onClick={() => setShowMoodDialog(true)}
                    >
                      Update Mood
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md p-2 mt-1 font-medium"
                    >
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem
                    asChild
                    className="rounded-md p-2 hover:bg-blue-50"
                  >
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 bg-gray-900 rounded-lg p-4 space-y-4 animate-fadeIn">
            <Button
              onClick={() => {
                document
                  .querySelector<HTMLButtonElement>(
                    '[data-submit-feedback-trigger="true"]'
                  )
                  ?.click();
                setIsMobileMenuOpen(false);
              }}
              className="bg-[#6CBE45] hover:bg-green-700 text-white w-full flex items-center justify-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Submit Feedback</span>
            </Button>

            {session?.isLoggedIn ? (
              <div className="bg-blue-900 rounded-lg p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarFallback className="bg-blue-950 text-white">
                      {session?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-white">
                      {session?.username}
                    </p>
                    <p className="text-blue-200 text-sm">{session?.email}</p>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="text-white border-white hover:bg-blue-800"
                    onClick={() => {
                      setShowMoodDialog(true);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Update Mood
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-300 border-red-300 hover:bg-red-900 hover:text-white"
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </div>
            ) : (
              <Button asChild className="w-full">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4">
        {sortedFeedback.length > 0 ? (
          <div className="space-y-6">
            {sortedFeedback.map((item) => (
              <FeedbackCard
                key={item._id}
                feedback={item}
                onUpdate={handleFeedbackUpdate}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md">
              <h3 className="text-xl font-medium text-white mb-2">
                No feedback available
              </h3>
              <p className="text-gray-300 mb-4">
                There are no feedback items to display at this time.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Mobile submit feedback button (fixed at bottom) */}
      <div className="md:hidden fixed bottom-6 right-6">
        <Button
          onClick={() =>
            document
              .querySelector<HTMLButtonElement>(
                '[data-submit-feedback-trigger="true"]'
              )
              ?.click()
          }
          className="bg-[#6CBE45] hover:bg-green-700 text-white rounded-full h-14 w-14 shadow-lg flex items-center justify-center"
        >
          <PlusCircle className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={showMoodDialog} onOpenChange={setShowMoodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How are you feeling today?</DialogTitle>
          </DialogHeader>
          <MoodTracker onMoodSelect={handleMoodSubmit} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
