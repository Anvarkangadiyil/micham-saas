import { notFound } from "next/navigation";
import { getSharedInvoiceById } from "@/features/invoices/actions";
import { Building2, Mail, Folder } from "lucide-react";
import { PrintTrigger, SharedInvoiceActions } from "./print-trigger";

interface SharedInvoicePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SharedInvoicePageProps) {
  const { id } = await params;
  const result = await getSharedInvoiceById(id);
  return {
    title: result.success && result.data ? `Invoice ${result.data.invoiceNumber} - Micham` : "View Shared Invoice - Micham",
  };
}

export default async function SharedInvoicePage({ params }: SharedInvoicePageProps) {
  const { id } = await params;
  const result = await getSharedInvoiceById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const invoice = result.data;

  // Calculate totals
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const total = subtotal;

  return (
    <div className="min-h-screen bg-canvas-soft print:bg-white flex flex-col justify-center items-center py-10 px-4 sm:px-6 print:py-0 print:px-0">
      {/* Print Trigger Client Helper */}
      <PrintTrigger />

      {/* Interactive Toolbar for web view */}
      <SharedInvoiceActions />

      {/* Invoice Document Layout Container */}
      <div className="w-full max-w-3xl rounded-lg border border-hairline bg-surface p-8 sm:p-12 shadow-elevation-2 print:shadow-none print:border-none print:p-0 print:max-w-none flex flex-col justify-between min-h-[700px] print:min-h-0 bg-white">
        <div className="space-y-8">
          {/* Header Row */}
          <div className="flex justify-between items-start border-b border-hairline/60 pb-6 print:pb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink uppercase">
                Invoice Statement
              </h1>
              <p className="text-xs text-ink-muted mt-1">
                Ref Number: <span className="font-semibold text-ink-secondary">{invoice.invoiceNumber}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block">
                Invoice Status
              </span>
              <span className="inline-block rounded bg-success-bg border border-success/15 px-2 py-0.5 text-2xs font-semibold text-success uppercase mt-1">
                {invoice.status}
              </span>
            </div>
          </div>

          {/* Billing Info Grid */}
          <div className="grid gap-8 sm:grid-cols-2 text-xs border-b border-hairline/60 pb-6 print:pb-4">
            {/* Client Info */}
            <div className="space-y-2">
              <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block">
                Prepared For
              </span>
              {invoice.clientId ? (
                <div className="space-y-1">
                  <div className="font-bold text-ink text-sm leading-none">
                    {invoice.clientId.name}
                  </div>
                  {invoice.clientId.company && (
                    <div className="text-ink-secondary flex items-center gap-1.5 font-medium leading-relaxed">
                      <Building2 className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                      {invoice.clientId.company}
                    </div>
                  )}
                  {invoice.clientId.email && (
                    <div className="text-ink-muted flex items-center gap-1.5 leading-relaxed">
                      <Mail className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                      {invoice.clientId.email}
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-ink-faint italic">Client details missing</span>
              )}
            </div>

            {/* Dates / Project */}
            <div className="space-y-2">
              <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block">
                Billing Context
              </span>
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Issue Date</span>
                  <span className="font-medium text-ink-secondary">
                    {new Date(invoice.issueDate).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Due Date</span>
                  <span className="font-bold text-ink">
                    {new Date(invoice.dueDate).toLocaleDateString(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {invoice.projectId && (
                  <div className="flex justify-between border-t border-hairline/40 pt-1.5 mt-1.5">
                    <span className="text-ink-muted">Linked Project</span>
                    <span className="font-medium text-ink-secondary flex items-center gap-1">
                      <Folder className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                      {invoice.projectId.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="pt-2">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-hairline text-ink-muted font-medium text-2xs uppercase tracking-wider">
                  <th className="py-2.5 font-bold">Service / Description</th>
                  <th className="py-2.5 text-center w-20 font-bold">Qty</th>
                  <th className="py-2.5 text-right w-24 font-bold">Rate</th>
                  <th className="py-2.5 text-right pr-2 w-28 font-bold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {invoice.lineItems.map((item, idx) => (
                  <tr key={item._id ?? idx} className="hover:bg-canvas-soft/10 print:hover:bg-transparent">
                    <td className="py-3 text-ink font-medium leading-normal">{item.description}</td>
                    <td className="py-3 text-center text-ink-secondary font-medium">{item.quantity}</td>
                    <td className="py-3 text-right text-ink-secondary">{invoice.currencySymbol ?? "$"}{item.rate.toFixed(2)}</td>
                    <td className="py-3 text-right pr-2 font-semibold text-ink">
                      {invoice.currencySymbol ?? "$"}{(item.quantity * item.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notes & Invoice Totals Summary */}
        <div className="border-t border-hairline pt-6 mt-10 flex flex-col sm:flex-row sm:justify-between items-start gap-6 print:mt-8 print:pt-4">
          {/* Notes Box */}
          <div className="flex-1 text-xs space-y-1.5">
            {invoice.notes && (
              <>
                <h4 className="font-semibold text-ink-secondary uppercase text-2xs tracking-wider">
                  Invoice Notes & Terms
                </h4>
                <p className="text-ink-muted leading-relaxed whitespace-pre-wrap italic">
                  {invoice.notes}
                </p>
              </>
            )}
          </div>

          {/* Subtotal / Grand Total */}
          <div className="w-full sm:w-60 text-xs space-y-2.5 self-end">
            <div className="flex justify-between text-ink-muted border-b border-hairline/40 pb-2">
              <span>Subtotal</span>
              <span className="font-semibold">{invoice.currencySymbol ?? "$"}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm font-bold text-ink">
              <span>Total Balance Due</span>
              <span className="text-base text-primary font-bold">{invoice.currencySymbol ?? "$"}{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public page print trigger prompt */}
      <div className="mt-6 flex items-center justify-center print:hidden">
        <p className="text-xs text-ink-muted">
          Micham Invoice Statement. Click <strong className="font-semibold text-ink-secondary">Print / PDF</strong> above to print or save this invoice as a PDF file.
        </p>
      </div>
    </div>
  );
}
