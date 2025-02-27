"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User } from "@/lib/user";

interface FeedbackItem {
  createdAt: string | number | Date;
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
}

interface AdminFeedbackCardProps {
  feedback: FeedbackItem;
  onUpdate: (id: string, data: any) => Promise<void>;
  users: User[];
}

export function AdminFeedbackCard({
  feedback,
  onUpdate,
  users,
}: AdminFeedbackCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleApprove = async () => {
    await onUpdate(feedback._id, { action: "approve" });
  };

  const handleAssign = async (username: string) => {
    await onUpdate(feedback._id, { action: "assign", assignedTo: username });
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    await onUpdate(feedback._id, {
      action: "comment",
      comment: newComment.trim(),
    });
    setNewComment("");
  };

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
                {feedback.submittedBy || "Anonymous"}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {new Date(feedback.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4">
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Comment</h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[100px]">
              {feedback.concern}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Proposed Solution
            </h4>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg min-h-[100px]">
              {feedback.possibleSolution}
            </p>
          </div>
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

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleApprove}
              disabled={feedback.approved}
              className={`${
                feedback.approved
                  ? "bg-gray-100 text-gray-500"
                  : "bg-[#6CBE45] hover:bg-green-700 text-white"
              }`}
            >
              {feedback.approved ? "Approved" : "Approve"}
            </Button>

            <Select onValueChange={handleAssign}>
              <SelectTrigger className="w-[200px] border-gray-200">
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((user) => user.personnelType === "User")
                  .map((user) => (
                    <SelectItem key={user.id} value={user.username}>
                      {user.username}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {showComments && (
          <div className="w-full space-y-4 pt-4">
            {feedback.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">
                    {comment.username}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-gray-700">{comment.comment}</div>
              </div>
            ))}
            <div className="flex space-x-3 pt-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 min-h-[80px] border-gray-200"
              />
              <Button
                onClick={handleComment}
                className="bg-[#6CBE45] hover:bg-green-700 text-white self-end"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
