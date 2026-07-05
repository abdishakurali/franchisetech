"use client";

import { useState } from "react";
import { MessageSquareHeart, Star } from "lucide-react";
import { submitTestimonial } from "@/app/actions/testimonials";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function TestimonialPromptCard() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const form = e.currentTarget;
    const data = new FormData(form);
    if (rating) data.set("rating", String(rating));

    const result = await submitTestimonial(data);
    if (!result.success) {
      setStatus("error");
      setError(result.error ?? "A apărut o eroare. Încearcă din nou.");
      return;
    }
    setStatus("success");
    form.reset();
    setRating(null);
  }

  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50/40">
        <CardContent className="flex items-center gap-3 py-5">
          <MessageSquareHeart className="h-5 w-5 shrink-0 text-green-600" />
          <p className="text-sm text-green-900">
            Mulțumim! Feedback-ul tău va apărea pe site după verificare.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquareHeart className="h-4 w-4 text-blue-600" />
          Cum merge cu franchisetech?
        </CardTitle>
        <CardDescription>
          Spune-ne într-o propoziție. Cu acordul tău, poate apărea pe site — după verificare.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-3">
          <Textarea
            name="quote"
            required
            minLength={20}
            maxLength={1000}
            rows={3}
            placeholder="Ex: Închidem ziua în 5 minute în loc de o oră, iar diferențele de casă au dispărut."
          />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                aria-label={`${n} stele`}
                onClick={() => setRating(rating === n ? null : n)}
                className="p-0.5"
              >
                <Star
                  className={`h-5 w-5 ${rating !== null && n <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                />
              </button>
            ))}
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={status === "loading"}>
              {status === "loading" ? "Se trimite…" : "Trimite feedback"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setDismissed(true)}>
              Nu acum
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
