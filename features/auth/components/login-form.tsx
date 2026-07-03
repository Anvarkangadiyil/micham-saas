"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schemas";
import { loginUser } from "../actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setGlobalError(null);
    try {
      const result = await loginUser(data);
      if (result && !result.success) {
        setGlobalError(result.error || "Invalid email or password.");
        toast.error(result.error || "Invalid email or password.");
      } else {
        toast.success("Welcome back! Logging you in...");
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
        return;
      }
      setGlobalError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-sm space-y-6 rounded-lg border border-hairline bg-surface p-8 shadow-elevation-1">
      <div className="flex flex-col items-center space-y-2 text-center">
        {/* Mini illustration on mobile screens */}
        <div className="block md:hidden relative w-16 h-16 rounded-xl border border-hairline overflow-hidden mb-2 shadow-xs bg-[#213183]">
          <img
            src="/auth_illust.jpg"
            alt="Freelancer Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="text-xs text-ink-muted">
          Sign in to access your freelance finance dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {globalError && (
          <div className="rounded-md bg-destructive/10 p-3 text-xs font-medium text-destructive">
            {globalError}
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-bold text-ink-secondary"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              {...register("email")}
              id="email"
              type="email"
              autoComplete="email"
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-surface pr-3 pl-9 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && (
            <p className="text-xs font-medium text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="text-xs font-bold text-ink-secondary"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint" />
            <input
              {...register("password")}
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isSubmitting}
              className="flex h-10 w-full rounded-md border border-input bg-surface pr-9 pl-9 py-2 text-sm placeholder:text-ink-faint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-ink-muted hover:text-ink focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs font-medium text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white hover:bg-primary-active disabled:opacity-50 h-10 font-bold"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="text-center text-xs text-ink-muted">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-bold text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
