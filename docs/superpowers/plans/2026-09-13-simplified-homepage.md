# Simplified Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the dense homepage with an accessible five-section, café-photographic landing page that leads Romanian food-business owners to the assisted trial.

**Architecture:** Keep `app/page.tsx` and the marketing shell unchanged. Reshape the localized homepage data contract, then rebuild the two existing homepage content exports around hero, product proof, four benefits, customer proof, and pricing/final CTA. Secondary material remains available on dedicated routes.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest

**Spec:** `docs/plans/2026-09-13-simplified-homepage-design.md`

## Global Constraints

- Retain the current full-bleed café hero photograph and existing visual tokens.
- Preserve Romanian/English localization, SEO, analytics, and signup routes.
- All user-facing text is Romanian or localized English; code comments are English.
- Mobile-first, minimum 44px interactive targets, semantic headings, and keyboard-accessible product tabs.
- Do not modify POS connectivity/queue files or database migrations.
- Consult the relevant local Next.js 16 guides in `node_modules/next/dist/docs/` before implementation.

---

### Task 1: Define the simplified localized content contract

**Files:**
- Modify: `lib/marketing/homepage-content.ts`
- Create: `lib/marketing/homepage-content.test.ts`

**Interfaces:**
- Consumes: `MarketingLocale`, `pricingPlans`
- Produces: `getHomepageContent(locale)` with `benefits`, `customerProof`, `pricing`, and the existing `screens` array

- [ ] **Step 1: Write the failing content tests**

```ts
import { describe, expect, it } from "vitest";
import { getHomepageContent } from "@/lib/marketing/homepage-content";

describe("simplified homepage content", () => {
  it.each(["ro", "en"] as const)("has five-section content for %s", (locale) => {
    const content = getHomepageContent(locale);
    expect(content.benefits).toHaveLength(4);
    expect(content.screens).toHaveLength(4);
    expect(content.customerProof.stats.length).toBeGreaterThanOrEqual(2);
    expect(content.pricing.planText).toHaveLength(2);
  });

  it("keeps the Romanian assisted-trial CTA", () => {
    expect(getHomepageContent("ro").trial).toContain("15 zile");
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- lib/marketing/homepage-content.test.ts`
Expected: FAIL because `benefits`, `customerProof`, and nested `pricing` do not exist.

- [ ] **Step 3: Replace obsolete homepage-only fields with the new contract**

```ts
benefits: [
  { title: "Vinzi simplu", text: "Produsele și comenzile sunt la îndemână la tejghea." },
  { title: "Stocul se mișcă odată cu vânzarea", text: "Vezi cantitățile și ce trebuie reaprovizionat." },
  { title: "Știi marja reală", text: "Costurile rețetelor arată ce rămâne din fiecare produs." },
  { title: "Închizi ziua cu adevărul", text: "Compari încasările și numerarul așteptat într-un singur loc." },
],
customerProof: {
  title: "Un local real. O zi mai clară.",
  caption: "FranchiseTech folosit zilnic într-o cafenea din România.",
  stats: [
    { value: "3.700+", label: "bonuri înregistrate" },
    { value: "9.000+", label: "mișcări de stoc" },
  ],
},
pricing: { planText: ["POS, produse și închiderea zilei.", "Stoc, achiziții, rețete și marje."] },
```

Add equivalent natural English copy and remove fields used only by the deleted quick-links, offline, hardware, language, and FAQ sections.

- [ ] **Step 4: Run the content tests**

Run: `npm test -- lib/marketing/homepage-content.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/marketing/homepage-content.ts lib/marketing/homepage-content.test.ts
git commit -m "refactor: simplify homepage content model"
```

### Task 2: Rebuild the homepage into five sections

**Files:**
- Modify: `components/marketing/HomePageContent.tsx`
- Create: `components/marketing/HomePageContent.test.ts`

**Interfaces:**
- Consumes: `getHomepageContent(locale)`, `pricingPlans`, `captureClientEvent`, `YouTubeFacade`
- Produces: `HomePageContentTop` for the hero and `HomePageContentBottom` for product proof, benefits, customer proof, and pricing/final CTA

