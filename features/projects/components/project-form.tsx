"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { projectFormSchema, type ProjectFormValues } from "../schemas";
import { createProject, updateProject } from "../actions";
import { Button } from "@/components/ui/button";

interface ProjectFormProps {
  clientId: string;
  project?: {
    _id: string;
    name: string;
    status: "active" | "archived";
    rateType: "hourly" | "fixed";
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ clientId, project, onSuccess, onCancel }: ProjectFormProps) {
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? "",
      clientId: clientId,
      status: project?.status ?? "active",
      rateType: project?.rateType ?? "fixed",
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    try {
      if (isEditing && project) {
        const result = await updateProject(project._id, data);
        if (result.success) {
          toast.success("Project updated successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to update project.");
        }
      } else {
        const result = await createProject(data);
        if (result.success) {
          toast.success("Project created successfully.");
          onSuccess?.();
        } else {
          toast.error(result.error ?? "Failed to create project.");
        }
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Hidden Client ID */}
      <input type="hidden" {...register("clientId")} />

      {/* Name Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="projectName"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Project Name <span className="text-destructive">*</span>
        </label>
        <input
          {...register("name")}
          id="projectName"
          type="text"
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Website Redesign, SEO Campaign, etc."
        />
        {errors.name && (
          <p className="text-xs font-medium text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Rate Type Field */}
      <div className="space-y-1.5">
        <label
          htmlFor="rateType"
          className="text-sm font-medium leading-none text-ink-secondary"
        >
          Rate Type
        </label>
        <select
          {...register("rateType")}
          id="rateType"
          disabled={isSubmitting}
          className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="fixed">Fixed Rate</option>
          <option value="hourly">Hourly Rate</option>
        </select>
        {errors.rateType && (
          <p className="text-xs font-medium text-destructive">
            {errors.rateType.message}
          </p>
        )}
      </div>

      {/* Status Field (only shown or editable if editing, or default to active) */}
      {isEditing && (
        <div className="space-y-1.5">
          <label
            htmlFor="status"
            className="text-sm font-medium leading-none text-ink-secondary"
          >
            Status
          </label>
          <select
            {...register("status")}
            id="status"
            disabled={isSubmitting}
            className="flex h-10 w-full rounded-md border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          {errors.status && (
            <p className="text-xs font-medium text-destructive">
              {errors.status.message}
            </p>
          )}
        </div>
      )}

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
            "Add Project"
          )}
        </Button>
      </div>
    </form>
  );
}
