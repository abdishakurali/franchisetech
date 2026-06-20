"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PosRegister } from "@/components/app/PosRegister";
import { PosFirstSaleTour } from "@/components/app/PosFirstSaleTour";

type PosRegisterProps = React.ComponentProps<typeof PosRegister>;

function PosWithTourInner(props: PosRegisterProps) {
  const searchParams = useSearchParams();
  const showTour = searchParams.get("tour") === "first_sale";

  return (
    <>
      {showTour ? <PosFirstSaleTour /> : null}
      <PosRegister {...props} />
    </>
  );
}

export function PosWithTour(props: PosRegisterProps) {
  return (
    <Suspense fallback={<PosRegister {...props} />}>
      <PosWithTourInner {...props} />
    </Suspense>
  );
}
