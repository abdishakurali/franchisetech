import { permanentRedirect } from "next/navigation";

// The hub page (/resources/suppliers) absorbed this route's content —
// sidebar + full unfiltered vendor grid now lives there directly, making
// this a duplicate. Redirect (rather than a bare 404) for anything that
// already linked or indexed this path.
export default function AllVendorsPage(): never {
  permanentRedirect("/resources/suppliers");
}
