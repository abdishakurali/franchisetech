"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { SAVE_ERROR_PARAM, saveErrorMessage } from "@/lib/save-error";

/** Shows the `?save_error=` message once, then drops the param from the URL so
 * the next successful save on the same page does not repeat it. */
export function SaveErrorToast({ code }: { code: string | null | undefined }) {
  useEffect(() => {
    const message = saveErrorMessage(code);
    if (!message) return;
    toast.error(message, { id: "save-error", duration: 10000 });
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete(SAVE_ERROR_PARAM);
      window.history.replaceState(window.history.state, "", url.toString());
    } catch {
      /* the message was shown; leaving the param is harmless */
    }
  }, [code]);
  return null;
}
