import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.coerce.number().min(0, "Rate must be non-negative"),
});

export const invoiceFormSchema = z.object({
  clientId: z.string().trim().min(1, "Client is required"),
  projectId: z.string().trim().optional().or(z.literal("")),
  issueDate: z.string().trim().min(1, "Issue date is required"),
  dueDate: z.string().trim().min(1, "Due date is required"),
  lineItems: z.array(lineItemSchema).min(1, "At least one line item is required"),
  status: z.enum(["draft", "sent", "paid", "overdue"]).default("draft"),
  notes: z.string().trim().optional().or(z.literal("")),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type LineItemValues = z.infer<typeof lineItemSchema>;
