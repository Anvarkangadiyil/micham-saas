"use client";

import { useState, useMemo } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Paperclip, X } from "lucide-react";
import { toast } from "sonner";
import { expenseFormSchema, type ExpenseFormValues } from "../schemas";
import { createExpense, updateExpense, uploadReceiptAction, suggestCategoryAction } from "../actions";
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

interface ExpenseFormProps {
  clients: ClientOption[];
  projects: ProjectOption[];
  expense?: {
    _id: string;
    amount: number;
    category: "software" | "travel" | "equipment" | "marketing" | "other";
    description: string;
    date: string;
    clientId?: { _id: string; name: string } | string;
    projectId?: { _id: string; name: string } | string;
    receiptUrl?: string;
    notes?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
  currencySymbol?: string;
}

const CATEGORIES = [
  { value: "software", label: "Software / SaaS" },
  { value: "travel", label: "Travel & Transport" },
  { value: "equipment", label: "Equipment & Hardware" },
  { value: "marketing", label: "Marketing & Ads" },
  { value: "other", label: "Other Expenses" },
];

export function ExpenseForm({
  clients,
  projects,
  expense,
  onSuccess,
  onCancel,
  currencySymbol = "$",
}: ExpenseFormProps) {
  const isEditing = !!expense;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string>(expense?.receiptUrl ?? "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggestingCategory, setIsSuggestingCategory] = useState(false);

  // Normalize initial client/project ID strings
  const initialClientId = typeof expense?.clientId === "object" ? expense.clientId._id : (expense?.clientId ?? "");
  const initialProjectId = typeof expense?.projectId === "object" ? expense.projectId._id : (expense?.projectId ?? "");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as unknown as Resolver<ExpenseFormValues>,
    defaultValues: {
      amount: expense?.amount ?? ("" as any),
      category: expense?.category ?? "software",
      description: expense?.description ?? "",
      date: expense?.date ?? new Date().toISOString().split("T")[0],
      clientId: initialClientId,
      projectId: initialProjectId,
      receiptUrl: expense?.receiptUrl ?? "",
      notes: expense?.notes ?? "",
    },
  });

  const { onBlur: onDescriptionBlur, ...descriptionRegister } = register("description");

  const watchedClientId = watch("clientId");

  // Filter projects based on selected client
  const filteredProjects = useMemo(() => {
    if (!watchedClientId) return [];
    return projects.filter((p) => p.clientId === watchedClientId && p.status === "active");
  }, [watchedClientId, projects]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setReceiptUrl("");
    setValue("receiptUrl", "");
  };

  const onSubmit = async (data: ExpenseFormValues) => {
    let finalReceiptUrl = receiptUrl;

    // Handle file upload if a new file is selected
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", selectedFile);
        
        const uploadResult = await uploadReceiptAction(formData);
        if (uploadResult.success && uploadResult.url) {
          finalReceiptUrl = uploadResult.url;
          setReceiptUrl(uploadResult.url);
          setValue("receiptUrl", uploadResult.url);
        } else {
          toast.error(uploadResult.error ?? "Receipt upload failed. Continuing without file.");
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Failed to upload receipt. Continuing without file.");
      } finally {
        setIsUploading(false);
      }
    }

