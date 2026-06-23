export function PartnerPilotBanner({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-5xl rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5">
      <p className="font-semibold text-amber-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-amber-800">{text}</p>
    </div>
  );
}
