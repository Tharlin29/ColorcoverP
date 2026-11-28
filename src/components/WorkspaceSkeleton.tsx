export function WorkspaceSkeleton() {
  return (
    <div
      className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-20 space-y-6"
      aria-busy="true"
      aria-label="Loading workspace"
    >
      {/* Header skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-56 rounded-lg bg-zinc-200/80 motion-safe:animate-pulse" />
          <div className="h-4 w-80 max-w-full rounded bg-zinc-200/60 motion-safe:animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-10 w-36 rounded-xl bg-zinc-200/80 motion-safe:animate-pulse" />
          <div className="h-10 w-40 rounded-xl bg-zinc-300/70 motion-safe:animate-pulse" />
        </div>
      </div>

      {/* Main 2-column workspace skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="h-6 w-32 rounded-md bg-zinc-200/75 motion-safe:animate-pulse" />
            <div className="h-7 w-52 rounded-lg bg-zinc-200/75 motion-safe:animate-pulse" />
          </div>
          <div className="aspect-[2/3] max-h-[56vh] mx-auto rounded-xl bg-zinc-200/70 motion-safe:animate-pulse" />
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="h-5 w-44 rounded bg-zinc-200/80 motion-safe:animate-pulse" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="h-16 rounded-xl bg-zinc-100 border border-zinc-200/70 motion-safe:animate-pulse" />
              <div className="h-16 rounded-xl bg-zinc-100 border border-zinc-200/70 motion-safe:animate-pulse" />
              <div className="h-16 rounded-xl bg-zinc-100 border border-zinc-200/70 motion-safe:animate-pulse" />
              <div className="h-16 rounded-xl bg-zinc-100 border border-zinc-200/70 motion-safe:animate-pulse" />
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-3">
            <div className="h-9 w-full rounded-xl bg-zinc-100 motion-safe:animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-zinc-100 motion-safe:animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-zinc-100 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
