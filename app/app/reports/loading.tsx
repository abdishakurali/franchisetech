export default function ReportsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
    </div>
  );
}
