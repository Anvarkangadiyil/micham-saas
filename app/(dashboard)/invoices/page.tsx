import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getInvoices } from "@/features/invoices/actions";
import { getClients } from "@/features/clients/actions";
import { getUserSettings } from "@/features/auth/actions";
import { InvoiceList } from "@/features/invoices/components/invoice-list";

export const metadata = {
  title: "Invoices - Micham",
  description: "Create and manage invoices for client projects",
};

export default async function InvoicesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch invoices, clients, and user settings in parallel
  const [invoicesRes, clientsRes, settingsRes] = await Promise.all([
    getInvoices(),
    getClients(),
    getUserSettings(),
  ]);

  const invoices = invoicesRes.success && invoicesRes.data ? invoicesRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const currencySymbol = settingsRes.success && settingsRes.data?.currencySymbol ? settingsRes.data.currencySymbol : "$";

  return (
    <InvoiceList invoices={invoices} clients={clients} currencySymbol={currencySymbol} />
  );
}
