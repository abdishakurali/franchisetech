export function csvEscape(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value)
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return ""
  const headers = Object.keys(rows[0])
  return [
    headers.map(csvEscape).join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(",")),
  ].join("\n")
}

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  const csv = toCsv(rows)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function downloadExcel(filename: string, rows: Array<Record<string, unknown>>) {
  if (rows.length === 0) return downloadCsv(filename.replace(/\.xls$/, ".csv"), rows)
  const headers = Object.keys(rows[0])
  const cell = (value: unknown) =>
    `<td>${String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>`
  const html = `<html><head><meta charset="utf-8"></head><body><table><thead><tr>${headers.map(cell).join("")}</tr></thead><tbody>${rows.map((row) => `<tr>${headers.map((h) => cell(row[h])).join("")}</tr>`).join("")}</tbody></table></body></html>`
  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