- [ ] **Step 1: Write a failing structural regression test**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("components/marketing/HomePageContent.tsx", "utf8");

describe("homepage structure", () => {
  it("renders the approved sections in order", () => {
    const ids = ["product-proof", "benefits", "customer-proof", "pricing"];
    const positions = ids.map((id) => source.indexOf(`id=\"${id}\"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
  });

  it("removes secondary homepage sections", () => {
    for (const id of ["offline", "hardware", "adevar-unic"])
      expect(source).not.toContain(`id=\"${id}\"`);
  });

  it("keeps the primary trial route and analytics", () => {
    expect(source).toContain('/signup?plan=starter');
    expect(source).toContain('captureClientEvent("cta_clicked"');
  });
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run: `npm test -- components/marketing/HomePageContent.test.ts`
Expected: FAIL because the new section IDs are absent and secondary sections still exist.

- [ ] **Step 3: Simplify the hero**

Keep `/marketing/hero-cafe-pos.png`, the dark overlay, locale-aware copy, and CTA tracking. Remove the four-link anchor navigation. Use `/signup?plan=starter` as the primary CTA and `#product-proof` as the secondary CTA.

- [ ] **Step 4: Simplify product proof and benefits**

Rename the gallery section to `product-proof`, retain its accessible four-tab interaction and one dominant visual, and remove the lightbox/link clutter. Add `id="benefits"` with four concise entries rendered in a responsive `sm:grid-cols-2 lg:grid-cols-4` layout without card borders.

- [ ] **Step 5: Consolidate customer proof**

Replace the current video/details combination with `id="customer-proof"`: customer copy and stats on one side, `YouTubeFacade` on the other. Keep the current YouTube identifier and avoid unverified customer names.

- [ ] **Step 6: Consolidate pricing and final CTA**

Use one `id="pricing"` section containing Starter and Pro cards, the `/pricing` comparison link, minimum tax qualification, and one final `/signup?plan=starter` CTA. Remove the separate FAQ and final navy section.

- [ ] **Step 7: Remove unused code**

Delete obsolete icon imports, `useRouter`, language mutation logic, `fiscalHardware`, `Faq`, and state/dialog code no longer used. Preserve `useEffect`, product-tab keyboard behavior, locale context, `pricingPlans`, and analytics.

- [ ] **Step 8: Run the focused tests**

Run: `npm test -- components/marketing/HomePageContent.test.ts lib/marketing/homepage-content.test.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add components/marketing/HomePageContent.tsx components/marketing/HomePageContent.test.ts
git commit -m "feat: simplify photographic homepage"
```

### Task 3: Verify responsive, accessible, and production behavior

**Files:**
- Modify only if verification finds a homepage regression: `components/marketing/HomePageContent.tsx`, `lib/marketing/homepage-content.ts`, or their tests

**Interfaces:**
- Consumes: completed homepage implementation
- Produces: verified build-ready homepage

- [ ] **Step 1: Run the complete static verification**

Run: `npm test && npm run typecheck && npm run lint`
Expected: all commands exit 0; unrelated pre-existing warnings are recorded rather than hidden.

- [ ] **Step 2: Start the local app**

Run: `npm run dev`
Expected: homepage loads without runtime errors.

- [ ] **Step 3: Verify mobile and desktop behavior**

Check `/` and `/?lang=en` at 390×844 and 1440×900. Confirm the five sections, readable overlays, 44px controls, product-tab keyboard navigation, locale parity, and both CTA destinations.

- [ ] **Step 4: Inspect browser errors and analytics wiring**

Confirm there are no homepage React/runtime errors and that clicking the hero CTA invokes the existing `cta_clicked` handler with `location: "homepage_hero"`.

- [ ] **Step 5: Run the deployment guard without deploying**

Run: `bash scripts/predeploy-guard.sh`
Expected: PASS. Do not run `deploy.sh` unless the user separately requests deployment.

- [ ] **Step 6: Commit verification fixes if needed**

```bash
git add components/marketing/HomePageContent.tsx components/marketing/HomePageContent.test.ts lib/marketing/homepage-content.ts lib/marketing/homepage-content.test.ts
git commit -m "fix: polish simplified homepage verification"
```
