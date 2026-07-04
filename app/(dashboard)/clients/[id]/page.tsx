import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Mail, Building2, Calendar, FileText } from "lucide-react";
import { auth } from "@/auth";

import { getClientById } from "@/features/clients/actions";
import { getProjectsByClientId } from "@/features/projects/actions";
import { ProjectList } from "@/features/projects/components/project-list";
import { ClientDetailHeader } from "@/features/clients/components/client-detail-header";

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const result = await getClientById(id);
  return {
    title: result.success && result.data ? `${result.data.name} - Micham` : "Client Details - Micham",
  };
}

export default async function ClientDetailPage({ params }: ClientDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const clientResult = await getClientById(id);
  if (!clientResult.success || !clientResult.data) {
    redirect("/clients");
  }

  const client = clientResult.data;
  const projectsResult = await getProjectsByClientId(id);
  const projects = projectsResult.success && projectsResult.data ? projectsResult.data : [];

  return (
    <>
      {/* Back Link */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Clients
        </Link>
      </div>

      {/* Client Profile Header (handles editing and details) */}
      <ClientDetailHeader client={client} />

      {/* Client Notes & Details Card */}
      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
            <h3 className="text-sm font-semibold text-ink mb-3">Client Info</h3>
            <div className="space-y-3 text-xs">
              {client.company && (
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-ink-faint shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-ink-secondary">Company</div>
                    <div className="text-ink-muted mt-0.5">{client.company}</div>
                  </div>
                </div>
              )}
              {client.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-4 w-4 text-ink-faint shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-ink-secondary">Email</div>
                    <a href={`mailto:${client.email}`} className="text-primary hover:underline mt-0.5 block break-all">
                      {client.email}
                    </a>
                  </div>
                </div>
              )}
              {client.createdAt && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-ink-faint shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-ink-secondary">Added on</div>
                    <div className="text-ink-muted mt-0.5">
                      {new Date(client.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {client.notes && (
            <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-ink mb-3">
                <FileText className="h-4 w-4 text-ink-faint" />
                <h3>Notes</h3>
              </div>
              <p className="text-xs text-ink-muted leading-relaxed whitespace-pre-wrap">
                {client.notes}
              </p>
            </div>
          )}
        </div>

        {/* Projects Section */}
        <div>
          <ProjectList clientId={client._id} projects={projects} />
        </div>
      </div>
    </>
  );
}
