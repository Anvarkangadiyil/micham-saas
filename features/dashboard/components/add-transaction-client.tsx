"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { IncomeForm } from "@/features/income/components/income-form";

interface ClientOption {
  _id: string;
  name: string;
}

interface ProjectOption {
  _id: string;
  clientId: string;
  name: string;
  status: string;
}

interface AddTransactionClientProps {
  clients: ClientOption[];
  projects: ProjectOption[];
  currencySymbol: string;
}

export function AddTransactionClient({
  clients,
  projects,
  currencySymbol,
}: AddTransactionClientProps) {
  const router = useRouter();
  const [activeFormTab, setActiveFormTab] = useState<"expense" | "income">("expense");

  const handleSuccess = () => {
    router.push("/");
    router.refresh();
  };

  const handleCancel = () => {
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors mb-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="text-heading-2 font-bold tracking-tight text-ink">New Transaction</h1>
          <p className="text-body-sm text-ink-muted">
            Record a new expense outflow or income inflow.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-md border border-hairline bg-canvas-soft p-0.5 text-xs self-start sm:self-auto shadow-xs">
          <button
            type="button"
            onClick={() => setActiveFormTab("expense")}
            className={`rounded px-4 py-1.5 font-bold transition-all ${
              activeFormTab === "expense"
                ? "bg-primary text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Log Expense
          </button>
          <button
            type="button"
            onClick={() => setActiveFormTab("income")}
            className={`rounded px-4 py-1.5 font-bold transition-all ${
              activeFormTab === "income"
                ? "bg-primary text-white shadow-sm"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            Log Income
          </button>
        </div>
      </div>

      {/* Form Card */}
      <div className="rounded-lg border border-hairline bg-surface p-6 shadow-elevation-1 max-w-xl mx-auto">
        <div className="border-b border-hairline pb-3 mb-6">
          <h2 className="text-sm font-semibold text-ink">
            {activeFormTab === "expense" ? "Expense Details" : "Income Details"}
          </h2>
          <p className="text-3xs text-ink-muted mt-0.5 font-medium">
            {activeFormTab === "expense"
              ? "Attach receipts and categorize business expense outflows."
              : "Track incoming freelancer revenue, linked projects, and payments."}
          </p>
        </div>

        {activeFormTab === "expense" ? (
          <ExpenseForm
            clients={clients}
            projects={projects}
            currencySymbol={currencySymbol}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        ) : (
          <IncomeForm
            clients={clients}
            projects={projects}
            currencySymbol={currencySymbol}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
