"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clientFormSchema, type ClientFormValues } from "../schemas";
import { createClient, updateClient } from "../actions";
import { Button } from "@/components/ui/button";

interface ClientFormProps {
  client?: {
    _id: string;
    name: string;
    email?: string;
    company?: string;
    notes?: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ client, onSuccess, onCancel }: ClientFormProps) {
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name ?? "",
      email: client?.email ?? "",
      company: client?.company ?? "",
      notes: client?.notes ?? "",
    },
  });

  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (isEditing && client) {
        const result = await updateClient(client._id, data);
        if (result.success) {
          toast.success("Client updated successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to update client.");
        }
      } else {
        const result = await createClient(data);
        if (result.success) {
          toast.success("Client created successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to create client.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="name"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Client Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Acme Corp or John Doe"
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Email address
        </label>
        <input
          {...register("email")}
          id="email"
          type="email"
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="contact@acme.com"
        />
        {errors.email && (
          <p className="text-xs font-medium text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Company Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="company"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Company Name
        </label>
        <input
          {...register("company")}
          id="company"
          type="text"
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Acme Industries"
        />
        {errors.company && (
          <p className="text-xs font-medium text-destructive">
            {errors.company.message}
          </p>
        )}
      </div>

      {/* Notes Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="notes"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Notes
        </label>
        <textarea
          {...register("notes")}
          id="notes"
          disabled={isSubmitting}
          rows={3}
          className="flex min-h-[80px] w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 resize-y"
          placeholder="Billing details, key contacts, or engagement notes..."
        />
        {errors.notes && (
          <p className="text-xs font-medium text-destructive">
            {errors.notes.message}
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
            className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
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
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : isEditing ? (
            "Save Changes"
          ) : (
            "Create Client"
          )}
        </Button>
      </div>
    </form>
  );
}
