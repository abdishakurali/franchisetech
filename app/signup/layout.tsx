import { Suspense } from "react";

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}
