"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PosRegister } from "@/components/app/PosRegister";
import { PosFirstSaleTour } from "@/components/app/PosFirstSaleTour";
import { resetTour } from "@/components/app/TourOverlay";
import {
  catalogCacheAgeLabel,
  readPosCatalogCache,
  writePosCatalogCache,
} from "@/lib/pos-catalog-cache";
import { invalidateProbeCache, probeServerOnline } from "@/lib/pos-offline-queue";
import type { PosLocale } from "@/lib/pos-i18n";

type PosRegisterProps = React.ComponentProps<typeof PosRegister> & {
  orgId?: string;
  appLocale?: PosLocale;
  trackActivationSale?: boolean;
};

function mergeCatalogProps(props: PosRegisterProps, cached: ReturnType<typeof readPosCatalogCache>, offline: boolean) {
  if (!cached?.products.length) return props;
  const useCache = offline || !props.products?.length;
  if (!useCache) return props;
  return {
    ...props,
    products: cached.products as PosRegisterProps["products"],
    categories: (cached.categories.length ? cached.categories : props.categories) as PosRegisterProps["categories"],
    paymentMethods: (cached.paymentMethods.length ? cached.paymentMethods : props.paymentMethods) as PosRegisterProps["paymentMethods"],
    sgrProduct: (cached.sgrProduct ?? props.sgrProduct) as PosRegisterProps["sgrProduct"],
    sgrEnabled: cached.sgrEnabled ?? props.sgrEnabled,
    vatRateGroupMap: Object.keys(cached.vatRateGroupMap ?? {}).length ? cached.vatRateGroupMap : props.vatRateGroupMap,
    defaultVatRate: cached.defaultVatRate ?? props.defaultVatRate,
    sessionId: props.sessionId ?? cached.sessionId,
    currency: props.currency ?? cached.currency,
    catalogOffline: offline,
    catalogCachedAt: cached.cachedAt,
  };
}

function buildRegisterProps(props: PosRegisterProps, offline: boolean) {
  const orgId = props.orgId ?? "";
  if (orgId && props.products?.length) {
    writePosCatalogCache({
      orgId,
      products: props.products,
      categories: props.categories ?? [],
      paymentMethods: props.paymentMethods ?? [],
      sgrProduct: props.sgrProduct ?? null,
      sgrEnabled: props.sgrEnabled ?? false,
      vatRateGroupMap: props.vatRateGroupMap ?? {},
      defaultVatRate: props.defaultVatRate ?? 0,
      sessionId: props.sessionId ?? undefined,
      currency: props.currency,
      cachedAt: new Date().toISOString(),
    });
  }
  const cached = readPosCatalogCache(orgId);
  const merged = mergeCatalogProps(props, cached, offline);
  return {
    ...merged,
    catalogOffline: offline || Boolean(merged.catalogOffline),
    catalogCachedAt: merged.catalogCachedAt ?? cached?.cachedAt ?? null,
  };
}

const FIRST_SALE_TOUR_ID = "pos_first_sale";

function PosRegisterWithCatalog(props: PosRegisterProps) {
  const searchParams = useSearchParams();
  const welcomeFlow = searchParams.get("welcome") === "1";
  const tourParam = searchParams.get("tour") === "first_sale";
  const shouldOfferTour = welcomeFlow || tourParam;

  const [offline, setOffline] = useState(false);
  const [tourNonce, setTourNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const probe = async () => {
      const online = await probeServerOnline();
      if (!cancelled) setOffline(!online);
    };
    const onOffline = () => {
      invalidateProbeCache();
      setOffline(true);
    };
    const onOnline = () => {
      invalidateProbeCache();
      void probe();
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    void probe();
    return () => {
      cancelled = true;
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    const onStartTour = () => {
      resetTour(FIRST_SALE_TOUR_ID);
      setTourNonce((n) => n + 1);
    };
    window.addEventListener("fp-start-first-sale-tour", onStartTour);
    return () => window.removeEventListener("fp-start-first-sale-tour", onStartTour);
  }, []);

  const registerProps = useMemo(
    () => buildRegisterProps(props, offline),
    [props, offline],
  );

  return (
    <>
      {shouldOfferTour ? (
        <PosFirstSaleTour key={tourNonce} locale={props.appLocale ?? "ro"} />
      ) : null}
      <PosRegister {...registerProps} />
    </>
  );
}

export function PosWithTour(props: PosRegisterProps) {
  const boot = buildRegisterProps(props, false);
  return (
    <Suspense fallback={<PosRegister {...boot} />}>
      <PosRegisterWithCatalog {...props} />
    </Suspense>
  );
}

export { catalogCacheAgeLabel };
