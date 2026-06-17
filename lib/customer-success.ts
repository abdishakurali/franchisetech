import type { SubState } from "@/lib/billing/subscription";

export type CustomerHealthStatus = "Green" | "Yellow" | "Red";

export type CustomerHealthInput = {
  productCount: number;
  paymentMethodCount: number;
  hasOpenTill: boolean;
  totalSalesCount: number;
  lastSaleAt: string | null;
  reportViewed: boolean | null;
  trialEndsAt: string | null;
  subscriptionState: SubState | null;
  signupAt: string | null;
};

export type CustomerHealthResult = {
  status: CustomerHealthStatus;
  setupPercent: number;
  setupComplete: boolean;
  trialDaysLeft: number | null;
  salesInLast7Days: boolean;
  recommendedAction: string;
  reasons: string[];
};

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}

function daysSince(iso: string | null): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

export function getTrialNudge(input: CustomerHealthInput): string {
  const signupAge = daysSince(input.signupAt);
  const trialDaysLeft = daysUntil(input.trialEndsAt);

  if (trialDaysLeft !== null && trialDaysLeft < 0) return "Choose a plan to continue.";
  if (trialDaysLeft !== null && trialDaysLeft <= 3) return "Choose a plan before your trial ends.";
  if (trialDaysLeft !== null && trialDaysLeft <= 8) return "You are halfway through your trial. Check reports and choose a plan when ready.";
  if (signupAge !== null && signupAge >= 3 && input.totalSalesCount > 0) return "Check your daily report.";
  if (signupAge !== null && signupAge >= 1 && input.productCount > 0) return "Make your first test sale.";
  return "Add your first products.";
}

export function calculateCustomerHealth(input: CustomerHealthInput): CustomerHealthResult {
  const coreSteps = [
    input.productCount > 0,
    input.paymentMethodCount > 0,
    input.hasOpenTill,
    input.totalSalesCount > 0,
    input.reportViewed === true || input.totalSalesCount > 0,
    input.subscriptionState === "soft_trial" || input.subscriptionState === "trialing" || input.subscriptionState === "active",
  ];
  const doneCount = coreSteps.filter(Boolean).length;
  const setupPercent = Math.round((doneCount / coreSteps.length) * 100);
  const trialDaysLeft = daysUntil(input.trialEndsAt);
  const signupAge = daysSince(input.signupAt);
  const daysSinceLastSale = daysSince(input.lastSaleAt);
  const salesInLast7Days = daysSinceLastSale !== null && daysSinceLastSale <= 7;
  const reasons: string[] = [];

  if (input.productCount === 0) reasons.push("No products yet");
  if (input.totalSalesCount === 0) reasons.push("No first sale yet");
  if (input.reportViewed === false || input.reportViewed === null) reasons.push("Report view not confirmed");
  if (trialDaysLeft !== null && trialDaysLeft <= 3 && trialDaysLeft >= 0) reasons.push("Trial ending soon");
  if (trialDaysLeft !== null && trialDaysLeft < 0) reasons.push("Trial expired");
  if (input.subscriptionState === "past_due" || input.subscriptionState === "past_due_expired") reasons.push("Payment issue");
  if (daysSinceLastSale !== null && daysSinceLastSale > 7) reasons.push("No sale in 7+ days");
  if (signupAge !== null && signupAge >= 3 && input.totalSalesCount === 0) reasons.push("No sale after 3 days");

  let status: CustomerHealthStatus = "Yellow";
  if (
    input.subscriptionState === "past_due" ||
    input.subscriptionState === "past_due_expired" ||
    trialDaysLeft !== null && trialDaysLeft < 0 ||
    input.productCount === 0 ||
    signupAge !== null && signupAge >= 3 && input.totalSalesCount === 0 ||
    daysSinceLastSale !== null && daysSinceLastSale > 7
  ) {
    status = "Red";
  } else if (
    setupPercent >= 80 &&
    input.totalSalesCount > 0 &&
    salesInLast7Days &&
    (input.subscriptionState === "soft_trial" || input.subscriptionState === "trialing" || input.subscriptionState === "active")
  ) {
    status = "Green";
  }

  const recommendedAction =
    input.productCount === 0 ? "Help add first products" :
    input.totalSalesCount === 0 ? "Ask them to make first test sale" :
    input.reportViewed !== true ? "Show daily report" :
    input.subscriptionState === "past_due" || input.subscriptionState === "past_due_expired" ? "Payment issue" :
    trialDaysLeft !== null && trialDaysLeft <= 3 ? "Ask to choose plan" :
    status === "Green" && input.subscriptionState === "active" ? "Ready for testimonial" :
    "Keep selling and review reports";

  return {
    status,
    setupPercent,
    setupComplete: setupPercent === 100,
    trialDaysLeft,
    salesInLast7Days,
    recommendedAction,
    reasons,
  };
}
