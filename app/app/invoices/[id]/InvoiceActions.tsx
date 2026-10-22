"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateInvoiceXml, issueSalesInvoice, submitInvoiceToAnaf } from "@/app/actions/efactura";
import { Loader2, FileCode, Send, CheckCircle, Download, FileText, Stamp } from "lucide-react";

type Props = {
  invoiceId: string;
  canSubmit: boolean;
  isSubmitted: boolean;
  anafConnected: boolean;
  hasXml: boolean;
  issued: boolean;
};

export default function InvoiceActions({ invoiceId, canSubmit, isSubmitted, anafConnected, hasXml, issued }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"xml" | "submit" | "issue" | null>(null);
  const [issueMessage, setIssueMessage] = useState<string | null>(null);
  const issuingRef = useRef(false);

  function handleIssue() {
    if (issuingRef.current) return;
    if (!window.confirm("Emiteți factura? După emitere nu mai poate fi modificată, iar cantitățile se scad din stoc.")) return;
    issuingRef.current = true;
    setError(null);
    setAction("issue");
    startTransition(async () => {
      try {
        const result = await issueSalesInvoice(invoiceId);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setIssueMessage(
          result.alreadyIssued
            ? "Factura era deja emisă. Stocul nu a fost scăzut din nou."
            : `Factură emisă. ${result.movements} mișcări de stoc înregistrate.`,
        );
        router.refresh();
      } finally {
        issuingRef.current = false;
        setAction(null);
      }
    });
  }
  const [xmlResult, setXmlResult] = useState<{ valid: boolean; errors: string[]; xml?: string } | null>(null);
  const [showXml, setShowXml] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ indexIncarcare: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleGenerateXml() {
    setError(null);
    setAction("xml");
    startTransition(async () => {
      try {
        const result = await generateInvoiceXml(invoiceId);
        setXmlResult(result);
        if (result.valid) {
          setShowXml(false);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la generarea XML");
      } finally {
        setAction(null);
      }
    });
  }

  function handleSubmit() {
    setError(null);
    setAction("submit");
    startTransition(async () => {
      try {
        const result = await submitInvoiceToAnaf(invoiceId);
        setSubmitResult(result);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Eroare la trimiterea facturii");
      } finally {
        setAction(null);
      }
    });
  }

  function handleDownloadXml() {
    if (!xmlResult?.xml) return;
    const blob = new Blob([xmlResult.xml], { type: "application/xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `efactura-${invoiceId}.xml`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        {!issued && (
          <Button onClick={handleIssue} disabled={isPending}>
            {action === "issue" && isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Stamp className="mr-1.5 h-4 w-4" />}
            {action === "issue" && isPending ? "Se emite…" : "Emite factura"}
          </Button>
        )}
        <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noopener">
          <Button type="button" variant="outline">
            <FileText className="mr-1.5 h-4 w-4" />
            {issued ? "Descarcă PDF" : "Previzualizare PDF (ciornă)"}
          </Button>
        </a>
        {canSubmit && (
          <>
            <Button
              variant="outline"
              onClick={handleGenerateXml}
              disabled={isPending}
            >
              {action === "xml" && isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <FileCode className="mr-1.5 h-4 w-4" />
              )}
              Generează XML + validează
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={isPending || !anafConnected}
              title={!anafConnected ? "Conectează-te la ANAF din Setări → e-Factura" : undefined}
            >
              {action === "submit" && isPending ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-1.5 h-4 w-4" />
              )}
              Trimite la ANAF
            </Button>

            {!anafConnected && (
              <p className="self-center text-xs text-muted-foreground">
                Conexiune ANAF necesară —{" "}
                <a href="/app/settings?tab=anaf" className="underline text-brass">configurează în Setări</a>
              </p>
            )}
          </>
        )}

        {isSubmitted && (
          <div className="flex items-center gap-2 text-sm text-mid">
            <CheckCircle className="h-4 w-4 text-reconciled" />
            Factură trimisă la ANAF
          </div>
        )}

        {(hasXml || xmlResult?.xml) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowXml((v) => !v)}
          >
            {showXml ? "Ascunde XML" : "Vizualizează XML"}
          </Button>
        )}

        {xmlResult?.xml && (
          <Button variant="outline" size="sm" onClick={handleDownloadXml}>
            <Download className="mr-1.5 h-4 w-4" />
            Descarcă XML
          </Button>
        )}
      </div>

      {issueMessage && (
        <div className="rounded-lg bg-reconciled/10 border border-reconciled/25 p-3 text-sm text-reconciled">{issueMessage}</div>
      )}

      {submitResult && (
        <div className="rounded-lg bg-reconciled/10 border border-reconciled/25 p-3 text-sm text-reconciled">
          Factură trimisă! Index încărcare ANAF:{" "}
          <span className="font-mono font-medium">{submitResult.indexIncarcare}</span>
        </div>
      )}

      {xmlResult && (
        <div className={`rounded-lg border p-3 text-sm ${xmlResult.valid ? "bg-reconciled/10 border-reconciled/25 text-reconciled" : "bg-attention/10 border-attention/25 text-attention"}`}>
          {xmlResult.valid ? (
            <p className="font-medium">XML valid conform ANAF CIUS-RO</p>
          ) : (
            <>
              <p className="font-medium">XML invalid — erori de validare:</p>
              <ul className="mt-1 list-disc list-inside space-y-0.5">
                {xmlResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </>
          )}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-attention/10 border border-attention/25 p-3 text-sm text-attention">
          {error}
        </div>
      )}

      {showXml && xmlResult?.xml && (
        <pre className="overflow-x-auto rounded-lg border border-border bg-ink p-4 text-xs text-paper max-h-96">
          {xmlResult.xml}
        </pre>
      )}
    </div>
  );
}
