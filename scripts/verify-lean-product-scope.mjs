import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

const [home, onboarding, onboardingAction, kitchenOps, webhook, catalog, appShell, featureRoute] =
  await Promise.all([
    read("components/marketing/HomePageContent.tsx"),
    read("app/onboarding/page.tsx"),
    read("app/actions/onboarding.ts"),
    read("app/actions/kitchenops.ts"),
    read("app/api/billing/webhook/route.ts"),
    read("lib/billing/catalog.ts"),
    read("components/app/AppShell.tsx"),
    read("app/features/[slug]/page.tsx"),
  ]);

assert.match(home, /Vinde rapid și închide ziua fără surprize/);
assert.match(home, /captureClientEvent\("cta_clicked"/);
assert.match(home, /location: "homepage_hero"/);
assert.doesNotMatch(home, /integrations\/glovo|OwnerRecipeProof|Vezi cum arată aplicația/);

assert.doesNotMatch(onboarding, /step === 2|INGREDIENT_OPTIONS|LOCATION_OPTIONS/);
assert.match(onboardingAction, /redirect\("\/app\/setup-checklist\?welcome=1"\)/);
assert.match(onboardingAction, /"qualified_lead"/);
assert.match(onboardingAction, /"location_created"/);

assert.match(kitchenOps, /"daily_close_completed"/);
assert.match(kitchenOps, /recordGrowthMilestone\(supabase, orgId, "first_sale"/);
assert.match(webhook, /"payment_succeeded"/);

const marketplaceOrder = catalog.match(/MARKETPLACE_PRODUCT_ORDER[^=]*= \[([\s\S]*?)\];/)?.[1] ?? "";
assert.match(marketplaceOrder, /"fiscalnet"/);
assert.doesNotMatch(marketplaceOrder, /kitchen_display|table_service|loyalty|saga_export|anaf_efactura/);

assert.match(appShell, /LEAN_PRODUCT_SCOPE_ENABLED/);
assert.match(featureRoute, /isLeanPublicFeature\(slug\)/);

console.log("Lean product scope verification passed.");
