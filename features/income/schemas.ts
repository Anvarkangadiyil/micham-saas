import { z } from "zod";

export const incomeFormSchema = z.object({
  amount: z.coerce.number().min(0, "Amount must be a non-negative number"),
  date: z.string().trim().min(1, "Date is required"),
  clientId: z.string().trim().optional().or(z.literal("")),
  projectId: z.string().trim().optional().or(z.literal("")),
  source: z.string().trim().min(1, "Source is required"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type IncomeFormValues = z.infer<typeof incomeFormSchema>;
