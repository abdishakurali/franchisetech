/**
 * Minimal server timing for baselining hot paths (sale, POS load, layout,
 * NIR, cash). Logs one line per call when PERF_LOG=1 so Vercel runtime logs
 * can be filtered by "[perf]"; otherwise it is a pass-through.
 */

const enabled = () => process.env.PERF_LOG === "1";

export async function withTiming<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!enabled()) return fn();
  const start = performance.now();
  let ok = true;
  try {
    return await fn();
  } catch (err) {
    ok = false;
    throw err;
  } finally {
    console.info(`[perf] ${label} ${Math.round(performance.now() - start)}ms${ok ? "" : " (threw)"}`);
  }
}

/** Step timer for long functions: mark("rpc") logs the time since the previous mark. */
export function perfSteps(label: string) {
  if (!enabled()) return { mark: (_step: string) => {}, done: () => {} };
  const start = performance.now();
  let last = start;
  const parts: string[] = [];
  return {
    mark(step: string) {
      const now = performance.now();
      parts.push(`${step}=${Math.round(now - last)}`);
      last = now;
    },
    done() {
      console.info(`[perf] ${label} ${Math.round(performance.now() - start)}ms ${parts.join(" ")}`);
    },
  };
}
