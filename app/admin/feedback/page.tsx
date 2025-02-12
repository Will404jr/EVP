"use client";

import { useEffect, useState } from "react";
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
import { AdminFeedbackCard } from "@/components/AdminFeedbackCard";
import { users } from "@/lib/user";
import { Input } from "@/components/ui/input";
import { AnalysisDrawer } from "@/components/AnalysisDrawer";

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
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [filter, setFilter] = useState("All");
  const [session, setSession] = useState<SessionData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAnalysisDrawerOpen, setIsAnalysisDrawerOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSession = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      setSession(data);
    };

    const fetchFeedback = async () => {
      const res = await fetch("/api/feedback");
      const data = await res.json();
      setFeedback(data);
    };

    fetchSession();
    fetchFeedback();
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
      <nav className="sticky top-0 z-50  bg-transparent px-6 py-4 ">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-2xl font-bold text-white">EVP Admin</div>
          </div>

          <div className="flex items-center justify-center space-x-2">
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

          <div className="flex items-center space-x-4">
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
        <div className="flex justify-between items-center mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search feedback..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-96 bg-white text-black pl-4 pr-10 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setIsAnalysisDrawerOpen(true)}
            className="bg-[#6CBE45] hover:bg-green-700 text-white"
          >
            Analysis
          </Button>
        </div>

        <div className="space-y-6">
          {filteredFeedback.map((item) => (
            <AdminFeedbackCard
              key={item._id}
              feedback={item}
              onUpdate={handleFeedbackUpdate}
              users={users}
            />
          ))}
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
