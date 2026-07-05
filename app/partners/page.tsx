import { permanentRedirect } from "next/navigation";

// The partner/reseller program page has been retired in favor of the
// public HoReCa vendor/supplier directory. Redirect (rather than a bare
// 404) so any existing inbound/indexed links land somewhere useful.
export default function PartnersPage(): never {
  permanentRedirect("/resources/suppliers");
}
