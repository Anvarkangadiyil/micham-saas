import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Header } from "@/components/header";
import { getClients } from "@/features/clients/actions";
import { ClientList } from "@/features/clients/components/client-list";

export const metadata = {
  title: "Clients - Freelancer Finance",
  description: "Manage your client profiles",
};

export default async function ClientsPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const result = await getClients();
  const clients = result.success && result.data ? result.data : [];

  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      <Header user={session.user} />
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {result.success ? (
          <ClientList clients={clients} />
        ) : (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm font-medium text-destructive">
            {result.error ?? "Failed to load clients. Please reload the page."}
          </div>
        )}
      </main>
    </div>
  );
}
