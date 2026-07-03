export default function InvoicesLoading() {
  return (
    <div className="min-h-screen bg-canvas-soft flex flex-col">
      {/* Header skeleton shell */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 h-full">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-canvas-soft animate-pulse" />
              <div className="h-5 w-32 rounded bg-canvas-soft animate-pulse hidden sm:block" />
            </div>
            <div className="flex gap-4">
              <div className="h-4 w-16 rounded bg-canvas-soft animate-pulse" />
              <div className="h-4 w-16 rounded bg-canvas-soft animate-pulse" />
              <div className="h-4 w-16 rounded bg-canvas-soft animate-pulse" />
            </div>
          </div>
          <div className="h-8 w-20 rounded bg-canvas-soft animate-pulse" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {/* Title skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-32 rounded bg-surface animate-pulse" />
            <div className="h-4 w-72 rounded bg-surface animate-pulse" />
          </div>
          <div className="h-9 w-32 rounded bg-surface animate-pulse" />
        </div>

        {/* Metrics Cards skeleton */}
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-3">
              <div className="h-3 w-24 rounded bg-canvas-soft animate-pulse" />
              <div className="h-8 w-36 rounded bg-canvas-soft animate-pulse" />
            </div>
          ))}
        </div>

        {/* Search & Filters row skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-hairline pb-4">
          <div className="h-10 w-full max-w-md rounded-md bg-surface border border-hairline animate-pulse" />
          <div className="flex gap-2">
            <div className="h-8 w-48 rounded bg-surface border border-hairline animate-pulse" />
            <div className="h-8 w-28 rounded bg-surface border border-hairline animate-pulse" />
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-lg border border-hairline bg-surface overflow-hidden shadow-elevation-1 space-y-4 p-4">
          <div className="flex justify-between border-b border-hairline pb-3">
            <div className="h-4 w-12 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-20 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-24 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-16 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-16 bg-canvas-soft rounded animate-pulse" />
            <div className="h-4 w-12 bg-canvas-soft rounded animate-pulse" />
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex justify-between border-b border-hairline/40 pb-3.5 pt-1.5 last:border-0 last:pb-0">
              <div className="h-5 w-16 bg-canvas-soft rounded animate-pulse" />
              <div className="h-5 w-24 bg-canvas-soft rounded animate-pulse" />
              <div className="h-5 w-20 bg-canvas-soft rounded animate-pulse" />
              <div className="h-5 w-16 bg-canvas-soft rounded animate-pulse" />
              <div className="h-5 w-16 bg-canvas-soft rounded animate-pulse" />
              <div className="h-5 w-12 bg-canvas-soft rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
