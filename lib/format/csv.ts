/**
 * Small CSV reader shared by the import screens and server actions.
 *
 * Romanian Excel saves "CSV" with ";" as the separator (because "," is the
 * decimal mark). We detect the separator from the header line: ";" or tab when
 * it appears more often than "," outside quotes, else ",". Quotes and a UTF-8
 * BOM are handled. Pure, no server imports.
 */
export type CsvDelimiter = "," | ";" | "\t";

export function detectCsvDelimiter(text: string): CsvDelimiter {
  const clean = text.replace(/^﻿/, "");
  const newline = clean.search(/\r?\n/);
  const header = newline >= 0 ? clean.slice(0, newline) : clean;
  const counts: Record<CsvDelimiter, number> = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (const ch of header) {
    if (ch === '"') { quoted = !quoted; continue; }
    if (!quoted && (ch === "," || ch === ";" || ch === "\t")) counts[ch]++;
  }
  if (counts[";"] > counts[","] && counts[";"] >= counts["\t"]) return ";";
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) return "\t";
  return ",";
}

/** Rows of cells (header row included). Empty lines are dropped. */
export function parseCsvRows(text: string, delimiter: CsvDelimiter = detectCsvDelimiter(text)): string[][] {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [];
  let cell = "";
  let row: string[] = [];
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '"' && quoted && next === '"') { cell += '"'; i++; continue; }
    if (ch === '"') { quoted = !quoted; continue; }
    if (ch === delimiter && !quoted) { row.push(cell.trim()); cell = ""; continue; }
    if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i++;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = []; cell = "";
      continue;
    }
    cell += ch;
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

/** Header-keyed records. Headers are trimmed, and lower-cased unless told otherwise. */
export function parseCsvRecords(text: string, opts: { lowercaseHeaders?: boolean } = {}): Record<string, string>[] {
  const rows = parseCsvRows(text);
  const lower = opts.lowercaseHeaders ?? true;
  const headers = (rows.shift() ?? []).map((h) => (lower ? h.toLowerCase().trim() : h.trim()));
  return rows.map((cols) => Object.fromEntries(headers.map((h, i) => [h, cols[i] ?? ""])));
}
