/**
 * Smoke-test all 5 Loops activation events against the Loops API.
 *
 * Usage:
 *   LOOPS_API_KEY=... npx ts-node --compiler-options '{"module":"commonjs"}' scripts/test-loops.ts
 *
 * Optional: LOOPS_TEST_EMAIL=you@example.com (defaults to info@franchisetech.ro)
 */
import { LoopsClient } from "loops";

const apiKey = process.env.LOOPS_API_KEY;
if (!apiKey) {
  console.error("LOOPS_API_KEY is not set. Add it to .env.local or export it in the shell.");
  process.exit(1);
}

const testEmail = process.env.LOOPS_TEST_EMAIL ?? "info@franchisetech.ro";
const loops = new LoopsClient(apiKey);

const ACTIVATION_EVENTS = [
  "trial_started",
  "till_session_opened",
  "first_sale_recorded",
  "z_report_viewed",
  "subscription_created",
] as const;

async function main() {
  console.log(`Sending ${ACTIVATION_EVENTS.length} test events to ${testEmail}…\n`);

  for (const eventName of ACTIVATION_EVENTS) {
    await loops.sendEvent({
      email: testEmail,
      eventName,
      eventProperties: {
        test: true,
        source: "scripts/test-loops.ts",
      },
    });
    console.log(`✓ ${eventName}`);
  }

  console.log("\nAll activation events sent successfully.");
}

main().catch((err) => {
  console.error("Loops test failed:", err);
  process.exit(1);
});
