import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { ReactNode } from "react";

/**
 * The one shared shell for a settings list section (units, payment methods,
 * categories, location) — title, description, an optional add-row form,
 * then the existing rows. Built once (Step 8) instead of five slightly
 * different Card layouts, so add/rename/retire look and behave the same
 * everywhere a staff member encounters them.
 */
export function SettingsSection({
  title,
  description,
  addForm,
  children,
}: {
  title: string;
  description?: string;
  addForm?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-4">
        {addForm ? <div className="pb-1">{addForm}</div> : null}
        <div className="space-y-2">{children}</div>
      </CardContent>
    </Card>
  );
}
