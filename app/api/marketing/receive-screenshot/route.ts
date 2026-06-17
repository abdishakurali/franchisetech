import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

// POST /api/marketing/receive-screenshot
// Header: x-upload-token: <MARKETING_UPLOAD_TOKEN>
// Body: { filename: "dashboard.png", data: "<base64 string without prefix>" }
export async function POST(req: Request) {
  const token = req.headers.get("x-upload-token");
  const expectedToken = process.env.MARKETING_UPLOAD_TOKEN;
  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { filename?: string; data?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { filename, data } = body;
  if (!filename || !data) {
    return NextResponse.json({ error: "Missing filename or data" }, { status: 400 });
  }

  // Sanitise filename — allow only alphanumeric, dash, underscore, dot
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!safe.endsWith(".png") && !safe.endsWith(".jpg") && !safe.endsWith(".jpeg") && !safe.endsWith(".txt")) {
    return NextResponse.json({ error: "Only PNG/JPEG allowed" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "public", "marketing");
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, safe);
  const buffer = Buffer.from(data, "base64");
  await writeFile(filePath, buffer);

  return NextResponse.json({ ok: true, path: `/marketing/${safe}`, size: buffer.length });
}
