import { redirect } from "next/navigation";

export default function SalesRedirect() {
  redirect("/app/transactions");
}
