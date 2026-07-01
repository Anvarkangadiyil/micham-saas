import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata = {
  title: "Register - Freelancer Finance SaaS",
  description: "Create an account to start tracking your freelance finances.",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 dark:bg-slate-950 px-4 py-12 sm:px-6 lg:px-8">
      <RegisterForm />
    </div>
  );
}
