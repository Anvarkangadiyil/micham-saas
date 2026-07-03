import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { DashboardClient } from "@/features/dashboard/components/dashboard-client";
import { getIncomes } from "@/features/income/actions";
import { getExpenses } from "@/features/expenses/actions";
import { getClients } from "@/features/clients/actions";
import { getProjects } from "@/features/projects/actions";
import { getInvoices } from "@/features/invoices/actions";
import { getUserSettings } from "@/features/auth/actions";

export const metadata = {
  title: "Dashboard - Freelancer Finance",
  description: "Track and manage your business income and expenses",
};

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch all user data in parallel using Server Actions
  const [incomesRes, expensesRes, clientsRes, projectsRes, invoicesRes, settingsRes] = await Promise.all([
    getIncomes(),
    getExpenses(),
    getClients(),
    getProjects(),
    getInvoices(),
    getUserSettings(),
  ]);

  const incomes = incomesRes.success && incomesRes.data ? incomesRes.data : [];
  const expenses = expensesRes.success && expensesRes.data ? expensesRes.data : [];
  const clients = clientsRes.success && clientsRes.data ? clientsRes.data : [];
  const projects = projectsRes.success && projectsRes.data ? projectsRes.data : [];
  const invoices = invoicesRes.success && invoicesRes.data ? invoicesRes.data : [];
  const currencySymbol = settingsRes.success && settingsRes.data?.currencySymbol ? settingsRes.data.currencySymbol : "$";

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      <Header user={session.user} />
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <DashboardClient
          initialIncomes={incomes}
          initialExpenses={expenses}
          clients={clients}
          projects={projects}
          hasInvoices={invoices.length > 0}
          currencySymbol={currencySymbol}
        />
      </main>
    </div>
  );
}
