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
  CheckCircle,
  AlertCircle,
  UserPlus,
  Send,
  Search,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface UserData {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string;
  department?: string;
}

interface Comment {
  userId: string;
  comment: string;
  createdAt: Date;
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
  comments: Comment[];
  approved: boolean;
  createdAt: string | number | Date;
  status?: string;
}

interface AdminFeedbackCardProps {
  feedback: FeedbackItem;
  onUpdate: (id: string, data: any) => Promise<void>;
  users: any[];
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

  useEffect(() => {
    const fetchUserData = async () => {
      const userIds = new Set<string>();
      if (feedback.submittedBy) userIds.add(feedback.submittedBy);
      if (feedback.assignedTo) userIds.add(feedback.assignedTo);
      feedback.comments.forEach((comment) => {
        if (comment.userId) userIds.add(comment.userId);
      });

      // Check if we already have all the user data we need
      const missingUserIds = Array.from(userIds).filter((id) => !userMap[id]);
      if (missingUserIds.length === 0) return;

      setIsLoadingUsers(true);
      try {
        const userDataMap: Record<string, UserData> = { ...userMap };

        for (const userId of missingUserIds) {
          try {
            const response = await fetch(
              `https://askyourmd.nssfug.org/api/users/${userId}`
            );
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

  useEffect(() => {
    const fetchAzureUsers = async () => {
      const trimmedQuery = userSearchQuery.trim();
      if (trimmedQuery.length >= 3) {
        setIsLoadingUsers(true);
        try {
          const response = await fetch(
            `https://askyourmd.nssfug.org/api/users/search?q=${encodeURIComponent(
              trimmedQuery
            )}&limit=20`
          );
          if (response.ok) {
            const data = await response.json();
            setAzureUsers(data.users || []);
          } else {
            console.error(
              "Search failed:",
              response.status,
              response.statusText
            );
            setAzureUsers([]);
          }
        } catch (error) {
          console.error("Error searching Azure AD users:", error);
          setAzureUsers([]);
        } finally {
          setIsLoadingUsers(false);
        }
      } else {
        setAzureUsers([]);
        setIsLoadingUsers(false);
      }
    };

    if (userSearchQuery.trim().length >= 2) {
      const debounceTimer = setTimeout(fetchAzureUsers, 500);
      return () => clearTimeout(debounceTimer);
    } else {
      setAzureUsers([]);
      setIsLoadingUsers(false);
    }
  }, [userSearchQuery]);

  const getUserDisplayName = (userId: string | null): string => {
    if (!userId) return "Anonymous";
    const user = userMap[userId];
    return user ? user.displayName : "Unknown User";
  };

  const getUserInitials = (userId: string | null): string => {
    if (!userId) return "AN";
    const user = userMap[userId];
    if (!user) return "UN";
    return user.displayName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
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

  const getDepartmentColor = (department: string) => {
    const colors = {
      IT: "bg-blue-500",
      HR: "bg-purple-500",
      Finance: "bg-green-500",
      Operations: "bg-orange-500",
      Marketing: "bg-pink-500",
      Sales: "bg-indigo-500",
    };
    return colors[department as keyof typeof colors] || "bg-gray-500";
  };

  const filteredUsers = azureUsers;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-500 via-gray-100 to-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group hover:scale-[1.02]">
      {/* Decorative top border */}
      <div
        className={`h-1 bg-gradient-to-r ${
          feedback.approved
            ? "from-green-400 to-emerald-500"
            : "from-amber-400 to-orange-500"
        }`}
      />

      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-3 h-3 rounded-full ${getDepartmentColor(
                  feedback.department
                )} shadow-lg`}
              />
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {feedback.title}
              </CardTitle>
            </div>

            <div className="flex items-center flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border">
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-400 to-blue-600 text-white">
                    {getUserInitials(feedback.submittedBy)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-gray-700">
                  {isLoadingUsers
                    ? "Loading..."
                    : getUserDisplayName(feedback.submittedBy)}
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-gray-600">
                  {new Date(feedback.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Badge
                variant="secondary"
                className={`${getDepartmentColor(
                  feedback.department
                )} text-white border-0 shadow-sm`}
              >
                {feedback.department}
              </Badge>

              <Badge
                variant={feedback.approved ? "default" : "secondary"}
                className={`${
                  feedback.approved
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-sm"
                    : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-sm"
                } border-0`}
              >
                {feedback.approved ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" /> Approved
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" /> Pending
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            {!feedback.approved && (
              <Button
                size="sm"
                onClick={handleApprove}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Approve
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setIsAssignDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Assign
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4">
        <div
          className={`grid ${
            feedback.possibleSolution
              ? "grid-cols-1 lg:grid-cols-2"
              : "grid-cols-1"
          } gap-6`}
        >
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Concern
            </h4>
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm min-h-[120px]">
              <p className="text-gray-700 leading-relaxed">
                {feedback.concern}
              </p>
            </div>
          </div>

          {feedback.possibleSolution && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Proposed Solution
              </h4>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm min-h-[120px]">
                <p className="text-gray-700 leading-relaxed">
                  {feedback.possibleSolution}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-colors duration-200 rounded-full"
            >
              <ThumbsUp className="h-4 w-4 mr-2" />
              <span className="font-medium">{feedback.likes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors duration-200 rounded-full"
            >
              <ThumbsDown className="h-4 w-4 mr-2" />
              <span className="font-medium">{feedback.dislikes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 rounded-full"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="font-medium">{feedback.comments.length}</span>
            </Button>
          </div>

          {feedback.assignedTo && (
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <span className="text-sm text-gray-500">Assigned to:</span>
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-purple-600 text-white">
                  {getUserInitials(feedback.assignedTo)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {isLoadingUsers
                  ? "Loading..."
                  : getUserDisplayName(feedback.assignedTo)}
              </span>
            </div>
          )}
        </div>

        {showComments && (
          <div className="w-full space-y-4 pt-4 border-t border-gray-100">
            {isLoadingUsers ? (
              <div className="text-center py-8">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                <p className="mt-3 text-sm text-gray-500">
                  Loading comments...
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {feedback.comments.map((comment, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-indigo-400 to-indigo-600 text-white">
                            {getUserInitials(comment.userId)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-gray-900">
                          {getUserDisplayName(comment.userId)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {comment.comment}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a thoughtful comment..."
                className="flex-1 min-h-[80px] border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl resize-none"
              />
              <Button
                onClick={handleComment}
                disabled={!session?.isLoggedIn || !newComment.trim()}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white self-end shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-xl"
              >
                <Send className="w-4 h-4 mr-1" />
                Post
              </Button>
            </div>
          </div>
        )}
      </CardFooter>

      {/* Assign User Dialog */}
      <Dialog
        open={isAssignDialogOpen}
        onOpenChange={(open) => {
          setIsAssignDialogOpen(open);
          if (!open) {
            setUserSearchQuery("");
            setAzureUsers([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-gradient-to-br from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Assign Feedback
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users by name (min 3 characters)..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                autoFocus
              />
              {userSearchQuery && (
                <button
                  onClick={() => {
                    setUserSearchQuery("");
                    setAzureUsers([]);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="max-h-[300px] overflow-y-auto border rounded-xl bg-white shadow-sm">
              {userSearchQuery.trim().length < 3 ? (
                <div className="p-8 text-center text-gray-500">
                  <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Search for users</p>
                  <p className="text-sm">
                    Type at least 3 characters to find users...
                  </p>
                </div>
              ) : isLoadingUsers ? (
                <div className="p-8 text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="mt-3 text-gray-500 font-medium">
                    Searching users...
                  </p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">No users found</p>
                  <p className="text-sm">Try a different search term</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      onClick={() => handleAssign(user.id)}
                      className="flex items-center px-4 py-4 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 active:bg-blue-100"
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-400 to-indigo-600 text-white font-semibold">
                            {user.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                              {user.displayName}
                            </p>
                            <Badge variant="secondary" className="ml-2">
                              {user.department || "Staff"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 truncate">
                            {user.mail || user.userPrincipalName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              className="rounded-xl"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
