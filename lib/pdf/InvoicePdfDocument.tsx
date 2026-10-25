import path from "node:path";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { invoiceLineAmounts, invoiceTotalsByRate } from "@/lib/invoice-totals";

// Romanian Factură laid out like the customer's sample: header, Furnizor /
// Client blocks, numbered lines (UM, cantitate, preț unitar, valoare + cotă,
// TVA), issuer/delegate block and per-rate VAT totals. Roboto for diacritics
// (see ReportPdfDocument.tsx).
const fontsDir = path.join(process.cwd(), "lib/pdf/fonts");
Font.register({
  family: "Roboto",
  fonts: [
    { src: path.join(fontsDir, "Roboto-Regular.ttf"), fontWeight: 400 },
    { src: path.join(fontsDir, "Roboto-Bold.ttf"), fontWeight: 700 },
  ],
});

export type InvoicePdfParty = {
  name: string;
  cif: string;
  regCom?: string | null;
  shareCapital?: string | null;
  address?: string | null;
  county?: string | null;
  bankAccounts?: Array<{ bank?: string | null; iban?: string | null; currency?: string | null }>;
};

export type InvoicePdfLine = {
  name: string;
  unitCode: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
};

export type InvoicePdfData = {
  number: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  seller: InvoicePdfParty;
  buyer: InvoicePdfParty;
  lines: InvoicePdfLine[];
  issuerName?: string | null;
  issuerIdDoc?: string | null;
  delegateName?: string | null;
  delegateIdDoc?: string | null;
  draft?: boolean;
  /** e.g. "Stornare factura nr. 19631 din 21.10.2026" */
  note?: string | null;
};

const UNIT_LABELS: Record<string, string> = {
  C62: "BUC", H87: "BUC", KGM: "KG", GRM: "G", LTR: "L", MLT: "ML", SET: "SET", MTR: "M", HUR: "ORE", DAY: "ZILE",
};

const fmt = (n: number, digits: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits, useGrouping: false });
const fmtTotal = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, " ");
const roDate = (iso?: string | null) => {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
};

const s = StyleSheet.create({
  page: { paddingTop: 34, paddingHorizontal: 34, paddingBottom: 42, fontSize: 8.5, fontFamily: "Roboto", color: "#172033" },
  title: { fontSize: 20, fontWeight: 700, letterSpacing: 0.8 },
  bold: { fontWeight: 700 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", borderBottom: 2, borderBottomColor: "#172033", paddingBottom: 10, marginBottom: 12 },
  documentMeta: { marginTop: 4, color: "#4b5563", lineHeight: 1.4 },
  currencyBadge: { backgroundColor: "#172033", color: "#fff", paddingVertical: 5, paddingHorizontal: 9, borderRadius: 2, fontSize: 8, fontWeight: 700 },
  parties: { flexDirection: "row", gap: 10 },
  party: { flex: 1, minHeight: 104, border: 1, borderColor: "#d7dce5", borderRadius: 3, padding: 9 },
  label: { fontSize: 7, color: "#687386", textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 4 },
  partyName: { fontSize: 10, fontWeight: 700, marginBottom: 5 },
  partyLine: { lineHeight: 1.35, color: "#374151" },
  table: { marginTop: 12, border: 1, borderColor: "#cfd5df", borderRadius: 2 },
  th: { flexDirection: "row", backgroundColor: "#eef1f5", borderBottom: 1, borderBottomColor: "#c2c9d4", paddingVertical: 5, paddingHorizontal: 4, fontSize: 7, fontWeight: 700, color: "#344054" },
  tr: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 4, borderBottom: 0.5, borderBottomColor: "#e4e7ec" },
  cNr: { width: "5%" },
  cName: { width: "38%" },
  cUm: { width: "7%", textAlign: "center" },
  cQty: { width: "10%", textAlign: "right" },
  cPrice: { width: "12%", textAlign: "right" },
  cValue: { width: "12%", textAlign: "right" },
  cRate: { width: "6%", textAlign: "right" },
  cVat: { width: "10%", textAlign: "right" },
  summary: { flexDirection: "row", gap: 14, marginTop: 12 },
  logistics: { flex: 1, borderTop: 1, borderTopColor: "#d7dce5", paddingTop: 7, color: "#4b5563", lineHeight: 1.45 },
  totals: { width: 235, border: 1, borderColor: "#cfd5df", borderRadius: 3 },
  totalsHead: { flexDirection: "row", backgroundColor: "#eef1f5", paddingVertical: 4, paddingHorizontal: 7, fontSize: 7, fontWeight: 700 },
  totRow: { flexDirection: "row", paddingVertical: 3, paddingHorizontal: 7 },
  totLabel: { width: "30%" },
  totBase: { width: "35%", textAlign: "right" },
  totVat: { width: "35%", textAlign: "right" },
  grand: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "#172033", color: "#fff", marginTop: 4, paddingVertical: 7, paddingHorizontal: 8, fontSize: 11, fontWeight: 700 },
  note: { marginBottom: 8, padding: 7, backgroundColor: "#fff7df", borderLeft: 3, borderLeftColor: "#d59b16" },
  draft: { position: "absolute", top: 360, left: 88, width: 420, textAlign: "center", fontSize: 48, fontWeight: 700, letterSpacing: 8, color: "#edf0f4" },
  pageFooter: { position: "absolute", left: 34, right: 34, bottom: 18, flexDirection: "row", justifyContent: "space-between", borderTop: 0.5, borderTopColor: "#d7dce5", paddingTop: 5, fontSize: 7, color: "#7b8494" },
});

