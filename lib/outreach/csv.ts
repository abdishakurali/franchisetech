import fs from "fs";
import path from "path";

export type OutreachCustomerRow = {
  company: string;
  city: string;
  segment: string;
  contact_name: string;
  role: string;
  email: string;
  source_url: string;
  pain_signal: string;
  recommended_plan: string;
  personalization_line: string;
  confidence: string;
  status: string;
};

export type OutreachPartnerRow = {
  company: string;
  partner_type: string;
  contact_name: string;
  email: string;
  client_count_signal: string;
  hook_line: string;
  source_url: string;
  confidence: string;
  status: string;
};

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

function outreachDir(): string {
  return path.join(process.cwd(), "outreach");
}

export function loadPendingCustomers(limit: number): OutreachCustomerRow[] {
  const file = path.join(outreachDir(), "ro-customers-100.csv");
  const rows = parseCsv(fs.readFileSync(file, "utf8")) as OutreachCustomerRow[];
  return rows.filter((r) => (r.status ?? "").trim() === "pending").slice(0, limit);
}

export function loadPendingPartners(limit: number): OutreachPartnerRow[] {
  const file = path.join(outreachDir(), "ro-partners-20.csv");
  const rows = parseCsv(fs.readFileSync(file, "utf8")) as OutreachPartnerRow[];
  return rows.filter((r) => (r.status ?? "").trim() === "pending").slice(0, limit);
}

export function authorizeCron(req: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return false;
  const auth = req.headers.get("authorization") ?? "";
  return auth === `Bearer ${cronSecret}`;
}
