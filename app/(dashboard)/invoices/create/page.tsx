import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";

export const metadata = {
  title: "Create Invoice - Micham",
  description: "Draft a new client billing invoice",
};

export default async function CreateInvoicePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch clients and projects in parallel to populate dropdown options
  const [clientsRes, projectsRes] = await Promise.all([
    getClients(),
    getProjects(),
  ]);

  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];

  return (
    <InvoiceForm clients={clients} projects={projects} />
  );
}
