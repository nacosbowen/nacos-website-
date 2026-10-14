export default function DashboardSkeleton() {
  return (
    <div className="relative z-10 flex min-h-screen bg-[#f5f5f5]" aria-busy="true" aria-label="Loading your dashboard">
      {/* Sidebar (desktop only, like the real one) */}
      <aside
        className="hidden lg:flex w-60 flex-col sticky top-0 h-screen"
        style={{ background: 'linear-gradient(160deg, #1a1a1a 0%, #0f0f0f 60%, #161616 100%)' }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-2.5 w-12 rounded bg-white/10 animate-pulse" />
            <div className="h-2.5 w-14 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="px-5 pt-4 pb-2">
          <div className="h-5 w-32 rounded-full bg-white/10 animate-pulse" />
        </div>
        <div className="flex-1 px-3 py-2 space-y-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-9 rounded-xl bg-white/[0.07] animate-pulse" />
          ))}
        </div>
        <div className="px-4 py-4 border-t border-white/[0.06] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-24 rounded bg-white/10 animate-pulse" />
            <div className="h-2 w-16 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 bg-white border-b border-gray-100 flex items-center px-4 lg:px-6 gap-4">
          <div className="lg:hidden w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
          <div className="h-4 w-36 rounded bg-gray-300 animate-pulse" />
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:block space-y-1.5">
              <div className="h-2.5 w-24 rounded bg-gray-300 animate-pulse" />
              <div className="h-2 w-14 rounded bg-gray-200 animate-pulse ml-auto" />
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-300 animate-pulse" />
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-5 lg:p-7">
          <div className="max-w-6xl mx-auto space-y-7">
            {/* Welcome banner */}
            <div className="rounded-2xl bg-gray-900 px-7 py-6 space-y-3">
              <div className="h-2.5 w-24 rounded bg-white/15 animate-pulse" />
              <div className="h-6 w-56 rounded bg-white/20 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-6 w-12 rounded-full bg-white/10 animate-pulse" />
                <div className="h-6 w-28 rounded-full bg-white/10 animate-pulse" />
                <div className="h-6 w-16 rounded-full bg-white/10 animate-pulse" />
              </div>
            </div>

            {/* Quick access cards */}
            <div>
              <div className="h-3 w-24 rounded bg-gray-300 animate-pulse mb-5" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-3 space-y-2.5">
                    <div className="w-5 h-5 rounded bg-gray-300 animate-pulse" />
                    <div className="h-3.5 w-3/4 rounded bg-gray-300 animate-pulse" />
                    <div className="h-2.5 w-full rounded bg-gray-200 animate-pulse" />
                    <div className="h-2.5 w-2/3 rounded bg-gray-200 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}