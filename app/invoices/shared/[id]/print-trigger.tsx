"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export function PrintTrigger() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("print") === "true") {
        // Small delay to ensure the page has completely rendered and fonts are loaded
        const timer = setTimeout(() => {
          window.print();
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  return null;
}

export function SharedInvoiceActions() {
  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="w-full max-w-3xl mb-6 flex items-center justify-between gap-4 p-4 bg-surface rounded-lg border border-hairline shadow-elevation-1 print:hidden">
      <div className="flex items-center gap-2.5">
        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white font-bold text-sm">
          M
        </div>
        <div>
          <div className="font-semibold text-ink text-xs">Micham Invoice Statement</div>
          <div className="text-2xs text-ink-muted leading-tight">Public view</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary text-white hover:bg-primary-active rounded-md text-xs font-semibold shadow-sm transition-all hover:shadow-md cursor-pointer duration-150"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print / PDF</span>
        </button>
      </div>
    </div>
  );
}

