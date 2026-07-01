import { LoginForm } from "@/features/auth/components/login-form";

export const metadata = {
  title: "Login - Freelancer Finance SaaS",
  description: "Sign in to manage your freelance income, expenses, and invoices.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
