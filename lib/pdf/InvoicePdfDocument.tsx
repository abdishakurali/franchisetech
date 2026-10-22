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
  page: { padding: 32, fontSize: 8.5, fontFamily: "Roboto", color: "#111" },
  title: { fontSize: 15, fontWeight: 700 },
  bold: { fontWeight: 700 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 },
  parties: { flexDirection: "row", borderTop: 1, borderTopColor: "#111", paddingTop: 4, gap: 16 },
  party: { flex: 1 },
  label: { fontSize: 7.5, color: "#444", marginBottom: 2 },
  partyName: { fontSize: 9.5, fontWeight: 700, marginBottom: 6 },
  table: { marginTop: 10, borderTop: 1, borderTopColor: "#111" },
  th: { flexDirection: "row", borderBottom: 1, borderBottomColor: "#111", paddingVertical: 3 },
  tr: { flexDirection: "row", paddingVertical: 2.5 },
  cNr: { width: "5%" },
  cName: { width: "38%" },
  cUm: { width: "7%", textAlign: "center" },
  cQty: { width: "10%", textAlign: "right" },
  cPrice: { width: "12%", textAlign: "right" },
  cValue: { width: "12%", textAlign: "right" },
  cRate: { width: "6%", textAlign: "right" },
  cVat: { width: "10%", textAlign: "right" },
  footer: { flexDirection: "row", borderTop: 1, borderTopColor: "#111", marginTop: 4, paddingTop: 4 },
  footLeft: { width: "30%" },
  footMid: { width: "32%" },
  footRight: { width: "38%" },
  totRow: { flexDirection: "row", justifyContent: "flex-end" },
  totLabel: { width: "30%" },
  totBase: { width: "35%", textAlign: "right" },
  totVat: { width: "35%", textAlign: "right" },
  grand: { flexDirection: "row", justifyContent: "space-between", borderTop: 1, borderTopColor: "#111", marginTop: 6, paddingTop: 4, fontSize: 10, fontWeight: 700, marginLeft: "62%" },
  draft: { position: "absolute", top: 300, left: 120, fontSize: 60, color: "#e5e7eb", transform: "rotate(-30deg)" },
});

function PartyBlock({ title, party }: { title: string; party: InvoicePdfParty }) {
  return (
    <View style={s.party}>
      <Text style={s.label}>{title}</Text>
      <Text style={s.partyName}>{party.name}</Text>
      <Text>
        CIF {party.cif}
        {party.regCom ? `      RC ${party.regCom}` : ""}
      </Text>
      {party.shareCapital ? <Text>Capital soc. {party.shareCapital}</Text> : null}
      {party.address ? <Text>{party.address}</Text> : null}
      {party.county ? <Text>jud. {party.county}</Text> : null}
      {(party.bankAccounts ?? []).filter((b) => b.iban).map((b, i) => (
        <View key={i}>
          {b.bank ? <Text>{b.bank}</Text> : null}
          <Text>IBAN {b.iban}   {b.currency ?? ""}</Text>
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
            <Text style={s.bold}>Numar {data.number}</Text>
            <Text style={s.bold}>
              Data {roDate(data.issueDate)}
              {data.dueDate ? `      Scadent la ${roDate(data.dueDate)}` : ""}
            </Text>
          </View>
          <Text>- {data.currency} -</Text>
        </View>
        {data.note ? <Text style={[s.bold, { marginBottom: 6 }]}>{data.note}</Text> : null}

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
            <Text style={s.cRate}> </Text>
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

        <View style={s.footer} wrap={false}>
          <View style={s.footLeft}>
            <Text>Emis de</Text>
            <Text style={s.bold}>{data.issuerName ?? ""}</Text>
            {data.issuerIdDoc ? <Text>CI {data.issuerIdDoc}</Text> : null}
          </View>
          <View style={s.footMid}>
            <Text>Date privind expeditia</Text>
            <Text>Numele delegatului: {data.delegateName ?? ""}</Text>
            <Text>C.I. seria/nr: {data.delegateIdDoc ?? ""}</Text>
          </View>
          <View style={s.footRight}>
            {totals.rates.map((r) => (
              <View key={r.rate} style={s.totRow}>
                <Text style={s.totLabel}>{fmt(r.rate, 0)}%</Text>
                <Text style={s.totBase}>{fmt(r.base, 2)}</Text>
                <Text style={s.totVat}>{fmt(r.vat, 2)}</Text>
              </View>
            ))}
            <View style={s.totRow}>
              <Text style={[s.totLabel, s.bold]}>Total</Text>
              <Text style={[s.totBase, s.bold]}>{fmt(totals.base, 2)}</Text>
              <Text style={[s.totVat, s.bold]}>{fmt(totals.vat, 2)}</Text>
            </View>
          </View>
        </View>
        <View style={s.grand} wrap={false}>
          <Text>Total</Text>
          <Text>{fmtTotal(totals.total)}</Text>
        </View>
      </Page>
    </Document>
  );
}
