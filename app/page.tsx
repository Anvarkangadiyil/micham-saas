import React from "react";
import Link from "next/link";
import { 
  Wallet, 
  ArrowRight, 
  Check, 
  Users, 
  Receipt, 
  BarChart, 
  Shield, 
  Zap, 
  ChevronRight 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Micham - Simple Expense & Invoice Tracker for Freelancers",
  description: "Track your business expenses, manage client billing, and send professional invoices in seconds. The ultimate bookkeeping and invoicing SaaS designed specifically for freelancers, independent contractors, designers, and developers.",
  keywords: [
    "micham",
    "micham expense tracker",
    "invoice generator",
    "freelance invoicing",
    "independent contractor bookkeeping",
    "freelance tax helper",
    "client billing SaaS",
    "small business accounting software",
    "sole proprietor expense logs",
    "freelancer invoice template"
  ],
  openGraph: {
    title: "Micham - Simple Expense & Invoice Tracker for Freelancers",
    description: "Manage your business finances, track expenses, and invoice clients effortlessly with Micham.",
    type: "website",
    url: "https://micham.com",
  }
};

export default function LandingPage() {
  const features = [
    {
      icon: Receipt,
      title: "Smart Expense Logs",
      description: "Easily log and categorize your business expenses. Group by project, track categories, and keep audit-ready records.",
    },
    {
      icon: Users,
      title: "Client CRM & Profiles",
      description: "Keep all client info, company details, emails, and notes in one place. Streamline communication and project association.",
    },
    {
      icon: Wallet,
      title: "Professional Invoicing",
      description: "Draft and customize PDF-ready invoices, track unpaid balances, and manage payment statuses dynamically.",
    },
    {
      icon: BarChart,
      title: "Financial Analytics",
      description: "Monitor your net income, project revenues, and expense distributions using interactive charts and live dashboard summaries.",
    },
    {
      icon: Shield,
      title: "Tax Preparedness",
      description: "Generate clean CSV/JSON exports and filter reports by fiscal year to hand over directly to your accountant.",
    },
    {
      icon: Zap,
      title: "Lightning Fast Workflow",
      description: "Create clients, log transactions, and issue invoices in seconds. Built on modern web architecture for instant reactivity.",
    },
  ];

  const faqs = [
    {
      q: "Do I need a credit card to sign up?",
      a: "No. You can sign up and use our Starter plan completely free of charge with no credit card required.",
    },
    {
      q: "Can I export my financial data?",
      a: "Yes. In the settings and dashboard area, you can easily export all your client details, invoice registries, and expense spreadsheets.",
    },
    {
      q: "Is my financial data secure?",
      a: "Absolutely. All transactions are securely stored using MongoDB with top-tier database encryption and industry-standard Auth.js credential safeguards.",
    },
    {
      q: "Can I customize the billing currency?",
      a: "Yes, you can set your default currency symbol (e.g. $, €, £, ¥) inside your settings dashboard, and it will update all dashboard stats and invoice templates instantly.",
    },
  ];

  return (
    <div className="min-h-screen bg-canvas-soft text-ink-secondary flex flex-col font-sans antialiased Selection:bg-primary/20 Selection:text-primary">
      {/* ========================================================================= */}
      {/* HEADER SECTION                                                            */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-semibold text-ink">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/10">
              <Wallet className="h-5 w-5" />
            </div>
            <span className="tracking-tight text-lg font-bold">Micham</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-ink-muted">
            <a href="#features" className="hover:text-ink transition-colors">Features</a>
            <a href="#demo" className="hover:text-ink transition-colors">App Preview</a>
            <a href="#faq" className="hover:text-ink transition-colors">FAQ</a>
          </nav>

          {/* Auth CTA Actions */}
          <div className="flex items-center gap-2">
            <Link href="/login?demo=true">
              <Button variant="outline" size="sm" className="font-semibold text-primary border-primary/20 hover:border-primary hover:bg-primary/5 rounded-md hidden sm:inline-flex">
                Try Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-semibold text-ink-muted hover:text-ink hover:bg-canvas-soft rounded-md">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="font-semibold rounded-md shadow-sm shadow-primary/10">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="relative py-20 overflow-hidden lg:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Col: Hero Copy */}
            <div className="space-y-6 lg:col-span-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-semibold">
                <Zap className="h-3 w-3" />
                <span>Modern SaaS Bookkeeping</span>
              </div>
              
              <h1 className="text-display-2 sm:text-heading-1 font-bold text-ink leading-tight tracking-tight">
                Freelancing is hard.<br />
                <span className="text-primary bg-gradient-to-r from-primary to-[#62aef0] bg-clip-text text-transparent">
                  Your finances shouldn't be.
                </span>
              </h1>
              
              <p className="text-body-md text-ink-muted leading-relaxed max-w-lg mx-auto lg:mx-0">
                Track your business expenses, store client databases, and draft custom invoices seamlessly. An all-in-one financial dashboard engineered exclusively for independent creators.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link href="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-11 px-6 font-semibold rounded-lg shadow-md shadow-primary/15 gap-2">
                    Start Tracking Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login?demo=true" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto h-11 px-6 font-semibold border-border hover:bg-surface text-ink-secondary rounded-lg">
                    Demo Account Access
                  </Button>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-hairline/60 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-ink-faint">
                <div className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>Interactive charts</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  <span>Instant invoice downloads</span>
                </div>
              </div>
            </div>

            {/* Right Col: Graphic Dashboard Mockup */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-xl border border-hairline bg-surface p-6 shadow-elevation-2 select-none animate-in fade-in-50 slide-in-from-bottom-6 duration-700">
                {/* Mock Header */}
                <div className="flex items-center justify-between border-b border-hairline pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-yellow-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                  </div>
                  <div className="h-4.5 w-32 rounded bg-canvas-soft" />
                </div>

                {/* Mock Dashboard Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border border-hairline p-3 space-y-1 bg-canvas-soft/30">
                      <div className="text-[10px] text-ink-faint uppercase font-bold tracking-wider">Total Income</div>
                      <div className="text-lg font-bold text-success">$8,450.00</div>
                    </div>
                    <div className="rounded-lg border border-hairline p-3 space-y-1 bg-canvas-soft/30">
                      <div className="text-[10px] text-ink-faint uppercase font-bold tracking-wider">Total Expenses</div>
                      <div className="text-lg font-bold text-destructive">$1,890.00</div>
                    </div>
                  </div>

                  {/* Mock Chart Area */}
                  <div className="rounded-lg border border-hairline p-4 h-36 flex flex-col justify-end bg-gradient-to-t from-canvas-soft/10 to-surface">
                    <div className="flex items-end justify-between h-full gap-2 pt-4">
                      <div className="w-full bg-primary/10 hover:bg-primary/20 rounded-t h-[40%] transition-all" />
                      <div className="w-full bg-primary/10 hover:bg-primary/20 rounded-t h-[55%] transition-all" />
                      <div className="w-full bg-primary/10 hover:bg-primary/20 rounded-t h-[35%] transition-all" />
                      <div className="w-full bg-primary/80 hover:bg-primary rounded-t h-[80%] transition-all shadow-sm shadow-primary/25" />
                      <div className="w-full bg-primary/20 hover:bg-primary/30 rounded-t h-[65%] transition-all" />
                    </div>
                    <div className="flex justify-between text-[9px] text-ink-faint mt-2 border-t border-hairline pt-1">
                      <span>Feb</span>
                      <span>Mar</span>
                      <span>Apr</span>
                      <span>May</span>
                      <span>Jun</span>
                    </div>
                  </div>

                  {/* Mock Invoice Row */}
                  <div className="rounded-lg border border-hairline p-3 flex items-center justify-between text-xs bg-canvas-soft/10">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold">
                        INV
                      </div>
                      <div>
                        <div className="font-semibold text-ink-secondary">Invoice #INV-2026-004</div>
                        <div className="text-[10px] text-ink-faint">Acme Corporation</div>
                      </div>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full bg-success-bg text-success text-[10px] font-bold">
                      Paid
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FEATURES SECTION                                                          */}
      {/* ========================================================================= */}
      <section id="features" className="py-20 bg-surface border-y border-hairline">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-heading-2 font-bold text-ink tracking-tight">
              A Custom Financial Toolkit Built For You
            </h2>
            <p className="text-body-sm text-ink-muted">
              Stop juggling complicated generic accounting software. Micham focuses on what matters: tracking cashflow, billing clients, and keeping your taxes simple.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="rounded-xl border border-hairline bg-canvas-soft/20 p-6 space-y-4 hover:bg-canvas-soft/40 transition-colors shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-ink-secondary">{feature.title}</h3>
                <p className="text-caption text-ink-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* INTERACTIVE DEMO ACCORDION / PREVIEW SECTION                             */}
      {/* ========================================================================= */}
      <section id="demo" className="py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-heading-2 font-bold text-ink tracking-tight">
              Explore the Dashboard Preview
            </h2>
            <p className="text-body-sm text-ink-muted">
              Here is how your business operations align. Switch layout screens dynamically and keep invoicing and billing details in check.
            </p>
          </div>

          <div className="rounded-xl border border-hairline overflow-hidden shadow-elevation-2 bg-surface">
            {/* App Nav Shell */}
            <div className="bg-canvas-soft/40 border-b border-hairline px-4 py-2 flex items-center justify-between text-xs text-ink-faint">
              <span className="font-semibold text-[11px]">app.micham.com/dashboard</span>
              <div className="h-2 w-2 rounded-full bg-primary/40" />
            </div>
            <div className="p-4 sm:p-8 bg-surface">
              <div className="grid gap-6 md:grid-cols-2 text-left">
                <div className="space-y-4">
                  <h3 className="text-base font-bold text-ink">Simple client profile association</h3>
                  <p className="text-caption text-ink-muted leading-relaxed">
                    Create clients with details like email, physical address, and custom notes. Associates with invoices automatically, keeping calculations exact and payments transparent.
                  </p>
                  <ul className="space-y-2 text-xs text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Clients record lookup and CRM logging</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Associated projects progress indicators</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-success" />
                      <span>Instant PDF billing invoice rendering</span>
                    </li>
                  </ul>
                </div>
                <div className="rounded-lg border border-hairline p-5 bg-canvas-soft/30 space-y-4">
                  <div className="h-4 w-28 rounded bg-primary/10" />
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-hairline rounded animate-pulse" />
                    <div className="h-3 w-4/5 bg-hairline rounded animate-pulse" />
                  </div>
                  <div className="border-t border-hairline pt-3 flex items-center justify-between text-xs text-ink-muted">
                    <span>Invoice Limit</span>
                    <span className="font-bold text-ink">Unlimited</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FAQ SECTION                                                               */}
      {/* ========================================================================= */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-heading-2 font-bold text-ink tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-body-sm text-ink-muted">
              Have questions about Micham? Here are answers to common queries.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details 
                key={i} 
                className="group border border-hairline rounded-lg bg-surface [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex items-center justify-between p-4 text-sm font-semibold text-ink hover:bg-canvas-soft/10 cursor-pointer select-none">
                  <span>{faq.q}</span>
                  <ChevronRight className="h-4 w-4 text-ink-muted group-open:rotate-90 transition-transform" />
                </summary>
                <div className="p-4 pt-0 border-t border-hairline/40 text-caption text-ink-muted leading-relaxed">
                  <p>{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA SECTION                                                         */}
      {/* ========================================================================= */}
      <section className="py-16 bg-gradient-to-b from-canvas-soft to-surface border-t border-hairline text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-heading-2 sm:text-heading-1 font-bold text-ink tracking-tight leading-tight">
            Ready to track your business correctly?
          </h2>
          <p className="text-body-sm text-ink-muted max-w-md mx-auto">
            Join independent designers, writers, developers, and consultants who manage client billings with Micham.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button className="h-11 px-8 font-semibold rounded-lg shadow-md shadow-primary/15 gap-2">
                Create Your Free Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FOOTER SECTION                                                            */}
      {/* ========================================================================= */}
      <footer className="bg-surface border-t border-hairline py-12 text-center text-xs text-ink-faint">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-center gap-2 font-semibold text-ink">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white">
              <Wallet className="h-3.5 w-3.5" />
            </div>
            <span className="tracking-tight font-bold">Micham</span>
          </div>
          <div className="flex justify-center gap-6 text-ink-muted">
            <a href="#features" className="hover:text-ink">Features</a>
            <a href="/login" className="hover:text-ink">Sign In</a>
            <a href="/register" className="hover:text-ink">Register</a>
          </div>
          <p className="pt-4 border-t border-hairline/40">
            &copy; {new Date().getFullYear()} Micham SaaS. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
