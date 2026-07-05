"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Wallet, 
  CircleDollarSign,
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/features/auth/actions";

interface AppLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  maxWidth?: string; // e.g. "max-w-5xl" or "max-w-xl"
}

export function AppLayout({ children, user, maxWidth = "max-w-5xl" }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Sidebar state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Close mobile sidebar on page navigation
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: CircleDollarSign },
    { href: "/clients", label: "Clients", icon: Users },
    { href: "/invoices", label: "Invoices", icon: FileText },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  // Helper to determine if a route is active
  const isLinkActive = (href: string) => {
    if (href === "/dashboard") {
      return (
        pathname === "/" ||
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/")
      );
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Get user initials for avatar fallback
  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials();

  return (
    <div className="flex min-h-screen w-full bg-canvas-soft">
      {/* ========================================================================= */}
      {/* MOBILE DRAWER BACKDROP                                                    */}
      {/* ========================================================================= */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity duration-300 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* SIDEBAR COMPONENT                                                         */}
      {/* ========================================================================= */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-surface border-r border-hairline transition-all duration-300 ease-in-out md:z-30",
          // Mobile state
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop state (collapsed vs expanded)
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Brand header */}
        <div className="flex h-14 items-center justify-between border-b border-hairline px-4">
          <Link href="/" className="flex items-center gap-2.5 font-semibold text-ink">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <span 
              className={cn(
                "font-semibold tracking-tight text-base transition-all duration-300 whitespace-nowrap overflow-hidden",
                isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
              )}
            >
              Micham
            </span>
          </Link>
          
          {/* Mobile close button */}
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-1 text-ink-muted hover:text-ink hover:bg-canvas-soft rounded-md md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = isLinkActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                title={isCollapsed ? link.label : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 group",
                  isActive
                    ? "bg-primary text-white font-medium shadow-sm shadow-primary/10"
                    : "text-ink-muted hover:bg-canvas-soft hover:text-ink"
                )}
              >
                <link.icon className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  isActive ? "text-white" : "text-ink-muted group-hover:text-ink"
                )} />
                <span
                  className={cn(
                    "transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isCollapsed ? "w-0 opacity-0 md:group-hover:opacity-100 md:group-hover:w-auto" : "w-auto opacity-100"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="hidden md:block border-t border-hairline p-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex h-9 w-full items-center justify-center rounded-md text-ink-muted hover:text-ink hover:bg-canvas-soft transition-colors"
            title={isCollapsed ? "Expand Menu" : "Collapse Menu"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <ChevronLeft className="h-4 w-4" />
                <span>Collapse</span>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN WRAPPER CONTAINER                                                    */}
      {/* ========================================================================= */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ease-in-out",
          // Desktop sidebar margin spacing
          isCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        {/* ========================================================================= */}
        {/* TOP NAVBAR                                                                */}
        {/* ========================================================================= */}
        <header className="sticky top-0 z-20 flex h-14 w-full items-center justify-between border-b border-hairline bg-surface/85 backdrop-blur-md px-4 sm:px-6 lg:px-8">
          {/* Left side: Hamburger (mobile only) & Brand Indicator */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 -ml-1 text-ink-muted hover:text-ink hover:bg-canvas-soft rounded-md md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:block">
              {/* Optional: Page title or breadcrumbs could go here */}
            </div>
            <div className="md:hidden flex items-center gap-1.5 font-semibold text-ink text-sm">
              <Wallet className="h-4.5 w-4.5 text-primary" />
              <span>M</span>
            </div>
          </div>

          {/* Right side: Profile Photo/Name & Logout */}
          {user && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {/* User avatar image or fallback */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "User profile"}
                    className="h-8 w-8 rounded-full border border-hairline object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                    {initials}
                  </div>
                )}
                {/* User name & email */}
                <div className="flex flex-col text-left">
                  <span className="text-sm font-semibold text-ink leading-none">
                    {user.name}
                  </span>
                  <span className="text-xs text-ink-muted leading-none mt-1 select-all">
                    {user.email}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <form action={logoutUser} className="flex items-center">
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon-sm"
                  className="text-ink-muted hover:text-destructive hover:bg-destructive/5 rounded-md"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </header>

        {/* ========================================================================= */}
        {/* PAGE CONTENT CONTAINER                                                    */}
        {/* ========================================================================= */}
        <main className={cn("mx-auto flex w-full flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8", maxWidth)}>
          {children}
        </main>
      </div>
    </div>
  );
}
