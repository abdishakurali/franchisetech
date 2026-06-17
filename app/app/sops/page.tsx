const sops = [
  ["Fridge out of range", "A chilled unit is above target.", "Move high-risk food to a working unit, check door/seals, recheck temperature.", "Temperature check plus action taken.", "Manager reviews stock safety and maintenance need."],
  ["Freezer out of range", "Frozen food is warmer than target.", "Keep door closed, check power, move stock if thawing risk exists.", "Freezer check plus action taken.", "Manager decides whether food remains suitable."],
  ["Delivery rejected", "A delivery has poor temperature, date, label, or condition.", "Reject or quarantine the delivery and notify supplier.", "Delivery check with supplier, product, batch, reason.", "Manager follows up with supplier."],
  ["Failed hot-hold check", "Hot food is below holding temperature.", "Remove from service, reheat if appropriate, or discard.", "Hot-hold check plus action taken.", "Manager reviews service process."],
  ["Cleaning missed", "Required cleaning was not completed.", "Complete cleaning before use or restrict the area.", "Cleaning check and notes.", "Manager checks staffing/process gap."],
  ["Supplier label issue", "Label, supplier, or prep risk suggests product uncertainty.", "Hold product, separate from service, verify label/supplier info.", "Delivery or prep note plus action taken.", "Manager confirms whether product can be used."],
];

export default function SopsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">SOP guidance</h1>
      <p className="text-slate-500 text-sm mt-1 mb-6">Operational guidance only. Food business operators remain responsible for complying with applicable food law and official guidance.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {sops.map(([title, happened, action, record, follow]) => (
          <div key={title} className="rounded-lg border border-slate-100 bg-white p-5">
            <h2 className="font-semibold text-slate-900">{title}</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div><dt className="font-medium text-slate-700">What happened</dt><dd className="text-slate-500">{happened}</dd></div>
              <div><dt className="font-medium text-slate-700">Immediate action</dt><dd className="text-slate-500">{action}</dd></div>
              <div><dt className="font-medium text-slate-700">Record required</dt><dd className="text-slate-500">{record}</dd></div>
              <div><dt className="font-medium text-slate-700">Manager follow-up</dt><dd className="text-slate-500">{follow}</dd></div>
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
