import { z } from "zod";

export const expenseFormSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be a non-negative number"),
  category: z.enum(["software", "travel", "equipment", "marketing", "other"], {
    message: "Please select a valid category",
  }),
  description: z.string().trim().min(1, "Description is required"),
  date: z.string().trim().min(1, "Date is required"),
  clientId: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().optional().or(z.literal("")),
  receiptUrl: z.string().trim().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
