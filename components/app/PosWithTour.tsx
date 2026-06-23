"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PosRegister } from "@/components/app/PosRegister";
import { PosFirstSaleTour } from "@/components/app/PosFirstSaleTour";
import {
  catalogCacheAgeLabel,
  readPosCatalogCache,
  writePosCatalogCache,
} from "@/lib/pos-catalog-cache";
import { isBrowserOnline } from "@/lib/pos-offline-queue";
import type { PosLocale } from "@/lib/pos-i18n";

type PosRegisterProps = React.ComponentProps<typeof PosRegister> & {
  orgId?: string;
  appLocale?: PosLocale;
};

function mergeCatalogProps(props: PosRegisterProps, cached: ReturnType<typeof readPosCatalogCache>) {
  if (!cached?.products.length) return props;
  const useCache = !isBrowserOnline() || !props.products?.length;
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
    catalogOffline: !isBrowserOnline(),
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
  const merged = mergeCatalogProps(props, cached);
  return {
    ...merged,
    catalogOffline: offline || Boolean(merged.catalogOffline),
    catalogCachedAt: merged.catalogCachedAt ?? cached?.cachedAt ?? null,
  };
}

function PosRegisterWithCatalog(props: PosRegisterProps) {
  const searchParams = useSearchParams();
  const showTour = searchParams.get("tour") === "first_sale";
  const orgId = props.orgId ?? "";

  const [offline, setOffline] = useState(() => !isBrowserOnline());

  useEffect(() => {
    const sync = () => setOffline(!isBrowserOnline());
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    sync();
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  const registerProps = useMemo(
    () => buildRegisterProps(props, offline),
    [
      props,
      orgId,
      offline,
      props.products,
      props.categories,
      props.paymentMethods,
      props.sgrProduct,
      props.sgrEnabled,
      props.vatRateGroupMap,
      props.defaultVatRate,
      props.sessionId,
      props.currency,
    ],
  );

  return (
    <>
      {showTour ? <PosFirstSaleTour /> : null}
      <PosRegister {...registerProps} />
    </>
  );
}

export function PosWithTour(props: PosRegisterProps) {
  const boot = buildRegisterProps(props, typeof navigator !== "undefined" ? !navigator.onLine : false);
  return (
    <Suspense fallback={<PosRegister {...boot} />}>
      <PosRegisterWithCatalog {...props} />
    </Suspense>
  );
}

export { catalogCacheAgeLabel };
