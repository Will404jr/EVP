import * as z from "zod";

export const feedbackFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  department: z.string().min(1, "Please select a department"),
  concern: z.string().min(10, "Concern must be at least 10 characters"),
  possibleSolution: z
    .string()
    .min(10, "Solution must be at least 10 characters"),
  validity: z
    .object({
      startDate: z.date({
        required_error: "Start date is required",
      }),
      endDate: z.date({
        required_error: "End date is required",
      }),
    })
    .refine((data) => data.endDate > data.startDate, {
      message: "End date must be after start date",
      path: ["endDate"],
    }),
  anonymous: z.boolean().default(false),
});

export type FeedbackFormValues = z.infer<typeof feedbackFormSchema>;
