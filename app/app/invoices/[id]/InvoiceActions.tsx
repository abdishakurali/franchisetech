"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateInvoiceXml, submitInvoiceToAnaf } from "@/app/actions/efactura";
import { Loader2, FileCode, Send, CheckCircle } from "lucide-react";

type Props = {
  invoiceId: string;
  canSubmit: boolean;
  isSubmitted: boolean;
  anafConnected: boolean;
  hasXml: boolean;
};

export default function InvoiceActions({ invoiceId, canSubmit, isSubmitted, anafConnected, hasXml }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [action, setAction] = useState<"xml" | "submit" | null>(null);
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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
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
              <p className="self-center text-xs text-slate-500">
                Conexiune ANAF necesară —{" "}
                <a href="/app/settings?tab=anaf" className="underline text-blue-600">configurează în Setări</a>
              </p>
            )}
          </>
        )}

        {isSubmitted && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CheckCircle className="h-4 w-4 text-green-500" />
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
      </div>

      {submitResult && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          Factură trimisă! Index încărcare ANAF:{" "}
          <span className="font-mono font-medium">{submitResult.indexIncarcare}</span>
        </div>
      )}

      {xmlResult && (
        <div className={`rounded-lg border p-3 text-sm ${xmlResult.valid ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
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
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showXml && xmlResult?.xml && (
        <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-950 p-4 text-xs text-slate-100 max-h-96">
          {xmlResult.xml}
        </pre>
      )}
    </div>
  );
}