function PartyBlock({ title, party }: { title: string; party: InvoicePdfParty }) {
  return (
    <View style={s.party}>
      <Text style={s.label}>{title}</Text>
      <Text style={s.partyName}>{party.name}</Text>
      <Text style={s.partyLine}>
        CIF {party.cif}
        {party.regCom ? `      RC ${party.regCom}` : ""}
      </Text>
      {party.shareCapital ? <Text style={s.partyLine}>Capital social: {party.shareCapital}</Text> : null}
      {party.address ? <Text style={s.partyLine}>{party.address}</Text> : null}
      {party.county ? <Text style={s.partyLine}>Județ: {party.county}</Text> : null}
      {(party.bankAccounts ?? []).filter((b) => b.iban).map((b, i) => (
        <View key={i}>
          {b.bank ? <Text style={s.partyLine}>{b.bank}</Text> : null}
          <Text style={s.partyLine}>IBAN {b.iban} · {b.currency ?? ""}</Text>
        </View>
      ))}
    </View>
  );
}

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const totals = invoiceTotalsByRate(data.lines);
  return (
    <Document title={`Factura ${data.number}`}>
      <Page size="A4" style={s.page}>
        {data.draft ? <Text style={s.draft}>CIORNĂ</Text> : null}
        <View style={s.headerRow}>
          <View>
            <Text style={s.title}>FACTURA</Text>
            <View style={s.documentMeta}>
              <Text>Număr: {data.number}</Text>
              <Text>Data emiterii: {roDate(data.issueDate)}</Text>
              {data.dueDate ? <Text>Data scadenței: {roDate(data.dueDate)}</Text> : null}
            </View>
          </View>
          <Text style={s.currencyBadge}>{data.currency}</Text>
        </View>
        {data.note ? <Text style={[s.bold, s.note]}>{data.note}</Text> : null}

        <View style={s.parties}>
          <PartyBlock title="Furnizor" party={data.seller} />
          <PartyBlock title="Client" party={data.buyer} />
        </View>

        <View style={s.table}>
          <View style={s.th}>
            <Text style={s.cNr}>Nr. crt.</Text>
            <Text style={s.cName}>Denumire produse/servicii</Text>
            <Text style={s.cUm}>UM</Text>
            <Text style={s.cQty}>Cantitate</Text>
            <Text style={s.cPrice}>Pret unitar</Text>
            <Text style={s.cValue}>Valoare</Text>
            <Text style={s.cRate}>Cotă</Text>
            <Text style={s.cVat}>TVA</Text>
          </View>
          {data.lines.map((line, i) => {
            const amounts = invoiceLineAmounts(line);
            return (
              <View key={i} style={s.tr} wrap={false}>
                <Text style={s.cNr}>{i + 1}</Text>
                <Text style={s.cName}>{line.name}</Text>
                <Text style={s.cUm}>{UNIT_LABELS[line.unitCode] ?? line.unitCode}</Text>
                <Text style={s.cQty}>{fmt(line.quantity, 3)}</Text>
                <Text style={s.cPrice}>{fmt(line.unitPrice, 4)}</Text>
                <Text style={s.cValue}>{fmt(amounts.value, 2)}</Text>
                <Text style={s.cRate}>{fmt(line.vatRate, 0)}%</Text>
                <Text style={s.cVat}>{fmt(amounts.vat, 2)}</Text>
              </View>
            );
          })}
        </View>

        <View style={s.summary} wrap={false}>
          <View style={s.logistics}>
            <Text style={s.label}>Emitent și expediție</Text>
            <Text>Emis de</Text>
            <Text style={s.bold}>{data.issuerName ?? ""}</Text>
            {data.issuerIdDoc ? <Text>CI {data.issuerIdDoc}</Text> : null}
            <Text style={{ marginTop: 5 }}>Delegat: {data.delegateName ?? "—"}</Text>
            <Text>C.I. seria/nr.: {data.delegateIdDoc ?? "—"}</Text>
          </View>
          <View style={s.totals}>
            <View style={s.totalsHead}>
              <Text style={s.totLabel}>Cotă TVA</Text>
              <Text style={s.totBase}>Bază</Text>
              <Text style={s.totVat}>TVA</Text>
            </View>
            {totals.rates.map((r) => (
              <View key={r.rate} style={s.totRow}>
                <Text style={s.totLabel}>{fmt(r.rate, 0)}%</Text>
                <Text style={s.totBase}>{fmt(r.base, 2)}</Text>
                <Text style={s.totVat}>{fmt(r.vat, 2)}</Text>
              </View>
            ))}
            <View style={s.totRow}>
              <Text style={[s.totLabel, s.bold]}>Subtotal</Text>
              <Text style={[s.totBase, s.bold]}>{fmt(totals.base, 2)}</Text>
              <Text style={[s.totVat, s.bold]}>{fmt(totals.vat, 2)}</Text>
            </View>
            <View style={s.grand}>
              <Text>TOTAL DE PLATĂ</Text>
              <Text>{fmtTotal(totals.total)} {data.currency}</Text>
            </View>
          </View>
        </View>
        <View style={s.pageFooter} fixed>
          <Text>Document generat de FranchiseTech</Text>
          <Text render={({ pageNumber, totalPages }) => `Pagina ${pageNumber} din ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
