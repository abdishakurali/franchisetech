import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

// Shared, branded PDF template for franchisetech's Romanian accounting
// reports (Raport de Gestiune, Registru de Casă, Balanță, Detalii Vânzări,
// VAT). One consistent, custom-designed document style instead of relying
// on the browser's native print-to-PDF.
//
// Registers Roboto (self-hosted, Apache-2.0) instead of the built-in
// Helvetica -- the 14 standard PDF fonts only support WinAnsi encoding and
// silently drop Romanian diacritics (ă â î ș ț), which is exactly the text
// these documents are full of.
const fontsDir = path.join(process.cwd(), "lib/pdf/fonts");
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontsDir, "Roboto-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "Roboto-Bold.ttf"), fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 8, fontFamily: "Roboto", color: "#0f172a" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: 1,
    borderBottomColor: "#0f172a",
    paddingBottom: 6,
    marginBottom: 8,
  },
  brand: { fontSize: 10, fontWeight: 700, color: "#2563eb" },
  companyBlock: { alignItems: "flex-end" },
  companyName: { fontSize: 10, fontWeight: 700 },
  meta: { fontSize: 7, color: "#64748b" },
  title: { fontSize: 13, fontWeight: 700, textAlign: "center", marginBottom: 2 },
  subtitle: { fontSize: 8, textAlign: "center", color: "#64748b", marginBottom: 4 },
  period: { fontSize: 8, textAlign: "center", color: "#334155", marginBottom: 10 },
  table: { width: "100%" },
  row: { flexDirection: "row" },
  headerRow: { backgroundColor: "#f1f5f9", fontWeight: 700 },
  totalRow: { backgroundColor: "#dcfce7", fontWeight: 700 },
  sectionRow: { backgroundColor: "#dbeafe", fontWeight: 700 },
  cell: {
    padding: 3,
    borderBottom: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10, gap: 8 },
  summaryCard: {
    flex: 1,
    border: 0.5,
    borderColor: "#e2e8f0",
    borderRadius: 3,
    padding: 6,
  },
  summaryLabel: { fontSize: 6.5, color: "#64748b", marginBottom: 2 },
  summaryValue: { fontSize: 10, fontWeight: 700 },
  footer: {
    position: "absolute",
    bottom: 16,
    left: 28,
    right: 28,
    fontSize: 6.5,
    color: "#94a3b8",
    textAlign: "center",
    borderTop: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 4,
  },
  signatureRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 28 },
  signatureBlock: { width: "45%" },
  signatureLabel: { fontSize: 7, color: "#64748b", marginBottom: 20 },
  signatureLine: { borderTop: 0.5, borderTopColor: "#334155", paddingTop: 2, fontSize: 6.5, color: "#94a3b8" },
});

export type PdfColumn = { key: string; label: string; align?: "left" | "right" | "center"; width: string };
export type PdfRow = Record<string, string | number> & { _rowStyle?: "total" | "section" };
export type PdfSummaryCard = { label: string; value: string };

export function ReportPdfDocument({
  companyName,
  companyCui,
  title,
  subtitle,
  periodLabel,
  generatedBy,
  generatedAt,
  summary,
  columns,
  rows,
  signatureLabels,
  orientation = "portrait",
}: {
  companyName: string;
  companyCui?: string | null;
  title: string;
  subtitle?: string;
  periodLabel: string;
  generatedBy: string;
  generatedAt: string;
  summary?: PdfSummaryCard[];
  columns: PdfColumn[];
  rows: PdfRow[];
  signatureLabels?: [string, string];
  orientation?: "portrait" | "landscape";
}) {
  return (
    <Document>
      <Page size="A4" orientation={orientation} style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>Franchise Tech</Text>
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>{companyName}</Text>
            {companyCui ? <Text style={styles.meta}>CUI: {companyCui}</Text> : null}
          </View>
        </View>

        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <Text style={styles.period}>{periodLabel}</Text>

        {summary && summary.length > 0 ? (
          <View style={styles.summaryRow}>
            {summary.map((s) => (
              <View key={s.label} style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{s.label}</Text>
                <Text style={styles.summaryValue}>{s.value}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]} fixed>
            {columns.map((c) => (
              <Text key={c.key} style={[styles.cell, { width: c.width, textAlign: c.align ?? "left" }]}>
                {c.label}
              </Text>
            ))}
          </View>
          {rows.map((r, i) => (
            <View
              key={i}
              style={[
                styles.row,
                r._rowStyle === "total" ? styles.totalRow : r._rowStyle === "section" ? styles.sectionRow : {},
              ]}
              wrap={false}
            >
              {columns.map((c) => (
                <Text key={c.key} style={[styles.cell, { width: c.width, textAlign: c.align ?? "left" }]}>
                  {String(r[c.key] ?? "")}
                </Text>
              ))}
            </View>
          ))}
        </View>

        {signatureLabels ? (
          <View style={styles.signatureRow}>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>{signatureLabels[0]}</Text>
              <Text style={styles.signatureLine}>Nume / Dată</Text>
            </View>
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>{signatureLabels[1]}</Text>
              <Text style={styles.signatureLine}>Nume / Dată</Text>
            </View>
          </View>
        ) : null}

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) =>
            `franchisetech.ro — Generat de ${generatedBy} la ${generatedAt} — Pagina ${pageNumber}/${totalPages}`
          }
        />
      </Page>
    </Document>
  );
}
