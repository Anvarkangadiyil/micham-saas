import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getInvoiceById } from "@/features/invoices/actions";
import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { InvoiceForm } from "@/features/invoices/components/invoice-form";

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const result = await getInvoiceById(id);
  return {
    title: result.success && result.data ? `Edit ${result.data.invoiceNumber} - Micham` : "Edit Invoice - Micham",
  };
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [invoiceResult, clientsRes, projectsRes] = await Promise.all([
    getInvoiceById(id),
    getClients(),
    getProjects(),
  ]);

  if (!invoiceResult.success || !invoiceResult.data) {
    redirect("/invoices");
  }

  const invoice = invoiceResult.data;
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];

  return (
    <InvoiceForm
      clients={clients}
      projects={projects}
      invoice={invoice as any}
    />
  );
}
