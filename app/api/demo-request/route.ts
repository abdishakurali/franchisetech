import { postDemoRequest } from "@/lib/leads/demo-request-handler";

export async function POST(request: Request) {
  return postDemoRequest(request);
}
