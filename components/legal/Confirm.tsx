import type { ReactNode } from "react";

/** Visible marker for a statement the owner still has to confirm. Remove the
 * wrapper (keep the text) once the owner has confirmed it. */
export function Confirm({ children }: { children?: ReactNode }) {
  return (
    <mark className="rounded bg-amber-100 px-1 text-amber-900">
      [CONFIRM]{children ? <> {children}</> : null}
    </mark>
  );
}
