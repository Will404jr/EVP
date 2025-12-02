"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Building2,
  Lightbulb,
  Send,
  UserX,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default function SubmitFeedbackDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      title: "",
      department: "",
      concern: "",
      possibleSolution: "",
      anonymous: false,
    },
  });

  // Fetch departments from Azure AD
  useEffect(() => {
    const fetchDepartments = async () => {
      if (open) {
        setIsLoadingDepartments(true);
        try {
          const response = await fetch("/api/users/departments");
          if (response.ok) {
            const data = await response.json();
            setDepartments(data.departments || []);
          } else {
            console.error("Failed to fetch departments");
            // Fallback to default departments if API fails
            setDepartments([
              "People & Culture",
              "Marketing and Corporate Affairs",
              "Finance",
              "TES",
              "Commercial",
              "ERM",
              "E & G",
              "Strategy",
              "PDU",
              "MD/DMDs Office",
              "Legal & Board Affairs",
              "Investments",
              "Internal Audit",
            ]);
          }
        } catch (error) {
          console.error("Error fetching departments:", error);
        } finally {
          setIsLoadingDepartments(false);
        }
      }
    };

    fetchDepartments();
  }, [open]);

  const getDepartmentColor = (department: string) => {
    const colors = {
      "People & Culture": "from-purple-400 to-purple-600",
      "Marketing and Corporate Affairs": "from-pink-400 to-pink-600",
      Finance: "from-green-400 to-green-600",
      TES: "from-blue-400 to-blue-600",
      Commercial: "from-orange-400 to-orange-600",
      ERM: "from-red-400 to-red-600",
      "E & G": "from-teal-400 to-teal-600",
      Strategy: "from-indigo-400 to-indigo-600",
      PDU: "from-cyan-400 to-cyan-600",
      "MD/DMDs Office": "from-amber-400 to-amber-600",
      "Legal & Board Affairs": "from-slate-400 to-slate-600",
      Investments: "from-emerald-400 to-emerald-600",
      "Internal Audit": "from-violet-400 to-violet-600",
    };
    return (
      colors[department as keyof typeof colors] || "from-gray-400 to-gray-600"
    );
  };

  async function onSubmit(data: any) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to submit feedback");

      setOpen(false);
      form.reset();
      router.refresh();
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const selectedDepartment = form.watch("department");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-xl"
          data-submit-feedback-trigger="true"
        >
          <MessageSquare className="w-4 h-4" />
          Submit Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] w-full sm:max-w-[800px] p-0 bg-gradient-to-br from-blue-50 via-white to-blue-50 border-0 shadow-2xl">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>

        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-white relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-200/20 to-pink-200/20 rounded-full translate-y-12 -translate-x-12" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg animate-pulse" />
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Submit New Feedback
              </DialogTitle>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            <p className="text-gray-600 leading-relaxed">
              Share your concerns and suggestions with us. Your feedback helps
              us improve and create a better workplace for everyone.
            </p>
          </div>
        </DialogHeader>

        <Separator className="bg-gradient-to-r from-blue-400 to-indigo-500 h-0.5" />

        <div className="flex flex-col h-full max-h-[calc(90vh-180px)] bg-gradient-to-br from-blue-500 via-gray-100 to-blue-500 rounded-2xl">
          <div className="flex-1 overflow-y-auto px-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 py-6"
              >
                {/* Title and Department Row */}
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-blue-500" />
                          Feedback Title
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter a clear, descriptive title..."
                            {...field}
                            value={field.value || ""}
                            className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="department"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-purple-500" />
                          Department
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                          disabled={isLoadingDepartments}
                        >
                          <FormControl>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm">
                              <SelectValue
                                placeholder={
                                  isLoadingDepartments
                                    ? "Loading departments..."
                                    : "Select your department"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="rounded-xl border-0 shadow-xl">
                            {departments.map((dept) => (
                              <SelectItem
                                key={dept}
                                value={dept}
                                className="rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full bg-gradient-to-r ${getDepartmentColor(
                                      dept
                                    )}`}
                                  />
                                  {dept}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedDepartment && (
                          <Badge
                            className={`bg-gradient-to-r ${getDepartmentColor(
                              selectedDepartment
                            )} text-white border-0 shadow-sm`}
                          >
                            {selectedDepartment}
                          </Badge>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Feedback Content Card */}
                <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0 shadow-lg rounded-2xl">
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="concern"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                            What's your concern or feedback?
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Please describe your concern, suggestion, or feedback in detail. Be specific about what you've observed and how it affects you or the organization..."
                              className="min-h-[120px] resize-none rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-white shadow-sm"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="possibleSolution"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Suggested Solution (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="What solutions would you recommend? How do you think this issue could be resolved or improved?"
                              className="min-h-[100px] resize-none rounded-xl border-gray-200 focus:border-blue-400 focus:ring-blue-400 bg-gradient-to-br from-green-50 to-emerald-50 shadow-sm"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </Card>

                {/* Anonymous Submission Toggle */}
                <FormField
                  control={form.control}
                  name="anonymous"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-2xl border-0 bg-gradient-to-r from-purple-50 to-pink-50 p-6 shadow-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <UserX className="w-4 h-4 text-purple-500" />
                          <FormLabel className="text-sm font-semibold text-gray-900">
                            Submit Anonymously
                          </FormLabel>
                        </div>
                        <FormDescription className="text-sm text-gray-600">
                          Your identity will be kept completely confidential.
                          Only the content of your feedback will be visible.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-purple-500 data-[state=checked]:to-pink-500"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </div>

          {/* Footer with Action Buttons */}
          <div className="flex justify-end gap-4 p-6 pt-4 border-t border-gray-100 bg-gradient-to-r from-blue-50 to-white">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="h-11 px-6 rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={form.handleSubmit(onSubmit)}
              className="h-11 px-8 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0 rounded-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
