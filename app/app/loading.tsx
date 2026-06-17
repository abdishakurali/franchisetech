export default function AppLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
      <div className="mt-6 h-64 animate-pulse rounded-xl bg-slate-100" />
    </div>
  );
}
