import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserSettings } from "@/features/auth/actions";
import { AddTransactionClient } from "@/features/dashboard/components/add-transaction-client";

export const metadata = {
  title: "New Transaction - Micham",
  description: "Log a new business income inflow or expense outflow",
};

export default async function AddTransactionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch parallelized dashboard and settings data
  const [clientsRes, projectsRes, settingsRes] = await Promise.all([
    getClients(),
    getProjects(),
    getUserSettings(),
  ]);

  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];
  const currencySymbol = settingsRes.success && settingsRes.data?.currencySymbol ? settingsRes.data.currencySymbol : "$";

  return (
    <AddTransactionClient
      clients={clients}
      projects={projects}
      currencySymbol={currencySymbol}
    />
  );
}
