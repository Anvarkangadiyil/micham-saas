import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";

export const metadata = {
  title: "Create Invoice - Freelancer Finance",
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
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      <Header user={session.user} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <InvoiceForm clients={clients} projects={projects} />
      </main>
    </div>
  );
}
