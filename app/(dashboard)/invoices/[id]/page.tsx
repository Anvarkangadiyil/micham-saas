import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { getInvoiceById } from "@/features/invoices/actions";
import { getUserSettings } from "@/features/auth/actions";
import { InvoiceDetail } from "@/features/invoices/components/invoice-detail";

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const result = await getInvoiceById(id);
  return {
    title: result.success && result.data ? `${result.data.invoiceNumber} - Micham` : "Invoice Details - Micham",
  };
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [invoiceResult, settingsRes] = await Promise.all([
    getInvoiceById(id),
    getUserSettings(),
  ]);

  if (!invoiceResult.success || !invoiceResult.data) {
    redirect("/invoices");
  }

  const invoice = invoiceResult.data;
  const currencySymbol = settingsRes.success && settingsRes.data?.currencySymbol ? settingsRes.data.currencySymbol : "$";

  return (
    <InvoiceDetail invoice={invoice as any} currencySymbol={currencySymbol} />
  );
}
