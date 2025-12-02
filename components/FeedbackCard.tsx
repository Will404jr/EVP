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
  CheckCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface SessionData {
  id?: string;
  isLoggedIn: boolean;
  username?: string;
  email?: string;
  personnelType?: string;
}

interface UserData {
  id: string;
  displayName: string;
  mail?: string;
  userPrincipalName?: string;
}

interface Comment {
  userId: string;
  comment: string;
  createdAt: Date;
}

interface FeedbackItem {
  createdAt: Date;
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
}

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onUpdate: (id: string, data: any) => Promise<void>;
}

export function FeedbackCard({ feedback, onUpdate }: FeedbackCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [session, setSession] = useState<SessionData | null>(null);
  const [userMap, setUserMap] = useState<Record<string, UserData>>({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

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
      setIsLoadingUsers(true);
      try {
        const userIds = new Set<string>();
        if (feedback.submittedBy) userIds.add(feedback.submittedBy);
        if (feedback.assignedTo) userIds.add(feedback.assignedTo);
        feedback.comments.forEach((comment) => {
          if (comment.userId) userIds.add(comment.userId);
        });

        const userDataMap: Record<string, UserData> = {};
        for (const userId of userIds) {
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

  const handleLike = async () => {
    if (!session?.isLoggedIn || !session.id) return;
    await onUpdate(feedback._id, { action: "like" });
  };

  const handleDislike = async () => {
    if (!session?.isLoggedIn || !session.id) return;
    await onUpdate(feedback._id, { action: "dislike" });
  };

  const handleComment = async () => {
    if (!session?.isLoggedIn || !session.id || !newComment.trim()) return;
    await onUpdate(feedback._id, {
      action: "comment",
      comment: newComment.trim(),
    });
    setNewComment("");
  };

  const handleResolve = async () => {
    if (!session?.isLoggedIn || !session.id) return;
    await onUpdate(feedback._id, { action: "resolve" });
  };

  const getDepartmentColor = (department: string) => {
    const colors = {
      IT: "from-blue-400 to-blue-600",
      HR: "from-purple-400 to-purple-600",
      Finance: "from-green-400 to-green-600",
      Operations: "from-orange-400 to-orange-600",
      Marketing: "from-pink-400 to-pink-600",
      Sales: "from-indigo-400 to-indigo-600",
    };
    return (
      colors[department as keyof typeof colors] || "from-gray-400 to-gray-600"
    );
  };

  const isLiked = feedback.likes.includes(session?.id || "");
  const isDisliked = feedback.dislikes.includes(session?.id || "");
  const showResolveButton =
    feedback.assignedTo === session?.id && !feedback.approved;

  return (
    <Card className="w-full bg-gradient-to-br from-blue-500 via-gray-100 to-blue-500 shadow-xl hover:shadow-2xl transition-all duration-300 border-0 overflow-hidden group hover:scale-[1.02]">
      {/* Animated top border */}
      <div
        className={`h-1 bg-gradient-to-r ${getDepartmentColor(
          feedback.department
        )} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
      </div>

      <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-3 h-3 rounded-full bg-gradient-to-r ${getDepartmentColor(
                feedback.department
              )} shadow-lg animate-pulse`}
            />
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {feedback.title}
            </CardTitle>
            {feedback.approved && (
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            )}
          </div>

          <div className="flex items-center flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-sm border">
              <Avatar className="w-6 h-6">
                <AvatarFallback
                  className={`text-xs bg-blue-500 ${getDepartmentColor(
                    feedback.department
                  )} text-white`}
                >
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
                {new Date(
                  feedback.createdAt || new Date()
                ).toLocaleDateString()}
              </span>
            </div>

            <Badge
              className={`bg-gradient-to-r ${getDepartmentColor(
                feedback.department
              )} text-white border-0 shadow-sm`}
            >
              {feedback.department}
            </Badge>
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
            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border border-gray-100 shadow-sm min-h-[120px] hover:shadow-md transition-shadow duration-200">
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
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border border-green-100 shadow-sm min-h-[120px] hover:shadow-md transition-shadow duration-200">
                <p className="text-gray-700 leading-relaxed">
                  {feedback.possibleSolution}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-white">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={!session?.isLoggedIn}
              className={`transition-all duration-200 rounded-full ${
                isLiked
                  ? "text-green-600 bg-green-50 hover:bg-green-100 shadow-sm"
                  : "text-gray-600 hover:text-green-600 hover:bg-green-50"
              }`}
            >
              <ThumbsUp
                className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`}
              />
              <span className="font-medium">{feedback.likes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleDislike}
              disabled={!session?.isLoggedIn}
              className={`transition-all duration-200 rounded-full ${
                isDisliked
                  ? "text-red-500 bg-red-50 hover:bg-red-100 shadow-sm"
                  : "text-gray-600 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <ThumbsDown
                className={`h-4 w-4 mr-2 ${isDisliked ? "fill-current" : ""}`}
              />
              <span className="font-medium">{feedback.dislikes.length}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className={`transition-all duration-200 rounded-full ${
                showComments
                  ? "text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="font-medium">{feedback.comments.length}</span>
            </Button>
          </div>

          <div className="flex items-center gap-3">
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

            {showResolveButton && (
              <Button
                onClick={handleResolve}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-full"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Resolve
              </Button>
            )}
          </div>
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
                placeholder="Share your thoughts..."
                className="flex-1 min-h-[80px] border-gray-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl resize-none bg-white"
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
    </Card>
  );
}
