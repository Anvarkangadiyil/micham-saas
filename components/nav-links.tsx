"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavLinks() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Expenses" },
    { href: "/clients", label: "Clients" },
  ];

  return (
    <nav className="flex items-center gap-4 text-sm font-medium h-full">
      {links.map((link) => {
        // Matches exact path for Home, and prefix path for others (like /clients/123)
        const isActive =
          link.href === "/"
            ? pathname === "/"
            : pathname === link.href || pathname.startsWith(link.href + "/");

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center h-14 px-1 border-b-2 transition-colors ${
              isActive
                ? "text-primary border-primary font-semibold"
                : "text-ink-muted border-transparent hover:text-ink hover:border-hairline"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
