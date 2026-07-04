import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getClients } from "@/features/clients/actions";
import { ClientList } from "@/features/clients/components/client-list";

export const metadata = {
  title: "Clients - Micham",
  description: "Manage your client profiles",
};

export default async function ClientsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const result = await getClients();
  const clients = result.success && result.data ? result.data : [];

  return result.success ? (
    <ClientList clients={clients} />
  ) : (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
      {result.error ?? "Failed to load clients. Please reload the page."}
    </div>
  );
}
