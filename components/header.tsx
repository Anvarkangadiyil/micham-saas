import { Wallet, LogOut } from "lucide-react";
import { signOut } from "@/auth";
import { Button } from "@/components/ui/button";

import { NavLinks } from "@/components/nav-links";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6 h-full">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <Wallet className="h-4.5 w-4.5" />
            </div>
            <span className="hidden sm:inline-block tracking-tight text-lg">
              Freelancer Finance
            </span>
            <span className="sm:hidden tracking-tight text-lg">
              FF
            </span>
          </div>
          <NavLinks />
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex flex-col text-right hidden sm:flex">
              <span className="text-sm font-medium text-foreground leading-none">
                {user.name}
              </span>
              <span className="text-xs text-muted-foreground mt-1 leading-none">
                {user.email}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button
                type="submit"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-muted-foreground hover:text-foreground border-border"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </header>
  );
}
