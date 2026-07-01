import { z } from "zod";

export const projectFormSchema = z.object({
  name: z.string().trim().min(1, "Project name is required"),
  clientId: z.string().trim().min(1, "Client is required"),
  status: z.enum(["active", "archived"]),
  rateType: z.enum(["hourly", "fixed"]),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
