"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  Calendar,
  Filter,
  Plus,
  Trash2,
  Pencil,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Download,
  FileJson,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import { ExpenseForm } from "@/features/expenses/components/expense-form";
import { IncomeForm } from "@/features/income/components/income-form";
import { deleteExpense } from "@/features/expenses/actions";
import { deleteIncome } from "@/features/income/actions";
import { Button } from "@/components/ui/button";

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

interface Transaction {
  _id: string;
  type: "income" | "expense";
  amount: number;
  date: string;
  sourceOrVendor: string;
  categoryOrSource: string;
  clientId?: { _id: string; name: string };
  projectId?: { _id: string; name: string };
  notes?: string;
  receiptUrl?: string;
}

interface DashboardClientProps {
  initialIncomes: any[];
  initialExpenses: any[];
  clients: ClientOption[];
  projects: ProjectOption[];
  hasInvoices?: boolean;
  currencySymbol?: string;
}

export function DashboardClient({
  initialIncomes,
  initialExpenses,
  clients,
  projects,
  hasInvoices = false,
  currencySymbol = "$",
}: DashboardClientProps) {
  const router = useRouter();
  
  // Mounted check for Recharts hydration safety
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(false);
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Form tab: 'expense' or 'income'
  const [activeFormTab, setActiveFormTab] = useState<"expense" | "income">("expense");

  // Filter states
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterDate, setFilterDate] = useState<
    "month" | "30days" | "year" | "last-year" | "fiscal" | "last-fiscal" | "all"
  >("month");
  const [filterClientId, setFilterClientId] = useState<string>("");

  // Edit modals state
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [editingIncome, setEditingIncome] = useState<any | null>(null);

  // Delete state
  const [deletingTx, setDeletingTx] = useState<{ id: string; type: "income" | "expense" } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Group incomes and expenses into a unified transaction list
  const allTransactions = useMemo(() => {
    const txs: Transaction[] = [];

    initialIncomes.forEach((inc) => {
      txs.push({
        _id: inc._id,
        type: "income",
        amount: inc.amount,
        date: inc.date,
        sourceOrVendor: inc.source,
        categoryOrSource: "Income",
        clientId: inc.clientId,
        projectId: inc.projectId,
        notes: inc.notes,
      });
    });

    initialExpenses.forEach((exp) => {
      txs.push({
        _id: exp._id,
        type: "expense",
        amount: exp.amount,
        date: exp.date,
        sourceOrVendor: exp.description,
        categoryOrSource: exp.category,
        clientId: exp.clientId,
        projectId: exp.projectId,
        notes: exp.notes,
        receiptUrl: exp.receiptUrl,
      });
    });

    // Sort by date descending
    return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [initialIncomes, initialExpenses]);

  // Compute stats for the current month
  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const isCurrentMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    };

    const monthlyIncome = initialIncomes
      .filter((inc) => isCurrentMonth(inc.date))
      .reduce((sum, inc) => sum + inc.amount, 0);

    const monthlyExpense = initialExpenses
      .filter((exp) => isCurrentMonth(exp.date))
      .reduce((sum, exp) => sum + exp.amount, 0);

    return {
      income: monthlyIncome,
      expenses: monthlyExpense,
      net: monthlyIncome - monthlyExpense,
    };
  }, [initialIncomes, initialExpenses]);

  // Compute 6-month chart data
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const monthKey = `${year}-${String(d.getMonth() + 1).padStart(2, "0")}`; // YYYY-MM

      const mIncome = initialIncomes
        .filter((inc) => inc.date.startsWith(monthKey))
        .reduce((sum, inc) => sum + inc.amount, 0);

      const mExpense = initialExpenses
        .filter((exp) => exp.date.startsWith(monthKey))
        .reduce((sum, exp) => sum + exp.amount, 0);

      data.push({
        name: monthName,
        Income: mIncome,
        Expenses: mExpense,
      });
    }

    return data;
  }, [initialIncomes, initialExpenses]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((tx) => {
      // Type Filter
      if (filterType === "income" && tx.type !== "income") return false;
      if (filterType === "expense" && tx.type !== "expense") return false;

      // Client Filter
      if (filterClientId && (!tx.clientId || tx.clientId._id !== filterClientId)) return false;

      // Date Filter
      const txDate = new Date(tx.date);
      const now = new Date();
      const currentYear = now.getFullYear();
      if (filterDate === "month") {
        if (txDate.getFullYear() !== now.getFullYear() || txDate.getMonth() !== now.getMonth()) return false;
      } else if (filterDate === "30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        if (txDate < thirtyDaysAgo) return false;
      } else if (filterDate === "year") {
        if (txDate.getFullYear() !== now.getFullYear()) return false;
      } else if (filterDate === "last-year") {
        if (txDate.getFullYear() !== now.getFullYear() - 1) return false;
      } else if (filterDate === "fiscal") {
        // Fiscal Year (Apr 1 - Mar 31)
        const fyStartYear = now.getMonth() < 3 ? currentYear - 1 : currentYear;
        const fyStartDate = new Date(fyStartYear, 3, 1);
        const fyEndDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
        if (txDate < fyStartDate || txDate > fyEndDate) return false;
      } else if (filterDate === "last-fiscal") {
        const fyStartYear = (now.getMonth() < 3 ? currentYear - 1 : currentYear) - 1;
        const fyStartDate = new Date(fyStartYear, 3, 1);
        const fyEndDate = new Date(fyStartYear + 1, 2, 31, 23, 59, 59);
        if (txDate < fyStartDate || txDate > fyEndDate) return false;
      }

      return true;
    });
  }, [allTransactions, filterType, filterDate, filterClientId]);

  // Delete transaction action
  const handleDeleteTx = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    try {
      const result =
        deletingTx.type === "expense"
          ? await deleteExpense(deletingTx.id)
          : await deleteIncome(deletingTx.id);

      if (result.success) {
        toast.success(result.message ?? "Transaction deleted successfully.");
        setDeletingTx(null);
        router.refresh();
      } else {
        toast.error(result.error ?? "Failed to delete transaction.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while deleting transaction.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Open appropriate form modal for editing
  const openEditModal = (tx: Transaction) => {
    if (tx.type === "expense") {
      const fullExpense = initialExpenses.find((e) => e._id === tx._id);
      setEditingExpense(fullExpense);
    } else {
      const fullIncome = initialIncomes.find((i) => i._id === tx._id);
      setEditingIncome(fullIncome);
    }
  };

  // CSV Export
  const exportToCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }

    const escapeCSV = (val: any) => {
      if (val === null || val === undefined) return "";
      const str = String(val);
      if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const headers = ["Type", "Date", "Amount", "Vendor / Source", "Category", "Client", "Project", "Notes"];
    const rows = filteredTransactions.map((tx) => [
      tx.type === "income" ? "Income" : "Expense",
      tx.date.substring(0, 10), // format YYYY-MM-DD
      tx.amount.toFixed(2),
      tx.sourceOrVendor,
      tx.categoryOrSource,
      tx.clientId ? tx.clientId.name : "",
      tx.projectId ? tx.projectId.name : "",
      tx.notes || "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const dateStr = new Date().toISOString().split("T")[0];
    const periodStr = filterDate === "all" ? "all_time" : filterDate;
    link.setAttribute("download", `freelancer_transactions_${periodStr}_${dateStr}.csv`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully.");
  };

  // JSON Export
  const exportToJSON = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export.");
      return;
    }

    const formattedData = filteredTransactions.map((tx) => ({
      id: tx._id,
      type: tx.type,
      date: tx.date.substring(0, 10),
      amount: tx.amount,
      vendorOrSource: tx.sourceOrVendor,
      category: tx.categoryOrSource,
      client: tx.clientId ? { id: tx.clientId._id, name: tx.clientId.name } : null,
      project: tx.projectId ? { id: tx.projectId._id, name: tx.projectId.name } : null,
      notes: tx.notes || null,
    }));

    const jsonContent = JSON.stringify(formattedData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);

    const dateStr = new Date().toISOString().split("T")[0];
    const periodStr = filterDate === "all" ? "all_time" : filterDate;
    link.setAttribute("download", `freelancer_transactions_${periodStr}_${dateStr}.json`);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("JSON export downloaded successfully.");
  };

  const hasClients = clients.length > 0;
  const hasTransactions = allTransactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-heading-2 font-bold tracking-tight text-ink">Dashboard</h1>
          <p className="text-body-sm text-ink-muted">
            Your financial breakdown at a glance.
          </p>
        </div>
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary-active self-start sm:self-auto gap-1.5 h-9"
        >
          <Link href="/transactions/create">
            <Plus className="h-4 w-4" />
            Add Transaction
          </Link>
        </Button>
      </div>

      {/* Onboarding Checklist */}
      {!hasClients || !hasTransactions || !hasInvoices ? (
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-ink">Getting Started Checklist</h2>
            <p className="text-3xs text-ink-muted mt-0.5 font-medium">Follow these simple steps to set up your account and track your freelance business.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 text-xs">
            {/* Step 1: Add a Client */}
            <div className={`flex items-start gap-2.5 p-3 rounded border ${hasClients ? "bg-success-bg/10 border-success/15 text-success" : "bg-canvas-soft border-hairline"}`}>
              <input
                type="checkbox"
                checked={hasClients}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none mt-0.5"
              />
              <div>
                <span className="font-semibold block">1. Add a Client</span>
                {hasClients ? (
                  <span className="text-3xs block mt-0.5">Completed!</span>
                ) : (
                  <Link href="/clients" className="text-3xs text-primary hover:underline block mt-0.5 font-semibold">
                    Go to Clients page &rarr;
                  </Link>
                )}
              </div>
            </div>

            {/* Step 2: Log a Transaction */}
            <div className={`flex items-start gap-2.5 p-3 rounded border ${hasTransactions ? "bg-success-bg/10 border-success/15 text-success" : "bg-canvas-soft border-hairline"}`}>
              <input
                type="checkbox"
                checked={hasTransactions}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none mt-0.5"
              />
              <div>
                <span className="font-semibold block">2. Log a Transaction</span>
                {hasTransactions ? (
                  <span className="text-3xs block mt-0.5">Completed!</span>
                ) : (
                  <span className="text-3xs text-ink-muted block mt-0.5 font-medium">
                    Use the Quick Add form below
                  </span>
                )}
              </div>
            </div>

            {/* Step 3: Create an Invoice */}
            <div className={`flex items-start gap-2.5 p-3 rounded border ${hasInvoices ? "bg-success-bg/10 border-success/15 text-success" : "bg-canvas-soft border-hairline"}`}>
              <input
                type="checkbox"
                checked={hasInvoices}
                readOnly
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary pointer-events-none mt-0.5"
              />
              <div>
                <span className="font-semibold block">3. Create an Invoice</span>
                {hasInvoices ? (
                  <span className="text-3xs block mt-0.5">Completed!</span>
                ) : (
                  <Link href="/invoices/create" className="text-3xs text-primary hover:underline block mt-0.5 font-semibold">
                    Go to Invoice builder &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Metrics Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Income Card */}
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>This Month Income</span>
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {currencySymbol}{stats.income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Expenses Card */}
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>This Month Expenses</span>
            <TrendingDown className="h-4 w-4 text-warning" />
          </div>
          <div className="mt-2 text-2xl font-bold text-ink">
            {currencySymbol}{stats.expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Net Profit Card */}
        <div className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1">
          <div className="flex items-center justify-between text-xs font-semibold text-ink-muted uppercase tracking-wider">
            <span>Net Profit</span>
            <CircleDollarSign className="h-4 w-4 text-primary" />
          </div>
          <div
            className={`mt-2 text-2xl font-bold ${
              stats.net >= 0 ? "text-primary" : "text-destructive"
            }`}
          >
            {stats.net < 0 && "-"}
            {currencySymbol}{Math.abs(stats.net).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Analytics Section (Full Width Chart) */}
      <div className="rounded-lg border border-hairline bg-surface p-6 shadow-elevation-1 flex flex-col justify-between min-h-[350px] w-full">
        <div>
          <h2 className="text-sm font-semibold text-ink mb-1">Income & Expenses</h2>
          <p className="text-2xs text-ink-muted mb-4">Last 6 months comparison</p>
        </div>
        <div className="h-[250px] w-full">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="name" stroke="#a39e98" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#a39e98" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e6e6e6",
                    borderRadius: "6px",
                    fontSize: "12px",
                    boxShadow: "0 4px 18px rgba(0,0,0,0.04)",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Income" fill="#0075de" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="Expenses" fill="#dd5b00" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-ink-muted">
              Loading analytics...
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="space-y-4">
        {/* Table Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-hairline pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-ink">Transactions</h2>
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={exportToCSV}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-hairline hover:bg-canvas-soft text-ink-secondary rounded-md"
                title="Export filtered transactions to CSV"
              >
                <Download className="h-3.5 w-3.5 text-ink-faint" />
                <span>Export CSV</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportToJSON}
                className="h-7 px-2.5 text-xs font-semibold gap-1.5 border-hairline hover:bg-canvas-soft text-ink-secondary rounded-md"
                title="Export filtered transactions to JSON"
              >
                <FileJson className="h-3.5 w-3.5 text-ink-faint" />
                <span>Export JSON</span>
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Type */}
            <div className="flex rounded-md border border-hairline bg-canvas-soft p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`rounded px-3 py-1 font-semibold transition-all ${
                  filterType === "all"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType("income")}
                className={`rounded px-3 py-1 font-semibold transition-all ${
                  filterType === "income"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Income
              </button>
              <button
                type="button"
                onClick={() => setFilterType("expense")}
                className={`rounded px-3 py-1 font-semibold transition-all ${
                  filterType === "expense"
                    ? "bg-primary text-white shadow-sm"
                    : "text-ink-muted hover:text-ink"
                }`}
              >
                Expenses
              </button>
            </div>

            {/* Filter Date */}
            <select
              value={filterDate}
              onChange={(e: any) => setFilterDate(e.target.value)}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-ink-faint focus:border-primary focus:outline-none transition-colors cursor-pointer"
            >
              <option value="month">This Month</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">This Calendar Year (Jan - Dec)</option>
              <option value="last-year">Last Calendar Year</option>
              <option value="fiscal">This Fiscal Year (Apr - Mar)</option>
              <option value="last-fiscal">Last Fiscal Year (Apr - Mar)</option>
              <option value="all">All Time</option>
            </select>

            {/* Filter Client */}
            <select
              value={filterClientId}
              onChange={(e) => setFilterClientId(e.target.value)}
              className="rounded-md border border-hairline bg-surface px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-ink-faint focus:border-primary focus:outline-none transition-colors cursor-pointer max-w-[150px]"
            >
              <option value="">All Clients</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        {filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-hairline bg-surface shadow-elevation-1">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-canvas-soft border-b border-hairline text-ink-muted font-medium text-2xs uppercase tracking-wider">
                  <th className="p-3 pl-4">Type</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Vendor / Source</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Linked Client/Project</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 pr-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-canvas-soft/20 transition-colors">
                    {/* Type Badge */}
                    <td className="p-3 pl-4">
                      {tx.type === "income" ? (
                        <span className="inline-flex items-center gap-1 rounded bg-success-bg border border-success/15 px-1.5 py-0.5 text-2xs font-semibold text-success">
                          <ArrowUpRight className="h-3 w-3" />
                          IN
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-orange-50 border border-orange-200 px-1.5 py-0.5 text-2xs font-semibold text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/30">
                          <ArrowDownRight className="h-3 w-3" />
                          OUT
                        </span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="p-3 text-ink-secondary whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    {/* Vendor / Source */}
                    <td className="p-3">
                      <div className="font-medium text-ink-secondary">{tx.sourceOrVendor}</div>
                      {tx.notes && <div className="text-3xs text-ink-muted truncate max-w-[150px]">{tx.notes}</div>}
                    </td>

                    {/* Category */}
                    <td className="p-3 text-ink-secondary capitalize">{tx.categoryOrSource}</td>

                    {/* Client / Project Link */}
                    <td className="p-3 text-ink-muted">
                      {tx.clientId ? (
                        <div>
                          <span className="text-ink-secondary">{tx.clientId.name}</span>
                          {tx.projectId && (
                            <span className="block text-3xs font-medium">/{tx.projectId.name}</span>
                          )}
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* Amount */}
                    <td
                      className={`p-3 text-right font-semibold ${
                        tx.type === "income" ? "text-success" : "text-ink"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "-"}{currencySymbol}{tx.amount.toFixed(2)}
                    </td>

                    {/* Actions */}
                    <td className="p-3 pr-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {tx.receiptUrl && (
                          <a
                            href={tx.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded border border-hairline bg-surface text-ink-muted hover:text-ink hover:bg-canvas-soft"
                            title="View Receipt"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => openEditModal(tx)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-hairline bg-surface text-ink-muted hover:text-ink hover:bg-canvas-soft"
                          title="Edit"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTx({ id: tx._id, type: tx.type })}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-hairline bg-surface text-ink-muted hover:text-destructive hover:bg-destructive/15"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-hairline bg-surface py-12 text-center">
            <p className="text-xs text-ink-muted">No transactions found for this period.</p>
          </div>
        )}
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Expense</h2>
              <p className="text-xs text-ink-muted mt-0.5">Update the expense record details.</p>
            </div>
            <ExpenseForm
              clients={clients}
              projects={projects}
              expense={editingExpense}
              currencySymbol={currencySymbol}
              onSuccess={() => {
                setEditingExpense(null);
                router.refresh();
              }}
              onCancel={() => setEditingExpense(null)}
            />
          </div>
        </div>
      )}

      {/* Edit Income Modal */}
      {editingIncome && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-ink">Edit Income</h2>
              <p className="text-xs text-ink-muted mt-0.5">Update the income record details.</p>
            </div>
            <IncomeForm
              clients={clients}
              projects={projects}
              income={editingIncome}
              currencySymbol={currencySymbol}
              onSuccess={() => {
                setEditingIncome(null);
                router.refresh();
              }}
              onCancel={() => setEditingIncome(null)}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-lg border border-hairline bg-surface p-6 shadow-elevation-2 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-semibold text-ink">Delete Transaction</h3>
            <p className="text-sm text-ink-muted mt-2">
              Are you sure you want to delete this {deletingTx.type === "expense" ? "expense" : "income"} record?
              This action can be undone.
            </p>
            <div className="flex items-center justify-end gap-2 mt-6">
              <Button
                variant="outline"
                disabled={isDeleting}
                onClick={() => setDeletingTx(null)}
                className="h-9 border-hairline hover:bg-canvas-soft hover:text-ink"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDeleteTx}
                className="h-9"
              >
                {isDeleting ? "Deleting..." : "Delete Record"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
