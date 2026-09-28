-- SGR (Sistem de Garanție-Returnare) — Romanian container deposit scheme
-- Products that carry a deposit get has_sgr = true
-- The org-level flag controls whether the POS auto-adds the SGR product

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS has_sgr boolean NOT NULL DEFAULT false;

ALTER TABLE public.organisations
  ADD COLUMN IF NOT EXISTS sgr_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.products.has_sgr IS
  'Romania SGR: if true, POS auto-adds the SGR deposit product when this item is sold';

COMMENT ON COLUMN public.organisations.sgr_enabled IS
  'Romania SGR: enables automatic SGR deposit product in the POS for this organisation';
