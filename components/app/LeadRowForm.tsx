"use client";

import { useState, useTransition } from "react";
import { updateLead } from "@/app/actions/leads";
import { LEAD_STATUSES, LEAD_STATUS_LABELS, type LeadStatus } from "@/lib/leads/demo-lead";

const input = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";

export function LeadRowForm({
  id,
  status,
  nextAction,
  nextActionDue,
  notes,
  defaultNextAction,
}: {
  id: string;
  status: LeadStatus;
  nextAction: string | null;
  nextActionDue: string | null;
  notes: string | null;
  defaultNextAction: string | null;
}) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="grid gap-2 sm:grid-cols-[10rem_1fr_9rem]"
      action={(formData) =>
        start(async () => {
          const result = await updateLead(formData);
          setMessage(result.ok ? "Salvat" : result.error);
        })
      }
    >
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`status-${id}`}>Status</label>
      <select id={`status-${id}`} name="status" defaultValue={status} className={input}>
        {LEAD_STATUSES.map((s) => (
          <option key={s} value={s}>
            {LEAD_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <label className="sr-only" htmlFor={`next-${id}`}>Următorul pas</label>
      <input id={`next-${id}`} name="next_action" defaultValue={nextAction ?? ""} placeholder={defaultNextAction ?? "Următorul pas"} maxLength={200} className={input} />
      <label className="sr-only" htmlFor={`due-${id}`}>Termen</label>
      <input id={`due-${id}`} name="next_action_due" type="date" defaultValue={nextActionDue ?? ""} className={input} />
      <label className="sr-only" htmlFor={`notes-${id}`}>Note</label>
      <textarea id={`notes-${id}`} name="notes" defaultValue={notes ?? ""} rows={2} maxLength={2000} placeholder="Note interne" className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm sm:col-span-2" />
      <div className="flex items-center gap-2">
        <button type="submit" disabled={pending} className="h-9 rounded-md bg-foreground px-3 text-sm font-medium text-background disabled:opacity-60">
          {pending ? "Se salvează…" : "Salvează"}
        </button>
        {message ? <span role="status" className="text-xs text-muted-foreground">{message}</span> : null}
      </div>
    </form>
  );
}
