import { LoginForm } from "@/features/auth/components/login-form";
import Image from "next/image";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "Login - Micham",
  description: "Sign in to manage your income, expenses, and invoices with Micham.",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-canvas-soft">
      {/* Left Side: Indigo Panel (Hidden on mobile) */}
      <div className="hidden md:flex md:w-[40%] lg:w-[42%] bg-[#213183] text-white flex-col justify-between p-8 lg:p-12 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#3145a3_1px,transparent_1px),linear-gradient(to_bottom,#3145a3_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none" />
        
        {/* Logo/Header */}
        <div className="flex items-center gap-2 z-10">
          <div className="h-6 w-6 rounded bg-[#0075de]" />
          <span className="font-bold tracking-tight text-sm uppercase">Micham</span>
        </div>

        {/* Constellation Illustration Wrapper */}
        <div className="flex flex-col items-center justify-center flex-1 my-8 z-10">
          <div className="relative w-60 h-60 lg:w-64 lg:h-64 rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-xs flex items-center justify-center shadow-lg group hover:scale-[1.02] transition-transform duration-300">
            {/* Ambient light glow */}
            <div className="absolute -inset-0.5 bg-[#0075de]/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#213183]/50">
              <Image
               src={'/auth_illust.jpg'}
                width={500}
                height={500}
                alt="Freelancer Constellation Sticker Illustration"
              />
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="z-10">
          <p className="text-base font-semibold leading-snug">
            "Meet the night shift for your business bookkeeping."
          </p>
          <p className="text-3xs text-[#a39e98] mt-2 font-medium">
            Designed for solo creative operators who want to understand where their cash goes.
          </p>
        </div>
      </div>

      {/* Right Side: Off-white Daylight Form Panel */}
      <div className="w-full md:w-[60%] lg:w-[58%] flex items-center justify-center p-6 sm:p-12 relative">
        {/* Decorative corner accent dot */}
        <div className="absolute top-12 right-12 text-ink-muted text-xs font-mono select-none hidden sm:block">
          v1.0.0
        </div>
        <div className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-2xs text-ink-muted">Loading credentials...</p>
            </div>
          }>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
