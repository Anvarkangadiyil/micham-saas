import { redirect } from "next/navigation";
import { auth } from "@/auth";

import { TransactionsClient } from "@/features/transactions/components/transactions-client";
import { getIncomes } from "@/features/income/actions";
import { getExpenses } from "@/features/expenses/actions";
import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { getUserSettings } from "@/features/auth/actions";

export const metadata = {
  title: "Transactions Ledger - Micham",
  description: "View, filter, and export all business income and expenses",
};

export default async function TransactionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all user data in parallel
  const [incomesRes, expensesRes, clientsRes, projectsRes, settingsRes] = await Promise.all([
    getIncomes(),
    getExpenses(),
    getClients(),
    getProjects(),
    getUserSettings(),
  ]);

  const incomes = incomesRes.success && incomesRes.data ? incomesRes.data : [];
  const expenses = expensesRes.success && expensesRes.data ? expensesRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];
  const currencySymbol = settingsRes.success && settingsRes.data?.currencySymbol ? settingsRes.data.currencySymbol : "$";

  return (
    <TransactionsClient
      initialIncomes={incomes}
      initialExpenses={expenses}
      clients={clients}
      projects={projects}
      currencySymbol={currencySymbol}
    />
  );
}