    try {
      const submissionData = {
        ...data,
        receiptUrl: finalReceiptUrl,
      };

      if (isEditing && expense) {
        const result = await updateExpense(expense._id, submissionData);
        if (result.success) {
          toast.success("Expense updated successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to update expense.");
        }
      } else {
        const result = await createExpense(submissionData);
        if (result.success) {
          toast.success("Expense added successfully.");
          setSelectedFile(null);
          setReceiptUrl("");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to add expense.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4">
        {/* Amount Field */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="text-sm font-medium leading-none text-ink-secondary">
            Amount <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint font-medium">{currencySymbol}</span>
            <input
              {...register("amount")}
              id="amount"
              type="number"
              min="0"
              step="0.01"
              disabled={isSubmitting || isUploading}
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
            disabled={isSubmitting || isUploading}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
          />
          {errors.date && <p className="text-xs font-medium text-destructive">{errors.date.message}</p>}
        </div>
      </div>

      <div className="grid gap-4">
        {/* Category Field */}
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-sm font-medium leading-none text-ink-secondary flex items-center justify-between">
            <span>Category <span className="text-destructive">*</span></span>
            {isSuggestingCategory && (
              <span className="text-3xs text-primary font-medium flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                AI categorizing...
              </span>
            )}
          </label>
          <select
            {...register("category")}
            id="category"
            disabled={isSubmitting || isUploading}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs font-medium text-destructive">{errors.category.message}</p>}
        </div>

        {/* Description Field */}
        <div className="space-y-1.5">
          <label htmlFor="description" className="text-sm font-medium leading-none text-ink-secondary">
            Description / Vendor <span className="text-destructive">*</span>
          </label>
          <input
            {...descriptionRegister}
            onBlur={async (e) => {
              // Call react-hook-form's blur handler
              onDescriptionBlur(e);
              const value = e.target.value;
              if (value && value.trim().length > 2 && !isEditing) {
                setIsSuggestingCategory(true);
                try {
                  const res = await suggestCategoryAction(value);
                  if (res.success && res.category) {
                    setValue("category", res.category as any);
                  }
                } catch (err) {
                  console.error("AI categorization suggestion failed:", err);
                } finally {
                  setIsSuggestingCategory(false);
                }
              }
            }}
            id="description"
            type="text"
            disabled={isSubmitting || isUploading || isSuggestingCategory}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50"
            placeholder="e.g. GitHub Copilot, Uber taxi"
          />
          {errors.description && <p className="text-xs font-medium text-destructive">{errors.description.message}</p>}
        </div>
      </div>

      <div className="grid gap-4">
        {/* Client Field */}
        <div className="space-y-1.5">
          <label htmlFor="clientId" className="text-sm font-medium leading-none text-ink-secondary">
            Linked Client <span className="text-xs text-ink-muted">(Optional)</span>
          </label>
          <select
            {...register("clientId")}
            id="clientId"
            disabled={isSubmitting || isUploading}
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

        {/* Project Field */}
        <div className="space-y-1.5">
          <label htmlFor="projectId" className="text-sm font-medium leading-none text-ink-secondary">
            Linked Project <span className="text-xs text-ink-muted">(Optional)</span>
          </label>
          <select
            {...register("projectId")}
            id="projectId"
            disabled={isSubmitting || isUploading || !watchedClientId}
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
      </div>

      {/* File Upload Field */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium leading-none text-ink-secondary">
          Receipt Attachment <span className="text-xs text-ink-muted">(Optional)</span>
        </label>
        
        {receiptUrl ? (
          <div className="flex items-center justify-between border border-hairline rounded-md p-2 bg-canvas-soft/50 text-xs">
            <span className="truncate text-ink-secondary max-w-[280px]">
              Uploaded Receipt:{" "}
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View Receipt
              </a>
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-ink-muted hover:text-destructive p-1 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : selectedFile ? (
          <div className="flex items-center justify-between border border-hairline rounded-md p-2 bg-canvas-soft/50 text-xs">
            <span className="truncate text-ink-secondary max-w-[280px]">
              Selected File: <strong>{selectedFile.name}</strong>
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="text-ink-muted hover:text-destructive p-1 rounded-full transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center border border-dashed border-hairline rounded-md p-4 bg-canvas-soft/20 hover:bg-canvas-soft/50 transition-colors relative cursor-pointer group">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              disabled={isSubmitting || isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-1.5 text-xs text-ink-muted">
              <Paperclip className="h-4.5 w-4.5 text-ink-faint group-hover:text-primary transition-colors" />
              <span>Click or Drag receipt file to attach</span>
            </div>
          </div>
        )}
      </div>

      {/* Notes Field */}
      <div className="space-y-1.5">
        <label htmlFor="notes" className="text-sm font-medium leading-none text-ink-secondary">
          Notes <span className="text-xs text-ink-muted">(Optional)</span>
        </label>
        <textarea
          {...register("notes")}
          id="notes"
          disabled={isSubmitting || isUploading}
          rows={2}
          className="flex min-h-[60px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:opacity-50 resize-y"
          placeholder="Client authorization codes, purpose, etc."
        />
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-hairline">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting || isUploading}
            onClick={onCancel}
            className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink text-sm font-medium"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || isUploading}
          className="h-9 bg-primary text-white hover:bg-primary-active disabled:opacity-50"
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUploading ? "Uploading receipt..." : "Saving..."}
            </>
          ) : isEditing ? (
            "Save Expense"
          ) : (
            "Add Expense"
          )}
        </Button>
      </div>
    </form>
  );
}
