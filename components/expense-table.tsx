"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { Pencil, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { getExpenses, updateExpense, deleteExpense } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string | Date;
};

type ExpenseTableProps = {
  categories?: string[];
  refreshKey?: number;
  onSuccess?: () => void;
};

const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Other",
];

function formatDate(value: string | Date) {
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(parsed);
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function ExpenseTable({
  categories = DEFAULT_CATEGORIES,
  refreshKey = 0,
  onSuccess,
}: ExpenseTableProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Edit State
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editValues, setEditValues] = useState({
    amount: "",
    category: "",
    description: "",
    date: "",
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete State
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false);

  useEffect(() => {
    let isActive = true;
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 15000);

    async function loadExpenses() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getExpenses<Expense[]>(
          {
            category: selectedCategory === "all" ? undefined : selectedCategory,
            sort: "date_desc",
          },
          {
            signal: abortController.signal,
          }
        );

        if (!isActive) return;
        setExpenses(Array.isArray(data) ? data : []);
      } catch (loadError) {
        if (!isActive) return;
        if (
          loadError instanceof Error &&
          loadError.name === "AbortError"
        ) {
          setError("Request timed out on a slow network. Please retry.");
          setExpenses([]);
          return;
        }
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Failed to load expenses. Please try again.";
        setError(message);
        setExpenses([]);
      } finally {
        clearTimeout(timeoutId);
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadExpenses();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
      abortController.abort();
    };
  }, [selectedCategory, refreshKey, retryCount]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((left, right) => {
      const leftDate = new Date(left.date).getTime();
      const rightDate = new Date(right.date).getTime();
      return rightDate - leftDate;
    });
  }, [expenses]);

  const totalVisibleAmount = useMemo(() => {
    return sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [sortedExpenses]);

  // Handle Edit Click
  const handleEditClick = (expense: Expense) => {
    const formattedDate = expense.date instanceof Date 
      ? expense.date.toISOString().split("T")[0]
      : new Date(expense.date).toISOString().split("T")[0];
    
    setEditingExpense(expense);
    setEditValues({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description,
      date: formattedDate,
    });
    setEditError(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingExpense) return;

    setEditError(null);
    const parsedAmount = Number(editValues.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      setEditError("Please enter a valid non-negative amount.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateExpense(editingExpense.id, {
        amount: parsedAmount,
        category: editValues.category.trim(),
        description: editValues.description.trim(),
        date: editValues.date,
      });

      toast.success("Expense updated successfully");
      setEditingExpense(null);
      onSuccess?.();
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : "Failed to update expense. Please try again.";
      setEditError(message);
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Handle Delete Click
  const handleDeleteClick = (expense: Expense) => {
    setDeletingExpense(expense);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deletingExpense) return;

    setIsSubmittingDelete(true);
    try {
      await deleteExpense(deletingExpense.id);
      toast.success("Expense deleted successfully");
      setDeletingExpense(null);
      onSuccess?.();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete expense. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmittingDelete(false);
    }
  };

  return (
    <section className="space-y-4 rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Expenses</h2>
        <select
          aria-label="Filter expenses by category"
          value={selectedCategory}
          onChange={(event) => setSelectedCategory(event.target.value)}
          className="flex h-10 min-w-44 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm font-medium text-foreground border p-2 rounded-md bg-slate-50/50 dark:bg-slate-900/50">
        Total: {formatAmount(totalVisibleAmount)}
      </p>

      {error ? (
        <div
          className="flex flex-col gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4"
          role="alert"
        >
          <p className="text-sm font-medium text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => setRetryCount((previous) => previous + 1)}
            className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-md border p-6 text-sm text-muted-foreground">
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground"
            aria-hidden="true"
          />
          <span>Loading expenses... This may take longer on slow networks.</span>
        </div>
      ) : sortedExpenses.length === 0 ? (
        <div className="rounded-md border p-6 text-sm text-muted-foreground">
          No expenses found.
        </div>
      ) : (
        <Table aria-label="Expense table" className="border">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="w-[140px]">Date</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="font-medium">
                  {formatAmount(expense.amount)}
                </TableCell>
                <TableCell>{expense.category}</TableCell>
                <TableCell>{expense.description}</TableCell>
                <TableCell>{formatDate(expense.date)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleEditClick(expense)}
                      aria-label={`Edit expense: ${expense.description}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteClick(expense)}
                      aria-label={`Delete expense: ${expense.description}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Modal */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Expense</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setEditingExpense(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="edit-amount" className="text-sm font-medium leading-none">
                  Amount
                </label>
                <input
                  id="edit-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  required
                  value={editValues.amount}
                  onChange={(e) => setEditValues(prev => ({ ...prev, amount: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-category" className="text-sm font-medium leading-none">
                  Category
                </label>
                <select
                  id="edit-category"
                  required
                  value={editValues.category}
                  onChange={(e) => setEditValues(prev => ({ ...prev, category: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-description" className="text-sm font-medium leading-none">
                  Description
                </label>
                <input
                  id="edit-description"
                  type="text"
                  required
                  maxLength={200}
                  value={editValues.description}
                  onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-date" className="text-sm font-medium leading-none">
                  Date
                </label>
                <input
                  id="edit-date"
                  type="date"
                  required
                  value={editValues.date}
                  onChange={(e) => setEditValues(prev => ({ ...prev, date: e.target.value }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              {editError && (
                <p className="text-sm font-medium text-destructive" role="alert">
                  {editError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingExpense(null)}
                  disabled={isSubmittingEdit}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingEdit || !editValues.amount || !editValues.category || !editValues.description || !editValues.date}
                >
                  {isSubmittingEdit ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 text-card-foreground shadow-lg animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Delete Expense</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Are you sure you want to delete the expense for{" "}
                  <span className="font-semibold text-foreground">
                    {deletingExpense.description}
                  </span>{" "}
                  of <span className="font-semibold text-foreground">{formatAmount(deletingExpense.amount)}</span>?
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setDeletingExpense(null)}
                disabled={isSubmittingDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isSubmittingDelete}
              >
                {isSubmittingDelete ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
