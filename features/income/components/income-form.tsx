"use client";

import { useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { incomeFormSchema, type IncomeFormValues } from "../schemas";
import { createIncome, updateIncome } from "../actions";
import { Button } from "@/components/ui/button";

interface ClientOption {
  _id: string;
  name: string;
}

interface ProjectOption {
  _id: string;
  clientId: string;
  name: string;
  status: string;
}

interface IncomeFormProps {
  clients: ClientOption[];
  projects: ProjectOption[];
  income?: {
    _id: string;
    amount: number;
    source: string;
    date: string;
    clientId?: { _id: string; name: string } | string;
    projectId?: { _id: string; name: string } | string;
    notes?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IncomeForm({
  clients,
  projects,
  income,
  onSuccess,
  onCancel,
}: IncomeFormProps) {
  const isEditing = !!income;

  // Normalize initial client/project ID strings
  const initialClientId = typeof income?.clientId === "object" ? income.clientId._id : (income?.clientId ?? "");
  const initialProjectId = typeof income?.projectId === "object" ? income.projectId._id : (income?.projectId ?? "");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema) as unknown as Resolver<IncomeFormValues>,
    defaultValues: {
      amount: income?.amount ?? ("" as any),
      source: income?.source ?? "",
      date: income?.date ?? new Date().toISOString().split("T")[0],
      clientId: initialClientId,
      projectId: initialProjectId,
      notes: income?.notes ?? "",
    },
  });

  const watchedClientId = watch("clientId");

  // Filter projects based on selected client
  const filteredProjects = useMemo(() => {
    if (!watchedClientId) return [];
    return projects.filter((p) => p.clientId === watchedClientId && p.status === "active");
  }, [watchedClientId, projects]);

  const onSubmit = async (data: IncomeFormValues) => {
    try {
      if (isEditing && income) {
        const result = await updateIncome(income._id, data);
        if (result.success) {
          toast.success("Income record updated successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to update income.");
        }
      } else {
        const result = await createIncome(data);
        if (result.success) {
          toast.success("Income record added successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to add income.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Amount Field */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-sm font-medium leading-none text-ink-secondary">
            Amount <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint font-medium">$</span>
            <input
              {...register("amount")}
              id="amount"
              type="number"
              min="0"
              step="0.01"
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-surface pl-7 pr-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-xs font-medium text-destructive">{errors.amount.message}</p>}
        </div>

        {/* Date Field */}
        <div className="space-y-1.5">
          <label htmlFor="date" className="text-sm font-medium leading-none text-ink-secondary">
            Date <span className="text-destructive">*</span>
          </label>
          <input
            {...register("date")}
            id="date"
            type="date"
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
          />
          {errors.date && <p className="text-xs font-medium text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Source Field */}
        <div className="space-y-1.5">
          <label htmlFor="source" className="text-sm font-medium leading-none text-ink-secondary">
            Source / Platform <span className="text-destructive">*</span>
          </label>
          <input
            {...register("source")}
            id="source"
            type="text"
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
            placeholder="e.g. Bank Transfer, Stripe, Upwork"
          />
          {errors.source && <p className="text-xs font-medium text-destructive">{errors.source.message}</p>}
        </div>

        {/* Client Field */}
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="text-sm font-medium leading-none text-ink-secondary">
            Linked Client <span className="text-xs text-ink-muted">(Optional)</span>
          </label>
          <select
            {...register("clientId")}
            id="clientId"
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
          >
            <option value="">No Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Project Field */}
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="text-sm font-medium leading-none text-ink-secondary">
            Linked Project <span className="text-xs text-ink-muted">(Optional)</span>
          </label>
          <select
            {...register("projectId")}
            id="projectId"
            disabled={isSubmitting || !watchedClientId}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 disabled:bg-canvas-soft"
          >
            <option value="">No Project</option>
            {filteredProjects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Empty space for grid alignment */}
        <div className="hidden sm:block"></div>
      </div>

      {/* Notes Field */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium leading-none text-ink-secondary">
          Notes <span className="text-xs text-ink-muted">(Optional)</span>
        </label>
        <textarea
          {...register("notes")}
          id="notes"
          disabled={isSubmitting}
          rows={2}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 resize-y"
          placeholder="Invoice number, payment confirmation detail, etc."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink text-sm font-medium"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-9 bg-primary text-white hover:bg-primary-active disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Save Income"
          ) : (
            "Add Income"
          )}
        </Button>
      </div>
    </form>
  );
}
