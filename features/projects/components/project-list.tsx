"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FolderKanban, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { deleteProject } from "../actions";
import { ProjectForm } from "./project-form";
import { Button } from "@/components/ui/button";

interface Project {
  _id: string;
  clientId: string;
  name: string;
  status: "active" | "archived";
  rateType: "hourly" | "fixed";
  createdAt?: string;
}

interface ProjectListProps {
  clientId: string;
  projects: Project[];
}

export function ProjectList({ clientId, projects }: ProjectListProps) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteProject(id);
      if (result.success) {
        toast.success("Project deleted successfully.");
        setDeletingProjectId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete project.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the project.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-hairline pb-3">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-ink">Projects</h2>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-canvas-soft text-xs font-medium text-ink-secondary border border-hairline">
            {projects.length}
          </span>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-white hover:bg-primary-active gap-1.5 h-8 px-3 text-xs font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Project
        </Button>
      </div>

      {/* Projects List */}
      {projects.length > 0 ? (
        <div className="divide-y divide-hairline border border-hairline rounded-lg overflow-hidden bg-surface shadow-elevation-1">
          {projects.map((project) => (
            <div
              key={project._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-canvas-soft/40 transition-colors"
            >
              <div className="space-y-1.5">
                <h3 className="font-medium text-ink text-sm sm:text-body-sm">
                  {project.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Status Badge */}
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-2xs font-semibold border ${
                      project.status === "active"
                        ? "bg-success-bg text-success border-success/20"
                        : "bg-canvas-soft text-ink-muted border-hairline"
                    }`}
                  >
                    {project.status === "active" ? "Active" : "Archived"}
                  </span>

                  {/* Rate Type Badge */}
                  <span
                    className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-2xs font-semibold border ${
                      project.rateType === "hourly"
                        ? "bg-info-bg text-info border-info/20"
                        : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                    }`}
                  >
                    {project.rateType === "hourly" ? (
                      <>
                        <Clock className="h-3 w-3" />
                        Hourly
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-3 w-3" />
                        Fixed Rate
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingProject(project)}
                  className="h-8 w-8 p-0 border-hairline hover:bg-canvas-soft text-ink-muted hover:text-ink"
                  title="Edit Project"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span className="sr-only">Edit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeletingProjectId(project._id)}
                  className="h-8 w-8 p-0 border-hairline hover:bg-destructive/10 text-ink-muted hover:text-destructive"
                  title="Delete Project"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface py-8 text-center">
          <p className="text-xs text-ink-muted">No projects found for this client.</p>
          <Button
            onClick={() => setIsAddOpen(true)}
            variant="outline"
            className="mt-3 h-7 px-3 text-2xs border-hairline hover:bg-canvas-soft"
          >
            Create first project
          </Button>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Add New Project</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Create a new project workspace for this client.
              </p>
            </div>
            <ProjectForm
              clientId={clientId}
              onSuccess={() => {
                setIsAddOpen(false);
                router.refresh();
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Project</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Update the project details.
              </p>
            </div>
            <ProjectForm
              clientId={clientId}
              project={editingProject}
              onSuccess={() => {
                setEditingProject(null);
                router.refresh();
              }}
              onCancel={() => setEditingProject(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {deletingProjectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-ink">Delete Project</h3>
            <p className="text-sm text-ink-muted mt-2">
              Are you sure you want to delete this project? This will soft-delete the record.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingProjectId(null)}
                className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => handleDelete(deletingProjectId)}
                className="h-9"
              >
                {isDeleting ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
