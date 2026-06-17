import { redirect } from "next/navigation";

// History is now the Checks page — simpler, one place for all records
export default function HistoryPage() {
  redirect("/app/checks");
}
