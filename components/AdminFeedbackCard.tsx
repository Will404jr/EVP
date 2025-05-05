"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  ThumbsDown,
  ThumbsUp,
  Clock,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UserData {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string;
  department?: string;
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
  likes: string[]; // Array of user IDs
  dislikes: string[]; // Array of user IDs
  comments: Comment[];
  approved: boolean;
  createdAt: string | number | Date;
  status?: string;
}

interface AdminFeedbackCardProps {
  feedback: FeedbackItem;
  onUpdate: (id: string, data: any) => Promise<void>;
  users: any[]; // This will be replaced with Azure AD users
}

export function AdminFeedbackCard({
  feedback,
  onUpdate,
}: AdminFeedbackCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [session, setSession] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userMap, setUserMap] = useState<Record<string, UserData>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [azureUsers, setAzureUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/session");
        const sessionData = await response.json();
        setSession(sessionData);
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchSession();
  }, []);

  // Fetch user data for all users involved in the feedback
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUsers(true);
      try {
        // Collect all unique user IDs
        const userIds = new Set<string>();

        if (feedback.submittedBy) userIds.add(feedback.submittedBy);
        if (feedback.assignedTo) userIds.add(feedback.assignedTo);

        feedback.comments.forEach((comment) => {
          if (comment.userId) userIds.add(comment.userId);
        });

        // Create a map of user data
        const userDataMap: Record<string, UserData> = {};

        // Fetch user data for each ID
        for (const userId of userIds) {
          try {
            const response = await fetch(`/api/users/${userId}`);
            if (response.ok) {
              const data = await response.json();
              if (data.user) {
                userDataMap[userId] = data.user;
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

    if (feedback) {
      fetchUserData();
    }
  }, [feedback]);

  // Fetch Azure AD users when assign dialog opens
  useEffect(() => {
    const fetchAzureUsers = async () => {
      if (isAssignDialogOpen) {
        setIsLoadingUsers(true);
        try {
          const response = await fetch("/api/users");
          if (response.ok) {
            const data = await response.json();
            setAzureUsers(data.users || []);
          }
        } catch (error) {
          console.error("Error fetching Azure AD users:", error);
        } finally {
          setIsLoadingUsers(false);
        }
      }
    };

    fetchAzureUsers();
  }, [isAssignDialogOpen]);

  const getUserDisplayName = (userId: string | null): string => {
    if (!userId) return "Anonymous";
    const user = userMap[userId];
    return user ? user.displayName : "Unknown User";
  };

  const handleApprove = async () => {
    if (!session?.isLoggedIn || session.personnelType !== "Md") return;
    await onUpdate(feedback._id, { action: "approve" });
  };

  const handleAssign = async (userId: string) => {
    if (!session?.isLoggedIn || session.personnelType !== "Md") return;
    await onUpdate(feedback._id, { action: "assign", assignedTo: userId });
    setIsAssignDialogOpen(false);
  };

  const handleComment = async () => {
    if (!session?.isLoggedIn || !session.id || !newComment.trim()) return;
    await onUpdate(feedback._id, {
      action: "comment",
      comment: newComment.trim(),
    });
    setNewComment("");
  };

  // Filter users based on search query
  const filteredUsers = azureUsers.filter((user) =>
    user.displayName.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <Card className="w-full bg-white shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="border-b border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              {feedback.title}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {isLoadingUsers
                  ? "Loading..."
                  : getUserDisplayName(feedback.submittedBy)}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
              <div className="font-medium text-gray-700">
                {feedback.department}
              </div>
              <div
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  feedback.approved
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {feedback.approved ? "Approved" : "Pending Approval"}
              </div>
              {feedback.status && (
                <div
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    feedback.status === "Resolved"
                      ? "bg-green-100 text-green-800"
                      : feedback.status === "Pending"
                      ? "bg-blue-100 text-blue-800"
                      : feedback.status === "Overdue"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {feedback.status}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            {!feedback.approved && (
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsAssignDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Assign
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4">
        <div
          className={`grid ${
            feedback.possibleSolution ? "grid-cols-2" : "grid-cols-1"
          } gap-8`}
        >
          <div className={feedback.possibleSolution ? "" : "col-span-2"}>
            <h4 className="font-semibold text-gray-900 mb-2">Comment</h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[100px]">
              {feedback.concern}
            </p>
          </div>
          {feedback.possibleSolution && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">
                Proposed Solution
              </h4>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[100px]">
                {feedback.possibleSolution}
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-6">
            <Button variant="ghost" size="sm" className="text-gray-700">
              <ThumbsUp className="h-4 w-4 mr-2" />
              <span>{feedback.likes.length}</span>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-700">
              <ThumbsDown className="h-4 w-4 mr-2" />
              <span>{feedback.dislikes.length}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-700"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span>{feedback.comments.length}</span>
            </Button>
          </div>

          {feedback.assignedTo && (
            <div className="text-sm text-gray-600">
              Assigned to:{" "}
              {isLoadingUsers
                ? "Loading..."
                : getUserDisplayName(feedback.assignedTo)}
            </div>
          )}
        </div>

        {showComments && (
          <div className="w-full space-y-4 pt-4">
            {isLoadingUsers ? (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                <p className="mt-2 text-sm text-gray-500">
                  Loading comments...
                </p>
              </div>
            ) : (
              feedback.comments.map((comment, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      {getUserDisplayName(comment.userId)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-gray-700">{comment.comment}</div>
                </div>
              ))
            )}
            <div className="flex space-x-3 pt-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[80px] border-gray-200"
              />
              <Button
                onClick={handleComment}
                disabled={!session?.isLoggedIn || !newComment.trim()}
                className="bg-[#6CBE45] hover:bg-green-700 text-white self-end"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Assign User Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Feedback</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full"
            />

            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {isLoadingUsers ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <p className="mt-2 text-gray-500">Loading users...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div
                  key="no-users-found"
                  className="p-4 text-center text-gray-500"
                >
                  No users found
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleAssign(user.id)}
                    className="flex items-center px-4 py-3 cursor-pointer transition-colors hover:bg-gray-100 active:bg-gray-200 border-b last:border-b-0"
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.displayName.slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate hover:text-blue-600">
                            {user.displayName}
                          </p>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {user.department || "Staff"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {user.mail || user.userPrincipalName}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
