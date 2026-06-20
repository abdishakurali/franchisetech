"use client";

import { useLayoutEffect } from "react";
import { resetPosTillOpen, setPosTillOpen } from "@/lib/pos-till-state";

export function PosTillStateSync({ sessionOpen }: { sessionOpen: boolean }) {
  useLayoutEffect(() => {
    setPosTillOpen(sessionOpen);
    return () => resetPosTillOpen();
  }, [sessionOpen]);

  return null;
}
