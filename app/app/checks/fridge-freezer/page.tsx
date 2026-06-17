import { redirect } from "next/navigation";

// Merged into /app/checks with a category filter
export default function FridgeFreezerPage() {
  redirect("/app/checks?category=cold_storage");
}
