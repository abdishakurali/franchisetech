export type SetupStep = {
  id: string;
  title: string;
  text: string;
  href: string;
  label: string;
  done: boolean;
  status?: string;
  section: "core" | "advanced" | "multi_site" | "billing";
};
