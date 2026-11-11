import { runFirstReceiptWatch } from "@/lib/growth/first-receipt-watch";
export const dynamic = "force-dynamic";
export const GET = (req: Request) => runFirstReceiptWatch(req);
export const POST = (req: Request) => runFirstReceiptWatch(req);
