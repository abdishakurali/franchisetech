"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { X, ArrowRight, ArrowLeft, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface TourStep {
  target: string;          // data-tour attribute value
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
}

interface Rect { top: number; left: number; width: number; height: number }
interface TooltipPos { top: number; left: number; arrowSide: "top" | "bottom" | "left" | "right" | null }

interface Props {
  tourId: string;          // used for localStorage key
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
}

const STORAGE_KEY = (id: string) => `fp_tour_${id}_done`;

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

function getTooltipPosition(rect: Rect, placement: TourStep["placement"]): TooltipPos {
  const TIP = 12;       // gap between element and tooltip
  const TW  = 320;      // tooltip max-width
  const TH  = 160;      // estimated tooltip height
  const W   = window.innerWidth;
  const H   = window.innerHeight;

  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;

  const spaceBelow = H - rect.top - rect.height;
  const spaceAbove = rect.top;
  const spaceRight = W - rect.left - rect.width;
  const spaceLeft  = rect.left;

  let side = placement ?? "bottom";
  if (side === "bottom" && spaceBelow < TH + TIP && spaceAbove > spaceBelow) side = "top";
  if (side === "top"    && spaceAbove < TH + TIP && spaceBelow > spaceAbove) side = "bottom";
  if (side === "right"  && spaceRight < TW + TIP) side = "left";
  if (side === "left"   && spaceLeft  < TW + TIP) side = "right";

  let top = 0, left = 0;

  if (side === "bottom") {
    top  = rect.top + rect.height + TIP;
    left = clamp(cx - TW / 2, 12, W - TW - 12);
  } else if (side === "top") {
    top  = rect.top - TH - TIP;
    left = clamp(cx - TW / 2, 12, W - TW - 12);
  } else if (side === "right") {
    top  = clamp(cy - TH / 2, 12, H - TH - 12);
    left = rect.left + rect.width + TIP;
  } else {
    top  = clamp(cy - TH / 2, 12, H - TH - 12);
    left = rect.left - TW - TIP;
  }

  top  = clamp(top,  8, H - TH - 8);
  left = clamp(left, 8, W - TW - 8);

  return { top, left, arrowSide: side };
}

export function TourOverlay({ tourId, steps, onComplete, onSkip }: Props) {
  const [active, setActive] = useState(false);
  const [step,   setStep]   = useState(0);
  const [rect,   setRect]   = useState<Rect | null>(null);
  const [tipPos, setTipPos] = useState<TooltipPos | null>(null);
  const rafRef = useRef<number | null>(null);

  const measure = useCallback((target: string) => {
    const el = document.querySelector(`[data-tour="${target}"]`) as HTMLElement | null;
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    // wait for scroll, then measure
    setTimeout(() => {
      const r = el.getBoundingClientRect();
      const newRect = { top: r.top, left: r.left, width: r.width, height: r.height };
      setRect(newRect);
      setTipPos(getTooltipPosition(newRect, steps[step]?.placement));
    }, 350);
  }, [steps, step]);

  // Remeasure on resize
  useEffect(() => {
    if (!active) return;
    const cur = steps[step];
    if (!cur) return;
    const onResize = () => measure(cur.target);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [active, step, steps, measure]);

  // Start tour
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem(STORAGE_KEY(tourId))) return;
    // Small delay so elements are rendered
    const t = setTimeout(() => {
      setActive(true);
      setStep(0);
    }, 600);
    return () => clearTimeout(t);
  }, [tourId]);

  // Measure when step changes
  useEffect(() => {
    if (!active) return;
    const cur = steps[step];
    if (cur) measure(cur.target);
  }, [active, step, steps, measure]);

  // Keep rect fresh with rAF while active
  useEffect(() => {
    if (!active) return;
    const track = () => {
      const cur = steps[step];
      if (cur) {
        const el = document.querySelector(`[data-tour="${cur.target}"]`) as HTMLElement | null;
        if (el) {
          const r = el.getBoundingClientRect();
          setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
          setTipPos(getTooltipPosition(
            { top: r.top, left: r.left, width: r.width, height: r.height },
            cur.placement
          ));
        }
      }
      rafRef.current = requestAnimationFrame(track);
    };
    rafRef.current = requestAnimationFrame(track);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [active, step, steps]);

  const finish = useCallback((skip = false) => {
    setActive(false);
    setRect(null);
    localStorage.setItem(STORAGE_KEY(tourId), "1");
    if (skip) onSkip?.();
    else onComplete?.();
  }, [tourId, onComplete, onSkip]);

  const next = () => {
    if (step >= steps.length - 1) finish(false);
    else setStep((s) => s + 1);
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (!active || !rect || !tipPos || steps.length === 0) return null;

  const cur = steps[step];
  const PADDING = 6;

  return (
    <>
      {/* Dark overlay with hole */}
      <div
        className="fixed inset-0 z-[9000] pointer-events-none"
        style={{
          background: `radial-gradient(ellipse ${rect.width + PADDING * 2}px ${rect.height + PADDING * 2}px at ${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px, transparent 100%, rgba(0,0,0,0.55) 100%)`,
        }}
      />

      {/* Highlight ring */}
      <div
        className="fixed z-[9001] rounded-lg pointer-events-none"
        style={{
          top:    rect.top    - PADDING,
          left:   rect.left   - PADDING,
          width:  rect.width  + PADDING * 2,
          height: rect.height + PADDING * 2,
          boxShadow: "0 0 0 3px #3b82f6, 0 0 0 6px rgba(59,130,246,0.25)",
          transition: "top 200ms, left 200ms, width 200ms, height 200ms",
        }}
      />

      {/* Tooltip card */}
      <div
        className="fixed z-[9002] w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-4"
        style={{ top: tipPos.top, left: tipPos.left, transition: "top 200ms, left 200ms" }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1 mb-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-blue-600" : "w-1.5 bg-slate-200"}`}
            />
          ))}
          <span className="ml-auto text-xs text-slate-400">{step + 1} / {steps.length}</span>
          <button
            onClick={() => finish(true)}
            className="ml-2 text-slate-400 hover:text-slate-600"
            aria-label="Skip tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="font-semibold text-slate-900 text-sm mb-1">{cur.title}</p>
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">{cur.content}</p>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => finish(true)}
            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <SkipForward className="h-3 w-3" /> Skip
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button size="sm" variant="outline" onClick={prev} className="gap-1 h-8 text-xs">
                <ArrowLeft className="h-3 w-3" /> Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="gap-1 h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white">
              {step === steps.length - 1 ? "Done" : "Next"}
              {step < steps.length - 1 && <ArrowRight className="h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/** Reset tour so it shows again (for demo/testing) */
export function resetTour(tourId: string) {
  localStorage.removeItem(STORAGE_KEY(tourId));
}
