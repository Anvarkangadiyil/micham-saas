export default function ClientsLoading() {
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
            <div className="h-4 w-64 rounded bg-surface animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded bg-surface animate-pulse" />
        </div>

        {/* Search bar skeleton */}
        <div className="h-10 w-full rounded-md bg-surface border border-hairline animate-pulse" />

        {/* Client Cards Grid skeleton */}
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-hairline bg-surface p-5 shadow-elevation-1 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-36 rounded bg-canvas-soft animate-pulse" />
                  <div className="h-4.5 w-24 rounded bg-canvas-soft animate-pulse" />
                </div>
                <div className="h-8 w-16 rounded bg-canvas-soft animate-pulse" />
              </div>
              <div className="h-4.5 w-48 rounded bg-canvas-soft animate-pulse" />
              <div className="h-12 w-full rounded bg-canvas-soft/40 animate-pulse border border-hairline/20" />
              <div className="flex justify-between border-t border-hairline/60 pt-3 mt-2">
                <div className="h-4 w-16 rounded bg-canvas-soft animate-pulse" />
                <div className="flex gap-4">
                  <div className="h-4 w-10 rounded bg-canvas-soft animate-pulse" />
                  <div className="h-4 w-10 rounded bg-canvas-soft animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
