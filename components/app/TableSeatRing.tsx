"use client";

type Props = {
  capacity: number;
  coverCount?: number | null;
  occupied: boolean;
  size?: "sm" | "md";
};

/** Chair icons around a table — filled = guest seated, matches the physical floor plan. */
export function TableSeatRing({ capacity, coverCount, occupied, size = "sm" }: Props) {
  const cap = Math.min(Math.max(capacity, 1), 12);
  const filled = occupied ? Math.min(coverCount ?? 0, cap) : 0;
  const chairSize = size === "sm" ? 10 : 13;
  const radius = size === "sm" ? 46 : 54;

  const chairs = Array.from({ length: cap }, (_, i) => {
    const angle = (i / cap) * Math.PI * 2 - Math.PI / 2;
    const x = 50 + Math.cos(angle) * radius;
    const y = 50 + Math.sin(angle) * radius;
    const rotateDeg = (angle * 180) / Math.PI + 90;
    const isFilled = i < filled;
    return (
      <span
        key={i}
        className="absolute rounded-[3px]"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: chairSize,
          height: chairSize,
          transform: `translate(-50%, -50%) rotate(${rotateDeg}deg)`,
          backgroundColor: isFilled ? "#6d28d9" : "rgba(255,255,255,0.9)",
          border: `1.5px solid ${isFilled ? "#5b21b6" : "rgba(109,40,217,0.45)"}`,
          boxShadow: isFilled
            ? "inset 0 2px 0 rgba(0,0,0,0.18)"
            : "inset 0 2px 0 rgba(109,40,217,0.2)",
        }}
      />
    );
  });

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {chairs}
    </div>
  );
}
