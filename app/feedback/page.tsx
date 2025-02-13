"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
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
  validity: {
    startDate: Date;
    endDate: Date;
  };
}

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [session, setSession] = useState<SessionData | null>(null);
  const [showMoodDialog, setShowMoodDialog] = useState(false);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    const res = await fetch("/api/session");
    const data = await res.json();
    setSession(data);
  }, []);

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
    // Filter out unapproved feedback items and check validity
    const approvedFeedback = data
      .filter((item: FeedbackItem) => item.approved)
      .map((item: FeedbackItem) => {
        const checkedItem = checkFeedbackValidity(item);
        if (checkedItem.status !== item.status) {
          updateFeedbackStatus(checkedItem._id, checkedItem.status);
        }
        return checkedItem;
      });
    setFeedback(approvedFeedback);
  }, [checkFeedbackValidity, updateFeedbackStatus]);

  const checkMoodData = useCallback(async () => {
    if (session?.isLoggedIn && session.username) {
      const res = await fetch(`/api/mood?username=${session.username}`);
      const data = await res.json();
      if (!data.mood) {
        setShowMoodDialog(true);
      }
    }
  }, [session]);

  useEffect(() => {
    fetchSession();

    // Set up polling for fetchFeedback (every 10 seconds)
    const feedbackInterval = setInterval(fetchFeedback, 10000);

    // Set up polling for checkMoodData (every 30 seconds)
    const moodInterval = setInterval(checkMoodData, 30000);

    // Initial fetch
    fetchFeedback();
    checkMoodData();

    // Clean up intervals on component unmount
    return () => {
      clearInterval(feedbackInterval);
      clearInterval(moodInterval);
    };
  }, [fetchSession, fetchFeedback, checkMoodData]);

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
        body: JSON.stringify({ mood, username: session.username }),
      });
      if (res.ok) {
        setShowMoodDialog(false);
      }
    }
  };

  const filteredFeedback = feedback.filter((item) => {
    if (filter === "All") return true;
    return item.status === filter;
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
      <nav className="sticky top-0 z-50  bg-transparent px-6 py-4 ">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">EVP</div>
          </div>

          <div className="flex items-center justify-center space-x-2">
            {["All", "Open", "Pending", "Resolved", "Overdue"].map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "ghost"}
                className={`${
                  filter === status
                    ? "bg-[#6CBE45] hover:bg-green-700 text-white rounded-full"
                    : "text-white hover:text-white hover:bg-gray-800 rounded-full"
                } transition-all duration-200`}
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <SubmitFeedbackDialog />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white bg-blue-950 rounded-full"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session?.isLoggedIn ? (
                  <>
                    <DropdownMenuItem className="font-medium">
                      {session.username}
                    </DropdownMenuItem>
                    <DropdownMenuItem>{session.email}</DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      Logout
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link href="/login">Login</Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto py-8 px-4">
        <div className="space-y-6">
          {filteredFeedback.map((item) => (
            <FeedbackCard
              key={item._id}
              feedback={item}
              onUpdate={handleFeedbackUpdate}
            />
          ))}
        </div>
      </main>

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
