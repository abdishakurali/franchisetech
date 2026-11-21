import { runUnconfirmedSweep } from "@/lib/fiscalnet/unconfirmed-sweep";
export const dynamic = "force-dynamic";
export const GET = (req: Request) => runUnconfirmedSweep(req);
export const POST = (req: Request) => runUnconfirmedSweep(req);
