// "Field" system (2026-09) — dark hero/CTA bands on a warm paper ground,
// Space Grotesk for display type, IBM Plex Sans for body, IBM Plex Mono
// for numbers/codes/eyebrows, brand blue (#165DFC) as the single accent —
// franchisetech's primary color, kept through the dark/paper visual
// refresh rather than swapped for the reference design's green. Content
// and visuals are grounded in what actual active customers use (see
// .agents/product-marketing-context.md), not the full feature list.
export const marketingPrimary = "#165DFC";
export const marketingPrimaryPress = "#0B47CC";
/** Light-on-dark accent — CTAs inside the dark hero/final-CTA bands. */
export const marketingAccentOnDark = "#165DFC";
export const marketingAccentOnDarkPress = "#3E7BFF";
/** Bright accent for small text/labels sitting directly on a dark band (eyebrows, mono numbers) — lighter than the button blue for contrast on near-black. */
export const marketingAccentTextOnDark = "#5B9CFF";

/** Fixed radius scale — do not introduce other values. */
export const marketingRadiusControl = "rounded-[10px]"; // buttons, inputs, nav
export const marketingRadiusCard = "rounded-2xl"; // 16px — cards, banners, popovers

/** Field palette — text, borders, tints (warm, paper-toned) */
export const marketingInk = "#0D0F0E";
export const marketingBody = "#5B5D57";
export const marketingMuted = "#78786F";
export const marketingMutedLight = "#8F8F86";
export const marketingBorder = "#DFDCD2";
export const marketingBorderLight = "#EDEAE1";
export const marketingTint = "#F3F0E8";
/** Dark band background — hero, benefits band, final CTA, footer. */
export const marketingNavy = "#0D0F0E";
/** Page background — warm paper, not pure white. */
export const marketingPageBg = "#FAF8F4";

/** Semantic colors — success / warning / error */
export const marketingSuccess = "#00A63D";
export const marketingSuccessText = "#00752C";
export const marketingSuccessBg = "#ECFDF3";
export const marketingWarning = "#B45309";
export const marketingWarningText = "#92400E";
export const marketingWarningBg = "#FFFBEB";
export const marketingWarningBorder = "#FDE68A";
export const marketingError = "#DC2626";
export const marketingErrorText = "#B01B1B";
export const marketingErrorBg = "#FEF2F2";

/** A single subtle shadow level — used only on outer screenshot/page frames */
export const marketingShadow = "shadow-[0_1px_3px_rgba(0,0,0,0.06)]";

export const marketingSectionY = "py-16 sm:py-24";

/** Shared marketing typography + surfaces */
export const marketingEyebrow =
  "font-mono text-xs font-medium uppercase tracking-[0.14em] text-[#165DFC]";
export const marketingHeading =
  "font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[#0D0F0E] sm:text-4xl lg:text-[2.6rem]";
export const marketingSubtext = "text-base leading-relaxed text-[#78786F] sm:text-lg";
export const marketingCard =
  "rounded-2xl border border-[#DFDCD2] bg-white transition hover:border-[#165DFC]";

/** Hero — dark band with a soft blue radial glow, top-right. */
export const marketingHeroBg = "bg-[#0D0F0E]";
export const marketingHeroRadial =
  "before:absolute before:inset-0 before:pointer-events-none before:content-[''] before:bg-[radial-gradient(90%_70%_at_78%_0%,rgba(22,93,252,0.35),transparent_60%)]";

/** Primary CTA — dark ink on light surfaces, turns blue on hover. Color only — callers supply their own radius. */
export const marketingCtaPrimary = "bg-[#0D0F0E] hover:bg-[#165DFC]";

/** Primary CTA for use inside a dark band (hero, final CTA) — solid blue, white text. */
export const marketingCtaOnDark = "bg-[#165DFC] hover:bg-[#3E7BFF] text-white";

/** Secondary CTA — visible on white. Color only — callers supply their own radius. */
export const marketingCtaSecondary =
  "border border-[#DFDCD2] bg-white text-[#0D0F0E] hover:bg-[#F3F0E8]";

/** Secondary CTA for use inside a dark band — outline on cream text. */
export const marketingCtaSecondaryOnDark =
  "border border-white/24 text-[#FAF8F4] hover:border-white";
