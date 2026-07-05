"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { ClientForm } from "./client-form";
import { Button } from "@/components/ui/button";

interface Client {
  _id: string;
  name: string;
  email?: string;
  company?: string;
  notes?: string;
}

interface ClientDetailHeaderProps {
  client: Client;
}

export function ClientDetailHeader({ client }: ClientDetailHeaderProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-surface border border-hairline rounded-lg p-6 shadow-elevation-1">
      <div>
        <span className="text-2xs font-semibold text-primary uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded-full">
          Client Profile
        </span>
        <h1 className="text-heading-2 text-ink font-bold tracking-tight mt-1.5">
          {client.name}
        </h1>
        {client.company && (
          <p className="text-body-sm text-ink-muted mt-0.5">
            {client.company}
          </p>
        )}
      </div>
      
      <Button
        onClick={() => setIsEditOpen(true)}
        variant="outline"
        className="self-start sm:self-auto gap-2 border-hairline hover:bg-canvas-soft hover:text-ink h-9 text-sm font-medium"
      >
        <Pencil className="h-4 w-4 text-ink-faint" />
        Edit Profile
      </Button>

      {/* Edit Client Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150 bg-white">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Client Details</h2>
              <p className="text-xs text-ink-muted mt-0.5">
                Update the profile details for {client.name}.
              </p>
            </div>
            <ClientForm
              client={client}
              onSuccess={() => {
                setIsEditOpen(false);
                router.refresh();
              }}
              onCancel={() => setIsEditOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
