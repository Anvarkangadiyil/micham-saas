"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Calendar,
  Building2,
  Mail,
  Copy,
  Printer,
  CheckCircle,
  Pencil,
  Trash2,
  AlertTriangle,
  Folder,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { markInvoiceAsPaid, deleteInvoice } from "../actions";

interface Invoice {
  _id: string;
  invoiceNumber: string;
  clientId?: { _id: string; name: string; email?: string; company?: string; notes?: string };
  projectId?: { _id: string; name: string; rateType: string; status: string };
  issueDate: string;
  dueDate: string;
  lineItems: Array<{ _id?: string; description: string; quantity: number; rate: number }>;
  status: "draft" | "sent" | "paid" | "overdue";
  notes?: string;
  createdAt?: string;
}

interface InvoiceDetailProps {
  invoice: Invoice;
  currencySymbol?: string;
}

export function InvoiceDetail({ invoice, currencySymbol = "$" }: InvoiceDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);

  // Calculate totals
  const subtotal = invoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );
  const total = subtotal;

  // Handle Mark as Paid
  const handleMarkAsPaid = async () => {
    setIsMarkingPaid(true);
    try {
      const result = await markInvoiceAsPaid(invoice._id);
      if (result.success) {
        toast.success(result.message ?? "Invoice marked as paid.");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to mark invoice as paid.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setIsMarkingPaid(false);
    }
  };

  // Handle Delete
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteInvoice(invoice._id);
      if (result.success) {
        toast.success("Invoice deleted successfully.");
        router.push("/invoices");
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete invoice.");
        setShowDeleteConfirm(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Copy Shareable Link
  const handleCopyLink = () => {
    const origin = window.location.origin;
    const shareableUrl = `${origin}/invoices/shared/${invoice._id}`;
    navigator.clipboard.writeText(shareableUrl);
    toast.success("Shareable read-only link copied to clipboard!");
  };

  // Open public view to print
  const handlePrint = () => {
    const origin = window.location.origin;
    const printUrl = `${origin}/invoices/shared/${invoice._id}?print=true`;
    window.open(printUrl, "_blank");
  };

  // Helper for status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-success-bg border border-success/15 px-2.5 py-1 text-xs font-semibold text-success uppercase">
            Paid
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30 uppercase">
            Sent
          </span>
        );
      case "overdue":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-destructive-bg border border-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive uppercase">
            Overdue
          </span>
        );
      default: // draft
        return (
          <span className="inline-flex items-center gap-1 rounded bg-canvas-soft border border-hairline px-2.5 py-1 text-xs font-semibold text-ink-muted uppercase">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
        <div>
          <Link
            href="/invoices"
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Invoices
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-heading-2 font-bold tracking-tight text-ink">
              {invoice.invoiceNumber}
            </h1>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {/* Invoice Control Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Copy Link */}
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline hover:bg-canvas-soft text-xs font-medium"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Copy Link</span>
          </Button>

          {/* Print PDF */}
          <Button
            onClick={handlePrint}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline hover:bg-canvas-soft text-xs font-medium"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </Button>

          {/* Edit */}
          <Button
            onClick={() => router.push(`/invoices/${invoice._id}/edit`)}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline hover:bg-canvas-soft text-xs font-medium text-ink-secondary"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>

          {/* Mark Paid */}
          {invoice.status !== "paid" && (
            <Button
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
              size="sm"
              className="bg-primary text-white hover:bg-primary-active h-9 px-4 text-xs font-medium gap-1.5 rounded-md"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              <span>{isMarkingPaid ? "Marking..." : "Mark Paid"}</span>
            </Button>
          )}

          {/* Delete */}
          <Button
            onClick={() => setShowDeleteConfirm(true)}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 border-hairline hover:bg-destructive/10 text-xs font-medium text-destructive hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Invoice Page Visual Render */}
        <div className="md:col-span-2 rounded-lg border border-hairline bg-surface p-8 shadow-elevation-2 space-y-8 min-h-[600px] flex flex-col justify-between">
          <div className="space-y-8">
            {/* Header: Logo and Title */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-ink uppercase">Invoice</h2>
                <p className="text-xs text-ink-muted mt-1">Invoice Ref: {invoice.invoiceNumber}</p>
              </div>
              <div className="text-right">
                <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider">
                  Status
                </span>
                <div className="font-bold text-sm text-ink capitalize mt-0.5">
                  {invoice.status}
                </div>
              </div>
            </div>

            {/* Client & Billing Info */}
            <div className="grid gap-6 sm:grid-cols-2 text-xs border-t border-hairline pt-6">
              <div>
                <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                  Billed To
                </span>
                {invoice.clientId ? (
                  <div className="space-y-1.5">
                    <div className="font-bold text-ink text-sm">{invoice.clientId.name}</div>
                    {invoice.clientId.company && (
                      <div className="text-ink-secondary flex items-center gap-1.5 font-medium">
                        <Building2 className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                        {invoice.clientId.company}
                      </div>
                    )}
                    {invoice.clientId.email && (
                      <div className="text-ink-muted flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-ink-faint shrink-0" />
                        {invoice.clientId.email}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-ink-faint italic">Client details missing</span>
                )}
              </div>

              <div>
                <span className="text-2xs font-semibold text-ink-muted uppercase tracking-wider block mb-2">
                  Invoice Dates
                </span>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Issue Date</span>
                    <span className="font-medium text-ink-secondary">
                      {new Date(invoice.issueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Due Date</span>
                    <span className="font-bold text-ink">
                      {new Date(invoice.dueDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  {invoice.projectId && (
                    <div className="flex justify-between border-t border-hairline/60 pt-2 mt-1">
                      <span className="text-ink-muted">Project Link</span>
                      <span className="font-medium text-primary flex items-center gap-1">
                        <Folder className="h-3 w-3 shrink-0" />
                        {invoice.projectId.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="border-t border-hairline pt-6">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-hairline text-ink-muted font-medium text-2xs uppercase tracking-wider">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center w-20">Quantity</th>
                    <th className="py-2.5 text-right w-28">Rate</th>
                    <th className="py-2.5 text-right pr-2 w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {invoice.lineItems.map((item, idx) => (
                    <tr key={item._id ?? idx} className="hover:bg-canvas-soft/10">
                      <td className="py-3 text-ink font-medium leading-normal">{item.description}</td>
                      <td className="py-3 text-center text-ink-secondary font-medium">{item.quantity}</td>
                      <td className="py-3 text-right text-ink-secondary">{currencySymbol}{item.rate.toFixed(2)}</td>
                      <td className="py-3 text-right pr-2 font-semibold text-ink">
                        {currencySymbol}{(item.quantity * item.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Invoice Summary and Total Footer */}
          <div className="border-t border-hairline pt-6 mt-8 flex flex-col sm:flex-row sm:justify-between items-start gap-4">
            {/* Notes / T&C */}
            <div className="flex-1 text-xs">
              {invoice.notes && (
                <>
                  <h4 className="font-semibold text-ink-secondary mb-1.5 uppercase text-2xs tracking-wider">
                    Notes & Terms
                  </h4>
                  <p className="text-ink-muted leading-relaxed whitespace-pre-wrap italic">
                    {invoice.notes}
                  </p>
                </>
              )}
            </div>

            {/* Totals Box */}
            <div className="w-full sm:w-64 text-xs space-y-2.5 self-end">
              <div className="flex justify-between text-ink-muted border-b border-hairline/60 pb-2">
                <span>Subtotal</span>
                <span className="font-semibold">{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-ink">
                <span>Total Due</span>
                <span className="text-base text-primary">{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Helper Sidebar */}
        <div className="space-y-4">
          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Payment & Linking
            </h3>
            <p className="text-xs text-ink-muted leading-normal">
              When you mark this invoice as **Paid**, an automatic **Income record** will be generated and logged to your dashboard for this client/project.
            </p>
          </div>

          <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider mb-3">
              Share Invoice
            </h3>
            <p className="text-xs text-ink-muted leading-normal mb-3">
              Copy the shareable link to send a read-only invoice statement to your client. They can view and print it directly.
            </p>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full h-9 border-hairline hover:bg-canvas-soft text-xs gap-1.5 font-medium"
            >
              <Copy className="h-3.5 w-3.5" />
              Copy Shareable Link
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-destructive/10 text-destructive">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-ink">Delete Invoice</h3>
                <p className="text-sm text-ink-muted mt-2 leading-relaxed">
                  Are you sure you want to delete invoice **{invoice.invoiceNumber}**?
                  This action is soft-deleted and can be undone, but will remove it from outstanding totals.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
                className="h-9"
              >
                {isDeleting ? "Deleting..." : "Delete Invoice"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
