"use client";

import { useEffect, useRef } from "react";
import { markGrowthReportViewed } from "@/app/actions/growth";

/** Fires once per mount when user views a daily report page. */
export function GrowthReportViewTracker() {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void markGrowthReportViewed();
  }, []);
  return null;
}
