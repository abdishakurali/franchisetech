"use client";

import Link from "next/link";

export default function Error() {
  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-slate-900">Something went wrong.</h2>
      <p className="mt-2 text-sm text-slate-500">Your data is safe. Go back to Dashboard.</p>
      <Link href="/app" className="mt-4 inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">Back to Dashboard</Link>
    </div>
  );
}
