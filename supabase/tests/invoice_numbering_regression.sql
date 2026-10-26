\set ON_ERROR_STOP on
begin;

insert into public.organisations (id, name, invoice_series, invoice_next_number)
values ('00000000-0000-4000-8000-000000000901', 'Invoice numbering regression', 'TEST-', 900);

insert into public.products (
  id, organisation_id, name, is_stock_tracked, current_stock_qty, unit_of_measure
) values (
  '00000000-0000-4000-8000-000000000902',
  '00000000-0000-4000-8000-000000000901',
  'Tracked test product', true, 10, 'each'
);

insert into public.efactura_invoices (
  id, organisation_id, invoice_number, issue_date, buyer_cif, buyer_name, line_items
) values (
  '00000000-0000-4000-8000-000000000903',
  '00000000-0000-4000-8000-000000000901',
  'CIORNA-REGRESSION', current_date, 'RO12345678', 'Regression buyer',
  '[{"productId":"00000000-0000-4000-8000-000000000902","stockQty":1,"quantity":1,"name":"Tracked test product","unitCode":"C62","unitPrice":1,"vatRate":0}]'::jsonb
);

select public.issue_sales_invoice(
  '00000000-0000-4000-8000-000000000901', null,
  '00000000-0000-4000-8000-000000000903'
);

do $$
begin
  if (select invoice_number from public.efactura_invoices where id = '00000000-0000-4000-8000-000000000903') <> 'TEST-900' then
    raise exception 'Invoice issue did not allocate TEST-900';
  end if;
  if (select invoice_next_number from public.organisations where id = '00000000-0000-4000-8000-000000000901') <> 901 then
    raise exception 'Invoice counter did not advance exactly once';
  end if;
  if (select current_stock_qty from public.products where id = '00000000-0000-4000-8000-000000000902') <> 9 then
    raise exception 'Invoice issue did not deduct tracked stock once';
  end if;
  if (select count(*) from public.stock_movements where reference_id = '00000000-0000-4000-8000-000000000903') <> 1 then
    raise exception 'Invoice issue did not create exactly one stock movement';
  end if;
end;
$$;

select public.issue_sales_invoice(
  '00000000-0000-4000-8000-000000000901', null,
  '00000000-0000-4000-8000-000000000903'
);

do $$
begin
  if (select invoice_next_number from public.organisations where id = '00000000-0000-4000-8000-000000000901') <> 901 then
    raise exception 'Retry advanced the invoice counter';
  end if;
  if (select current_stock_qty from public.products where id = '00000000-0000-4000-8000-000000000902') <> 9 then
    raise exception 'Retry deducted stock again';
  end if;
end;
$$;

rollback;
