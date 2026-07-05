"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Mail, Building2, ExternalLink, Pencil, Trash2, FolderKanban } from "lucide-react";
import { toast } from "sonner";
import { deleteClient } from "../actions";
import { ClientForm } from "./client-form";
import { Button } from "@/components/ui/button";

interface Client {
  _id: string;
  name: string;
  email?: string;
  company?: string;
  notes?: string;
  createdAt?: string;
}

interface ClientListProps {
  clients: Client[];
}

export function ClientList({ clients }: ClientListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter clients based on search query
  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      const result = await deleteClient(id);
      if (result.success) {
        toast.success(result.message ?? "Client deleted successfully.");
        setDeletingClientId(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete client.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the client.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-heading-2 text-ink font-bold tracking-tight">Clients</h1>
          <p className="text-body-sm text-ink-muted">
            Manage your client accounts and their associated projects.
          </p>
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="bg-primary text-white hover:bg-primary-active self-start sm:self-auto gap-2 rounded-md h-9 px-4 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Client
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          type="text"
          placeholder="Filter by name or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-surface pl-10 pr-4 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary"
        />
      </div>

      {/* Client Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredClients.map((client) => (
            <div
              key={client._id}
              className="group flex flex-col justify-between rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 transition-all hover:shadow-elevation-2"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-ink text-body-md group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    {client.company && (
                      <div className="flex items-center gap-1.5 text-xs text-ink-muted mt-1 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-ink-faint" />
                        <span>{client.company}</span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/clients/${client._id}`)}
                    className="h-8 gap-1 border-hairline hover:bg-canvas-soft hover:text-ink text-xs"
                  >
                    View
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>

                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-ink-secondary">
                    <Mail className="h-3.5 w-3.5 text-ink-faint" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}

                {client.notes && (
                  <p className="text-xs text-ink-muted line-clamp-2 bg-canvas-soft/50 p-2 rounded border border-hairline/40 italic">
                    {client.notes}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-hairline mt-4 pt-3 text-xs">
                <button
                  onClick={() => router.push(`/clients/${client._id}`)}
                  className="flex items-center gap-1 text-primary hover:text-primary-active font-medium"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  <span>Projects</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditingClient(client)}
                    className="flex items-center gap-1 text-ink-muted hover:text-ink transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingClientId(client._id)}
                    className="flex items-center gap-1 text-ink-muted hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas-soft text-ink-muted mb-3">
            <Building2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-ink">No clients found</h3>
          <p className="text-xs text-ink-muted mt-1 max-w-xs">
            {searchQuery
              ? "No clients match your search criteria. Try a different query."
              : "Get started by adding your first client to track their projects."}
          </p>
          {!searchQuery && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="bg-primary text-white hover:bg-primary-active mt-4 h-8 text-xs"
            >
              Add Client
            </Button>
          )}
        </div>
      )}

      {/* Add Client Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Add New Client</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Create a new client profile to associate with future projects and invoices.
              </p>
            </div>
            <ClientForm
              onSuccess={() => {
                setIsAddOpen(false);
                router.refresh();
              }}
              onCancel={() => setIsAddOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150 bg-white">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Client</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Update the profile details for {editingClient.name}.
              </p>
            </div>
            <ClientForm
              client={editingClient}
              onSuccess={() => {
                setEditingClient(null);
                router.refresh();
              }}
              onCancel={() => setEditingClient(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Client Confirmation Modal */}
      {deletingClientId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150 bg-white">
            <h3 className="text-lg font-semibold text-ink">Delete Client</h3>
            <p className="text-sm text-ink-muted mt-2">
              Are you sure you want to delete this client? This action will also **soft-delete all projects** associated with this client.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingClientId(null)}
                className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={() => handleDelete(deletingClientId)}
                className="h-9"
              >
                {isDeleting ? "Deleting..." : "Delete Client"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
