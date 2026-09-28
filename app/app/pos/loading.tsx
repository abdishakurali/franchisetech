export default function PosLoading() {
  return (
    <div className="flex flex-1 flex-col min-h-0 bg-card">
      <div className="border-b border-border p-3 sm:p-4">
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="h-8 w-24 shrink-0 animate-pulse rounded-full bg-secondary" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <div className="grid flex-1 grid-cols-2 gap-3 overflow-hidden p-3 sm:grid-cols-3 sm:p-4 lg:grid-cols-4">
          {Array.from({ length: 12 }).map((_, item) => (
            <div key={item} className="aspect-square animate-pulse rounded-xl bg-secondary" />
          ))}
        </div>
        <div className="flex w-full flex-col border-t border-border p-3 sm:p-4 lg:w-80 lg:border-l lg:border-t-0">
          <div className="mb-3 h-5 w-24 animate-pulse rounded bg-secondary" />
          <div className="flex-1 space-y-2">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-lg bg-secondary" />
            ))}
          </div>
          <div className="mt-4 h-11 animate-pulse rounded-lg bg-secondary" />
        </div>
      </div>
    </div>
  );
}
