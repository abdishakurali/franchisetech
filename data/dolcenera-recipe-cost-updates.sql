-- Dolce Nera: UPDATE cost fields on existing recipe_items, matched to Odoo BOM lines by ingredient name.
-- Only unit_cost / total_cost / unit_cost_snapshot change. quantity, unit_of_measure, ingredient_product_id untouched.
-- NOT YET APPLIED.

UPDATE recipe_items SET unit_cost = 0.555, total_cost = 0.555, unit_cost_snapshot = 0.555 WHERE id = 'f8a2c942-4ad7-4777-b1a1-b4e34838fc2b';  -- CEAI FRUCTE DE PADURE in CEAI FRUCTE DE PADURE 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '8789bb81-10e5-41de-ab53-afb59e8f5b26';  -- CAPAC SL45 in CEAI FRUCTE DE PADURE 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'fdf1c589-28ad-4251-8f98-a9faa99b855e';  -- PAHAR 16 OZ in CEAI FRUCTE DE PADURE 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '3ae19b78-c765-42a6-ae98-6392f0fc9c68';  -- PALETE in CEAI FRUCTE DE PADURE 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '8530d786-c475-465e-8e6b-0b59e7086713';  -- MIERE PLIC in CEAI FRUCTE DE PADURE 480ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '21ddd98b-0e59-4499-a97a-eff44941c9a8';  -- PAHAR 12 OZ in AMERICANO - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '0bded737-bfc9-4982-83ae-cf2b39dfab31';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in AMERICANO - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'ed322919-05e1-4654-b305-a68b6942cf4c';  -- ZAHAR BRUN 5 GR in AMERICANO - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'db06b297-f682-427b-80cc-c70b0d583057';  -- CAPAC SL37 in AMERICANO - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c2d652b0-6c0d-49fc-8a7f-51f563bdde61';  -- PALETE in AMERICANO - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '46845e5d-3c69-417e-a500-ca6806955d93';  -- PAHAR 12 OZ in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = 'ffe6bb8c-bebf-4a14-b730-c78375b5ba62';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '378f970d-929c-4f9b-8eab-7a7bf93802b3';  -- ZAHAR BRUN 5 GR in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.12, unit_cost_snapshot = 6.0 WHERE id = 'ae5abd8d-0bca-4b1f-a1e2-4562e0eb1c05';  -- LAPTE BIO UHT in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'dc766e7a-5eca-4aaf-8b2d-ca97c57c14a4';  -- PALETE in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '7e6125d6-a409-4e25-bbd5-d3060553da08';  -- CAPAC SL37 in LATTE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'c5cb7bbc-2e07-480f-95df-52bdc2318e64';  -- CAPAC SL45 in CEAI VERDE SENCHA MANGO 480ml
UPDATE recipe_items SET unit_cost = 0.5328, total_cost = 0.5328, unit_cost_snapshot = 0.5328 WHERE id = '8c6e99dc-dd40-4379-aede-97fa8fcda8bf';  -- CEAI VERDE SENCHA MANGO in CEAI VERDE SENCHA MANGO 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '100d31f6-64b7-4c88-a29d-142381803436';  -- PAHAR 16 OZ in CEAI VERDE SENCHA MANGO 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'fbe59cab-b4c2-4a86-8151-239de70852bf';  -- PALETE in CEAI VERDE SENCHA MANGO 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = 'bbebadd9-cd79-43ce-8e32-bc6e57859d4c';  -- MIERE PLIC in CEAI VERDE SENCHA MANGO 480ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '5844495f-0e5e-49b8-88a6-937045f7a346';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in DOUBLE ESPRESSO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'c30c9322-8e13-416e-9165-a76b52a29860';  -- PAHAR 6 OZ in DOUBLE ESPRESSO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'fbd6d727-9f0c-4e22-a919-e115df22ea37';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE ESPRESSO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '797828aa-6c01-4e7f-a6d2-eda933cf46aa';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in DOUBLE RISTRETTO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'd8d7670f-eb17-4e71-bedb-8757040dd9f0';  -- PAHAR 6 OZ in DOUBLE RISTRETTO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'd5ca5919-fecc-4833-ab63-6962a389867d';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE RISTRETTO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = '8241baab-d894-40b8-87c6-b1856cdd1f49';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE ESPRESSO - BARI S.O. 60ml 
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '4b3de08e-bb40-4898-be38-15a12aaa5d9d';  -- PAHAR 6 OZ in DOUBLE ESPRESSO - BARI S.O. 60ml 
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '76e4684e-4f26-4985-a307-9f51ef5abd65';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in DOUBLE ESPRESSO - BARI S.O. 60ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '8dfc4b93-471d-4456-89b0-e3088581cdd5';  -- ZAHAR BRUN 5 GR in DOUBLE ESPRESSO - BARI S.O. 60ml 
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'e64c30e7-22cc-4629-99d9-0caf2099bac8';  -- PALETE in DOUBLE ESPRESSO - BARI S.O. 60ml 
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = '1b5ecd76-b13c-4bef-8f3e-23ac08908982';  -- PAHAR 8 OZ in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '69454498-3dd1-414f-b6b6-01dc4fe585b8';  -- ZAHAR BRUN 5 GR in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '9dd812b6-d684-43e2-9142-a92d2ce64aed';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.08, unit_cost_snapshot = 6.0 WHERE id = '51947aa0-8835-48ed-a4de-8b5509d5c367';  -- LAPTE BIO UHT in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'b268f8eb-196f-41dc-ab6e-ce724476248c';  -- PALETE in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '2c2bed48-a009-41c3-84f7-9ec3764e70a2';  -- CAPAC SL37 in CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '132c6a67-4ad1-4542-9f92-bb684b909810';  -- CAPAC SL45 in CEAI LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '56096c61-7489-45dd-b9cb-00fba1d8d9ad';  -- PAHAR 16 OZ in CEAI LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.555, total_cost = 0.555, unit_cost_snapshot = 0.555 WHERE id = '288b633e-58f1-425b-bd12-22fc3b9cf1b5';  -- CEAI LAMAIE in CEAI LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '5f6a2348-e3aa-4c7c-98ba-145a37acf0c6';  -- PALETE in CEAI LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '6f8908a9-4c77-45cf-b110-634d1f16fae3';  -- MIERE PLIC in CEAI LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 2.2, total_cost = 2.2, unit_cost_snapshot = 2.2 WHERE id = 'cf5d0f9a-19d0-4457-a9fc-f714b390d738';  -- CEAI DARJEELING in CEAI NEGRU DARJEELING 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'c89febcf-8b7a-4d20-bb38-5bb3ba2f5bb2';  -- CAPAC SL45 in CEAI NEGRU DARJEELING 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'ab8d530c-3344-4dad-893f-eafbe12f51a8';  -- PAHAR 16 OZ in CEAI NEGRU DARJEELING 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '156e599b-4a64-45ca-b0c5-2c591f03bf80';  -- PALETE in CEAI NEGRU DARJEELING 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = 'c86079eb-fc67-41ff-b287-05cd72d5b8f5';  -- MIERE PLIC in CEAI NEGRU DARJEELING 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'a78d1447-02f5-4cbc-b520-5ea68f95ba21';  -- CAPAC SL45 in CEAI LAMAIE & GHIMBIR 480ml
UPDATE recipe_items SET unit_cost = 0.555, total_cost = 0.555, unit_cost_snapshot = 0.555 WHERE id = 'a1ab49dc-9c01-4a8c-961e-df8df93ba5bf';  -- CEAI GHIMBIR & LAMAIE in CEAI LAMAIE & GHIMBIR 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '5b4e3e31-4d96-45e1-84bc-eadd9b74ee05';  -- PAHAR 16 OZ in CEAI LAMAIE & GHIMBIR 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '6a8d128e-95bb-4623-9117-255aa695e0e3';  -- PALETE in CEAI LAMAIE & GHIMBIR 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = 'f72de334-b020-4061-b139-f7ba97a15b30';  -- MIERE PLIC in CEAI LAMAIE & GHIMBIR 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '271a4c19-b5b5-4dfd-b9ab-2fdc688c0fee';  -- CAPAC SL45 in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '0691e66b-d418-4872-acf6-9d55666109ca';  -- ZAHAR BRUN 5 GR in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '458f8fbc-fb7a-45f4-97b9-f025a3354dbb';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '1f7e894a-3e9b-416c-b000-fdae616ddc86';  -- PAHAR 16 OZ in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 13.0, total_cost = 3.9, unit_cost_snapshot = 13.0 WHERE id = 'e6f8ccfd-811e-4b4b-9718-4a0a14b52bbc';  -- MOELK BARISTA BAUTURA VEGETALA DE OVAZ in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '421296c1-210f-4dd0-a46b-10da17cc8771';  -- PALETE in VEGETAL CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = 'e0c91bdc-db86-4a1f-a8d8-e8a297537b61';  -- PAHAR 8 OZ in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'fe401e50-aa81-42c8-8576-c8d6758f3ebe';  -- CAFEA BOABE DECOF - CUORE DI COLUMBIA in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '3004c9b1-2a6d-405b-adc4-074b34279add';  -- ZAHAR BRUN 5 GR in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'fd7f46b4-0bf7-4beb-89b0-56834d9fa875';  -- LAPTE BIO UHT in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '92072837-2001-41eb-a788-89743b5b1af5';  -- PALETE in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '05b9edb8-f344-4a30-bb61-72d6647a12cb';  -- CAPAC SL37 in CAPPUCCINO - DEKOF COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '7a57511d-5f35-4081-9e4f-017500b85e48';  -- PAHAR 12 OZ in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'a17a4dde-3f71-464a-b782-ef1a551ba584';  -- LAPTE BIO UHT in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '949d035d-bd25-454f-8148-aee0df8c6d2c';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '8f6ab125-b208-4186-9f33-b52ad37b2302';  -- ZAHAR BRUN 5 GR in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'c5551256-5c13-4e89-a05e-1707570a6426';  -- CAPAC SL37 in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'ed55efba-7196-452e-9803-4734eeef1b49';  -- PALETE in CAPPUCCINO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = 'a6119a1e-1a7c-4ecb-a86a-3816b0ab8a14';  -- PAHAR 8 OZ in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'fc9fd7b7-a44e-4226-9f3d-8ed649470bf9';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = '74544c45-5f66-41f8-a418-a51dd7fbcfe6';  -- FRISCA SPRAY in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '8fa66f99-817c-4b3a-a9a0-64e9ce4a8405';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.08, unit_cost_snapshot = 6.0 WHERE id = 'e37e4e0b-9691-4505-8be9-f6f91a630e22';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '8c98000f-e64b-4d55-b896-53fa8a7d524b';  -- PALETE in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '2b7f2d67-35a0-48dd-90ac-310fb2267071';  -- CAPAC SL37 in CAPPUCCINO VIENNESSE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '391902ae-ba33-461b-8f91-262cc5af74a6';  -- CAPAC SL45 in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '0b46d2f9-5156-4124-9d1e-d30ff7feb128';  -- PAHAR 12 OZ in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '51fe23ed-6f84-497b-a929-5530eec2323c';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = 'ec959139-239d-40a4-be0e-083bbea7b073';  -- FRISCA SPRAY in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'bd86d79f-4f7a-4ae6-a16a-5a6806c23843';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'cc181698-e8c8-4458-8887-dfd2ee41aa17';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '5b77eb13-9ef9-4c63-b95a-25d2d503a038';  -- PALETE in CAPPUCCINO VIENNESSE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'eeade427-678a-4d3f-b6c0-1c4817300224';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE ESPRESSO H.B. 60ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'bda03757-e5b9-4d2c-a21a-06f7ebefaa23';  -- PAHAR 6 OZ in DOUBLE ESPRESSO H.B. 60ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '74429310-3195-4a21-aad0-10fdfff5d3fb';  -- ZAHAR BRUN 5 GR in DOUBLE ESPRESSO H.B. 60ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '3320204e-ddbd-4909-8c1f-b4965a4081c0';  -- CAFEA PRAJITA - PREMIUM 3 1kg in DOUBLE ESPRESSO H.B. 60ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c5ea3785-e1ff-4de0-9238-691481630733';  -- PALETE in DOUBLE ESPRESSO H.B. 60ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '77c4c94e-6b50-4d69-8707-9b53144b7fd0';  -- CAPAC SL45 in AMERICANO - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '1bf29318-6be9-4441-aeab-dc9d1e9b8784';  -- PAHAR 12 OZ in AMERICANO - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 128.76, total_cost = 2.5752, unit_cost_snapshot = 128.76 WHERE id = 'b848cbce-3740-4a56-9739-92a0bc2fab80';  -- CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr in AMERICANO - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '618c8c76-a8fe-453a-b545-7444c744c254';  -- ZAHAR BRUN 5 GR in AMERICANO - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'dd5b14aa-44f6-465f-a3c9-ed7ce8fd982c';  -- PALETE in AMERICANO - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '6f622e2c-64bb-4dfe-b1c8-2d670596b225';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in DOUBLE MACCHIATO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '495f24c2-4dee-4d24-90a3-ae3d03ae4d20';  -- PAHAR 6 OZ in DOUBLE MACCHIATO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = '3af77102-7172-4cc7-bf2c-a8c317d96e5e';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE MACCHIATO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.06, unit_cost_snapshot = 6.0 WHERE id = 'c9a61128-5dd7-40f7-aea3-d095ab54229b';  -- LAPTE BIO UHT in DOUBLE MACCHIATO - COLUMBIA BIO 60ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '1eb68bf2-88a1-4eda-adde-85b36284f3fb';  -- PAHAR 12 OZ in V60 - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '4d4cd638-8899-4f10-b6ea-96f32a37dc8e';  -- CAPAC SL45 in V60 - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '4c688ce4-e79a-46e4-92d9-5ad2d9f8e08b';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in V60 - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'd7f69e32-c928-46d7-a410-236f3156bd61';  -- PAHAR 12 OZ in AMERICANO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'cfc15a7c-fc3e-4277-85ae-67f016631efb';  -- CAPAC SL45 in AMERICANO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'bf7cb7e0-0c0d-41e3-943d-bfec751d60c9';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in AMERICANO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '683ff90a-e39e-4ecf-a716-8ddeea93b111';  -- ZAHAR BRUN 5 GR in AMERICANO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'ec0a09b6-32ad-4570-b3e7-6543427cdb1f';  -- PALETE in AMERICANO - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = '24b5a65b-c7eb-41f7-b170-266bb01a4fbc';  -- CAPAC DE PLASTIC 6 OZ in ESPRESSO H.B. 30ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '2f40c121-ff80-4d56-ac35-ef514ec8e2dc';  -- PAHAR 6 OZ in ESPRESSO H.B. 30ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '4ff089ed-6b8a-401b-9f01-04933336743e';  -- ZAHAR BRUN 5 GR in ESPRESSO H.B. 30ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '1657f6fb-237b-4d18-a0c9-642c4b25307a';  -- CAFEA PRAJITA - PREMIUM 3 1kg in ESPRESSO H.B. 30ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c99ddfaf-6717-4aca-a6c4-324dd5f3c5e0';  -- PALETE in ESPRESSO H.B. 30ml
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = '618e3cd4-2e76-4110-bb1f-c945a71bf592';  -- CAPAC PAHAR FRAPPE DL95 in LIMONADA CU MENTA
UPDATE recipe_items SET unit_cost = 0.38, total_cost = 0.38, unit_cost_snapshot = 0.38 WHERE id = '0c4a6d24-3ee5-4b05-b970-65a334ec580d';  -- PAHAR FRAPPE DOLCE NERA 3CNEW in LIMONADA CU MENTA
UPDATE recipe_items SET unit_cost = 10.3, total_cost = 4.12, unit_cost_snapshot = 10.3 WHERE id = 'caaa561d-c78c-4813-a240-54a2b6107dad';  -- LAMAIE  in LIMONADA CU MENTA
UPDATE recipe_items SET unit_cost = 0.06, total_cost = 0.06, unit_cost_snapshot = 0.06 WHERE id = '961d4901-f8f1-4ec8-a731-8ba1d430f743';  -- PAIE in LIMONADA CU MENTA
UPDATE recipe_items SET unit_cost = 0.38, total_cost = 0.38, unit_cost_snapshot = 0.38 WHERE id = 'e679db59-e142-4e65-8fc3-49e4c872d08e';  -- PAHAR FRAPPE DOLCE NERA 3CNEW in VIENNESSE ICE LATTE
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = 'd54911d3-646b-4299-90fb-2d5c9ac38240';  -- FRISCA SPRAY in VIENNESSE ICE LATTE
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = '63bf4b57-a8f6-4d1f-a5f4-48b57ce0f49b';  -- CAPAC PAHAR FRAPPE DL95 in VIENNESSE ICE LATTE
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'a747eb01-12e6-4316-922b-6838db123ff0';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VIENNESSE ICE LATTE
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = '010fb5ee-96f2-4cdc-a0e4-b339601a1ef5';  -- LAPTE BIO UHT in VIENNESSE ICE LATTE
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '8c4f0740-989b-43f6-8a33-b477adb7a43e';  -- CAPAC SL45 in CEAI ROOIBOS CARAMEL SARAT 480ml
UPDATE recipe_items SET unit_cost = 0.5, total_cost = 0.5, unit_cost_snapshot = 0.5 WHERE id = 'dfef92d3-7675-457a-a8ab-a38ca50d790a';  -- CEAI ROOIBOS in CEAI ROOIBOS CARAMEL SARAT 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '68650da7-8c4d-42f3-bf14-4553757325d0';  -- PAHAR 16 OZ in CEAI ROOIBOS CARAMEL SARAT 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '690612af-bc48-472f-a28b-74e311ba2241';  -- PALETE in CEAI ROOIBOS CARAMEL SARAT 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '27894488-321c-4cb5-8cbc-57775bbfb5a8';  -- MIERE PLIC in CEAI ROOIBOS CARAMEL SARAT 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'dd638dbc-ae76-4f70-a1fc-ec34faab4bf1';  -- CAPAC SL45 in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '2235caa7-1975-4a26-ad10-d5ed867a88b2';  -- ZAHAR BRUN 5 GR in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '1806263d-23d5-4a0e-9f66-e6a79ad25ed1';  -- PAHAR 16 OZ in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = '91abf041-4d2c-410b-84d7-180276b1f3d7';  -- LAPTE BIO UHT in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 127.0, total_cost = 2.54, unit_cost_snapshot = 127.0 WHERE id = '29bb2546-da18-4bfc-83b0-1e6e489217ca';  -- CAFEA PRAJITA - GUJI ETHIOPIA 1kg in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'd2001dc4-1da4-4b2d-bd2d-ecca082e6a67';  -- PALETE in LATTE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = 'ef048ab4-58b8-4dfa-9473-2d27c22169ae';  -- PAHAR 8 OZ in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '00eeaee6-ca9f-48cb-9c50-f33e35bb3d7c';  -- ZAHAR BRUN 5 GR in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = 'ca512f4e-02a0-435a-b972-4103304cb4da';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '0d39a361-2f7a-463c-b8b8-442e9b1cc366';  -- CAPAC SL37 in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 13.0, total_cost = 1.95, unit_cost_snapshot = 13.0 WHERE id = '83242eff-5fd2-4c1e-a241-4317d3cbdd86';  -- MOELK BARISTA BAUTURA VEGETALA DE OVAZ in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c65b916c-ebfb-4f33-90fb-acecca2c9f6a';  -- PALETE in VEGETAL CAPPUCCINO H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '382a068e-fb8a-40ec-90a9-644762d7970e';  -- CAPAC SL45 in CIOCOLATA CALDA ALBA 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '4c30a8ab-85f0-41a8-a2c2-b7ae8e5a349d';  -- PAHAR 16 OZ in CIOCOLATA CALDA ALBA 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = '686591c8-45fe-47ed-9bc0-e29b98b1f51a';  -- LAPTE BIO UHT in CIOCOLATA CALDA ALBA 480ml
UPDATE recipe_items SET unit_cost = 50.0, total_cost = 2.0, unit_cost_snapshot = 50.0 WHERE id = 'c27f940b-3f9f-4a0d-8246-74c92ba14d67';  -- WHITE CHOCOLATE GOURMET WHITE VANILA in CIOCOLATA CALDA ALBA 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'ecf14c01-4dff-4e10-8ddb-3537c2b5e3b5';  -- PALETE in CIOCOLATA CALDA ALBA 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = 'd05b5941-fb2f-48bc-8c25-bad6a25c5d3e';  -- PAHAR 8 OZ in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = 'c8bc74f3-6491-46e5-9dfb-20772b79cc61';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.9, unit_cost_snapshot = 6.0 WHERE id = 'ef692ebe-4b39-4b7e-b2ed-d0f845b0f590';  -- LAPTE BIO UHT in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '6978c459-e981-4055-9524-ddabe7b35bed';  -- ZAHAR BRUN 5 GR in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'fc1b1f36-9e7e-45ff-b68c-2f24e9a89fb6';  -- CAPAC SL37 in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'b49ab08e-3340-494f-a3c4-a9def1e4d243';  -- PALETE in FLAT WHITE - COLUMBIA BIO 240ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'b14872c7-c669-441f-b0bd-0a8d47ba0679';  -- PAHAR 12 OZ in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '7129e007-f5d2-410e-a65f-93ff6131e8be';  -- CAPAC SL45 in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '54fd6c1b-6612-4fd1-9258-25b87d0b9753';  -- ZAHAR BRUN 5 GR in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '03a6853a-8cb1-48bd-82a6-6bedf6ea0bff';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 13.0, total_cost = 3.25, unit_cost_snapshot = 13.0 WHERE id = '7c4e5cec-f840-4bf2-9b29-5f21d2e03f4c';  -- MOELK BARISTA BAUTURA VEGETALA DE OVAZ in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '3a5aab59-9054-45d7-b096-546d8e20ebe4';  -- PALETE in VEGETAL CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '72d8ede0-fbb0-4fd5-a62b-961ec5e2c7bc';  -- PAHAR 12 OZ in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'd03e790a-f43d-45c7-9a92-cf4a99b40420';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = 'ff9cb3b0-16f4-44f6-9f7d-57037baf8274';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = 'add62c8d-5e04-4226-a7a0-8beda9817e7e';  -- FRISCA SPRAY in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = '34ddbf5e-8dc8-4640-9a48-d5208c4ec7be';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '98adc049-3d2e-42a3-b1e3-ff41c3b5d38f';  -- PALETE in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'f7267872-26e0-46b2-a63d-ab0718c87cb4';  -- CAPAC SL37 in CAPPUCCINO VIENNESSE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '3aa67e4f-3caf-4423-9b62-27300dbecd0b';  -- CAPAC SL45 in CEAI VERDE MENTA & LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '0fa60602-bb80-432f-8191-25ebe008b326';  -- PAHAR 16 OZ in CEAI VERDE MENTA & LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 2.2, total_cost = 2.2, unit_cost_snapshot = 2.2 WHERE id = 'd01e8287-0fe3-4950-895f-f3a00f6990c2';  -- CEAI VERDE MENTA & LAMAIE in CEAI VERDE MENTA & LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '08337004-df70-41b7-b0fc-e5019b7177bf';  -- PALETE in CEAI VERDE MENTA & LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '8c57cc1a-d6d6-49ca-8b75-db46c8a5344c';  -- MIERE PLIC in CEAI VERDE MENTA & LAMAIE 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'e862d15c-23a7-41a1-bc43-be37c21207d3';  -- CAPAC SL45 in CEAI VERDE 480ml
UPDATE recipe_items SET unit_cost = 2.2, total_cost = 2.2, unit_cost_snapshot = 2.2 WHERE id = '80aa9caf-0fb1-4538-973b-6a55af142fd2';  -- CEAI VERDE in CEAI VERDE 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '07c3be3d-1af6-4317-b15e-b6c948c5c970';  -- PAHAR 16 OZ in CEAI VERDE 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '6f45d155-805b-46af-9154-ed024d27395c';  -- PALETE in CEAI VERDE 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '33df3f0e-c486-480a-885d-4411802b728f';  -- MIERE PLIC in CEAI VERDE 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '0cbb3769-a93a-478e-b53a-776a448c293a';  -- CAPAC SL45 in CEAI MUSETEL 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '15fbd7bb-d588-4ebe-9e7d-ae7fce9fd5cc';  -- PAHAR 16 OZ in CEAI MUSETEL 480ml
UPDATE recipe_items SET unit_cost = 2.2, total_cost = 2.2, unit_cost_snapshot = 2.2 WHERE id = 'd6c60218-bee6-4278-ae63-4d774ddd3c8b';  -- CEAI MUSETEL in CEAI MUSETEL 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '4f52a47b-3303-410e-a59b-9a7d0d2c4d39';  -- PALETE in CEAI MUSETEL 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = 'a0fb81f6-06a8-4405-a124-5ac1db64f550';  -- MIERE PLIC in CEAI MUSETEL 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '1a23ce2d-c843-46a0-aabb-b7bab7a60959';  -- CAPAC SL45 in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'a9fb53a2-8002-4dae-8dd0-b5b97f89f159';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '3cbaa961-b68a-4406-8360-84ed00388abb';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = '6c17b609-3567-46d7-b495-b8059e1c6e8e';  -- FRISCA SPRAY in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'b140b40b-db30-4e5f-849a-bbdbce145d1a';  -- PAHAR 16 OZ in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = '5e3c4f46-d48f-4e83-a7e3-a5faa9a992d1';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '78a81c35-ce89-4d12-be5d-e5649e641791';  -- PALETE in CAPPUCCINO VIENNESSE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '467251ab-6e11-4a19-90dd-20c6c3907fa1';  -- CAPAC SL45 in FRENCHPRESS - BARI S.O. 480ml 
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '7e4c660d-0558-4491-924a-449f477ab803';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in FRENCHPRESS - BARI S.O. 480ml 
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '11aea28c-5ff3-4ca4-a331-2633cca6ee0e';  -- PAHAR 16 OZ in FRENCHPRESS - BARI S.O. 480ml 
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '354ad999-44d0-49ec-b041-56bb8edd0e43';  -- CAPAC SL45 in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '3afadff2-260f-44a8-a1f9-a5d86a636be0';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '6fc56cdf-27a4-4a1b-b7ba-080e42351747';  -- ZAHAR BRUN 5 GR in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'a5021987-4570-4e6f-bf71-3b78f18f562a';  -- PAHAR 16 OZ in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = 'bc23cf42-f298-465f-8203-768bc497eaca';  -- LAPTE BIO UHT in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '4655441b-c0d0-42aa-8751-4671201f2775';  -- PALETE in CAPPUCCINO - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = 'fab29942-1d74-4edb-a2df-5a0a63a45c79';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in FRENCHPRESS - BIO COLUMBIA S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'c0dc8102-bec4-4007-8eae-5acd400758f9';  -- CAPAC SL45 in FRENCHPRESS - BIO COLUMBIA S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'c329eb6f-8b72-4d26-b17c-4ab7368e1172';  -- PAHAR 16 OZ in FRENCHPRESS - BIO COLUMBIA S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '078a0e7f-5df6-4b72-a8aa-891091ff5275';  -- CAPAC SL45 in FRENCHPRESS - NICARAGUA S.O. 480ml
UPDATE recipe_items SET unit_cost = 117.0, total_cost = 2.34, unit_cost_snapshot = 117.0 WHERE id = '605b5df7-3f86-4eeb-b164-a490aac11130';  -- CAFEA PRAJITA - NICARAGUA SHG 250gr in FRENCHPRESS - NICARAGUA S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'ab5226bf-69de-4c3a-92e3-53082bba7b0e';  -- PAHAR 16 OZ in FRENCHPRESS - NICARAGUA S.O. 480ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '55a9ac8f-c0d3-4926-97b2-79114e35f80d';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in AEROPRESS - BIO COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '3be5de00-994d-471f-8828-8d3b5a49e50f';  -- CAPAC SL45 in AEROPRESS - BIO COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'a8c214e1-1ac5-4c1b-acef-8b4017980703';  -- PAHAR 12 OZ in AEROPRESS - BIO COLUMBIA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'bcafdb11-4e25-49dc-895d-a10283f14e80';  -- CAPAC SL45 in FRENCHPRESS - PERU S.O. 480ml
UPDATE recipe_items SET unit_cost = 128.76, total_cost = 2.5752, unit_cost_snapshot = 128.76 WHERE id = 'b62392da-e9c0-4b71-a66b-5a375f3b1e32';  -- CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr in FRENCHPRESS - PERU S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '380590dc-34df-4c90-8165-11b01545d951';  -- PAHAR 16 OZ in FRENCHPRESS - PERU S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '316542f0-d335-46be-a236-16e3006c92f8';  -- CAPAC SL45 in AEROPRESS - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '5d0c7235-d122-4f8a-bef6-7ec8f57c45aa';  -- PAHAR 12 OZ in AEROPRESS - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '7af03372-1a36-42c0-8f05-659912489cc9';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in AEROPRESS - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '4e8c99a8-33e8-4034-901a-b152fd178206';  -- CAPAC SL45 in AEROPRESS - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'a09a3ead-dfa8-4087-b5a7-c4b6e78fc2fd';  -- PAHAR 12 OZ in AEROPRESS - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 117.0, total_cost = 2.34, unit_cost_snapshot = 117.0 WHERE id = '5d0ff8d6-a12f-452c-aa43-11fd8cdfa211';  -- CAFEA PRAJITA - NICARAGUA SHG 250gr in AEROPRESS - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '003bf5ef-53f6-4111-99a6-8ea006d515e9';  -- PAHAR 12 OZ in AEROPRESS - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '7c592ecc-4b64-4886-b963-a121f1a7af7e';  -- CAPAC SL45 in AEROPRESS - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 128.76, total_cost = 2.5752, unit_cost_snapshot = 128.76 WHERE id = '09f9ddd8-56cf-49d0-b1a7-3a292fe03bb9';  -- CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr in AEROPRESS - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = 'c01d6a40-df1b-410b-8710-14913011959f';  -- CAPAC PAHAR FRAPPE DL95 in LIMONADA CU MANGO & MENTA 400ml
UPDATE recipe_items SET unit_cost = 0.38, total_cost = 0.38, unit_cost_snapshot = 0.38 WHERE id = 'b327615a-736d-4ddb-9570-3f32116a26f4';  -- PAHAR FRAPPE DOLCE NERA 3CNEW in LIMONADA CU MANGO & MENTA 400ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'b1e903b6-9057-4a85-b102-7645d7c99275';  -- CAPAC SL45 in AMERICANO - COLUMBIA BIO 480ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '99a6761a-6b1c-46c6-bbc5-c45e1a332acd';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in AMERICANO - COLUMBIA BIO 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '038c4938-8b22-43b9-8068-34645ac5e724';  -- ZAHAR BRUN 5 GR in AMERICANO - COLUMBIA BIO 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '8cb60e23-fdcb-4e37-b4f0-7104c2906d57';  -- PAHAR 16 OZ in AMERICANO - COLUMBIA BIO 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'b02393b9-b19b-4e9b-8827-168bf414ccb0';  -- PALETE in AMERICANO - COLUMBIA BIO 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '84232864-d858-4643-89a6-dc5f44e3fb03';  -- CAPAC SL45 in CIOCOLATA CALDA NEAGRA 480ml
UPDATE recipe_items SET unit_cost = 50.0, total_cost = 2.0, unit_cost_snapshot = 50.0 WHERE id = '08888fcf-2fbe-4ae1-980b-5daa93072bd9';  -- DARK CHOCOLATE GOURMET VANILA  in CIOCOLATA CALDA NEAGRA 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '5a03320f-90f0-4588-b873-809c1a0bb3b1';  -- PAHAR 16 OZ in CIOCOLATA CALDA NEAGRA 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'd493e368-4542-4ab6-b652-abb4ed43e57c';  -- LAPTE BIO UHT in CIOCOLATA CALDA NEAGRA 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '74bd3521-c093-4f85-a8b0-f2c4a5a220f8';  -- PALETE in CIOCOLATA CALDA NEAGRA 480ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'b32c8acd-6404-48d3-85a1-dd706780c66c';  -- PAHAR 12 OZ in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '403d3f12-f86a-4e1a-bbfb-4d7e370783d8';  -- CAPAC SL45 in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '1b39c489-7c69-4455-88c9-06f20e7d2bb4';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '1a4cdf8a-bd48-408a-8add-9a5e125d3736';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'b4c204a8-b405-4100-b678-693c1ae39e9a';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '8f4e9134-2191-4929-8243-dc626b47990c';  -- PALETE in CAPPUCCINO VIENNESE - COLUMBIA BIO 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'da00a985-05a8-446e-ae2e-06163e54d080';  -- CAPAC SL45 in AMERICANO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'e6f46315-5330-4371-84a2-8ac48a90c1b0';  -- ZAHAR BRUN 5 GR in AMERICANO H.B. 480ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '7f01f187-02df-4c9e-9424-41bd7ba089ef';  -- CAFEA PRAJITA - PREMIUM 3 1kg in AMERICANO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '0e68b797-7991-447d-8854-78ca80003c55';  -- PAHAR 16 OZ in AMERICANO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c4860337-e8fe-49bb-982e-b62f2199f1ae';  -- PALETE in AMERICANO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '9eef7763-a217-48d8-b089-ddd3b88b5d87';  -- CAPAC SL45 in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = '19acdc30-f60a-4558-888e-4bd96f0a9c3a';  -- LAPTE BIO UHT in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '7078d575-8548-4daa-b2b6-f48473b7cebf';  -- ZAHAR BRUN 5 GR in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '9f8ca1f9-4913-463d-994b-28e655eb7087';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '4f2060c2-81c6-4669-8f13-8b3efa363e52';  -- PAHAR 16 OZ in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '2aa17daa-7c6c-4973-aaff-4d0f5f0037df';  -- PALETE in CAPPUCCINO H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '7d41d278-1bda-42ee-8998-87973cd7d597';  -- PAHAR 12 OZ in AMERICANO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '01c71c51-bcdc-4219-b106-13ca8fba3b8d';  -- CAPAC SL45 in AMERICANO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '7a44777d-cfdf-4dec-b17f-2d87bd287ef2';  -- ZAHAR BRUN 5 GR in AMERICANO H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '1a6dec79-0a0b-418f-815f-52f50bef727f';  -- CAFEA PRAJITA - PREMIUM 3 1kg in AMERICANO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '61e2a4f6-cd7f-4f29-a760-3c22e027af6e';  -- PALETE in AMERICANO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'b7d0dd32-9047-4050-944b-931adb9a8a8f';  -- PAHAR 12 OZ in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '9eec554e-9ada-4f15-a063-740623a9b111';  -- ZAHAR BRUN 5 GR in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '3c09df3c-b64c-4d9e-83db-8d50bb8a59ad';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'ead1805a-b325-4569-bfcd-d88ac6d0a480';  -- LAPTE BIO UHT in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '6c00f4d8-7e6a-4e61-8852-4d8cef84a86c';  -- PALETE in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '65772966-1177-43f0-8517-b2c19b1c7d5b';  -- CAPAC SL37 in CAPPUCCINO H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '3e20f82d-ca37-4ec1-b0b6-8ef75c95d741';  -- CAPAC SL45 in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'e849b99b-0c4d-45a4-9fee-558c879e05a7';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '5cc7fd29-64ea-4346-8ca8-9658979352d5';  -- ZAHAR BRUN 5 GR in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'bf64dfec-7a5f-4665-a109-090f3a15e983';  -- PAHAR 16 OZ in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = 'd6ed652f-3525-4ff1-8b89-74e60d80ade8';  -- LAPTE BIO UHT in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'f04c3af5-9893-4c25-81fb-b22e5a16c309';  -- PALETE in LATTE - BARI S.O. 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '5bcc6ddc-24f9-448c-bdaa-91efd702fd58';  -- CAPAC SL45 in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = '2d66b4c2-dd50-4f5a-b539-d96f8c88afb1';  -- LAPTE BIO UHT in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '1a7138e1-1a66-4676-9cff-029e0593bf56';  -- ZAHAR BRUN 5 GR in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = '9b86dc45-561d-4c3f-af3e-a6b3c9b181dd';  -- FRISCA SPRAY in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'e7d7e8ff-7341-4858-84bf-f9341c36a5db';  -- CAFEA PRAJITA - PREMIUM 3 1kg in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '842a0836-e435-4487-90a7-c83dd8fea0bf';  -- PAHAR 16 OZ in CAPPUCCINO VIENNESSE H.B. 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = '7a019042-c176-4b43-b42c-ab0a26faf985';  -- PAHAR 8 OZ in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'f5246ffb-10f1-4f19-b7fe-f4507a416c82';  -- ZAHAR BRUN 5 GR in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'fedd26b6-d6c1-4812-b7e1-1e17f650b6cb';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'c9901d62-eb42-4a3f-a2c9-3e0ecd08326b';  -- CAPAC SL37 in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 13.0, total_cost = 1.95, unit_cost_snapshot = 13.0 WHERE id = 'c6687c9f-ba60-46bf-9b88-2c40374f1bf7';  -- MOELK BARISTA BAUTURA VEGETALA DE OVAZ in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'd932c5a9-0f2d-4ea9-aab3-7cbccaa4ae89';  -- PALETE in VEGETAL FLATT WHITE H.B. 240ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '51c284e2-3316-4f46-82cc-c15802a4823a';  -- CAPAC SL45 in CEAI ALB VANILIE & PIERSICA 480ml
UPDATE recipe_items SET unit_cost = 0.5328, total_cost = 0.5328, unit_cost_snapshot = 0.5328 WHERE id = '92612987-3a54-4689-a23f-512ae7297adf';  -- CEAI ALB VANILIE & PIERSICA in CEAI ALB VANILIE & PIERSICA 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = '57450103-23f2-4d0f-85ba-723fcf4d170c';  -- PAHAR 16 OZ in CEAI ALB VANILIE & PIERSICA 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'b14ed79e-19b5-4218-95af-33963a1bd1f7';  -- PALETE in CEAI ALB VANILIE & PIERSICA 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = 'f2055e92-387d-4653-9995-be93c7ec5a08';  -- MIERE PLIC in CEAI ALB VANILIE & PIERSICA 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = '1c894ce4-4fbb-40c3-8959-dc7586c693cd';  -- PAHAR 8 OZ in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.08, unit_cost_snapshot = 6.0 WHERE id = '5a0e11a9-2b01-4986-a5d4-7467f5d1e1cb';  -- LAPTE BIO UHT in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'cf2cf285-6083-484c-b289-4e64aa448ca2';  -- ZAHAR BRUN 5 GR in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '23316dd7-6489-4bb1-9b9b-91782e8d3166';  -- CAFEA PRAJITA - PREMIUM 3 1kg in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '6982b97c-c75e-405c-887d-3751c1ff64d1';  -- CAPAC SL37 in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'd92f066c-9111-4a96-b717-336fef29693e';  -- PALETE in FLATT WHITE H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'dcfb6fe6-5cb9-45fc-ab03-711e179cd102';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '83639dab-3436-409a-900c-dcb023984cd8';  -- PAHAR 6 OZ in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '4a748ffe-3c58-4acc-acc3-218852b5a8fb';  -- ZAHAR BRUN 5 GR in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '55a7c323-766a-49d3-9328-be404b9c08c5';  -- CAFEA PRAJITA - PREMIUM 3 1kg in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.24, unit_cost_snapshot = 6.0 WHERE id = 'd94960c5-18fc-42ea-8837-9dc5c6694dcb';  -- LAPTE BIO UHT in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'f52a0fab-5015-48dd-8b87-9cb3942f3a1d';  -- PALETE in DOUBLE MACCHIATO H.B. 80ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'e690fb32-3c6b-44d8-91fe-3f5ecc224b9d';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '00a007d9-4499-4411-8ee6-08c919484e77';  -- PAHAR 6 OZ in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'b8571e98-f6ea-43ce-abdd-b3ad2984c8e5';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.14, unit_cost_snapshot = 0.07 WHERE id = '6e4eff2c-0f9d-4680-9df1-6ba444c63626';  -- ZAHAR BRUN 5 GR in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.12, unit_cost_snapshot = 6.0 WHERE id = '6ee7a63c-10c2-42d1-8cdb-0f8a6abc28aa';  -- LAPTE BIO UHT in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'c2aaaefd-4a6b-40f4-be7c-e7e07958b541';  -- PALETE in DOUBLE MACCHIATO - BARI S.O. 80ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'f3f2e9d8-2716-46ab-9007-ccb890bc7918';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE RISTRETTO - BARI S.O. 40ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'f9aaca67-0fda-427a-b364-86627525f015';  -- PAHAR 6 OZ in DOUBLE RISTRETTO - BARI S.O. 40ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '835c397e-4df2-4f90-b40c-b4edec3f4562';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in DOUBLE RISTRETTO - BARI S.O. 40ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'b3d3494a-8648-4b19-ad64-7c9ee13a58a0';  -- ZAHAR BRUN 5 GR in DOUBLE RISTRETTO - BARI S.O. 40ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '22c49096-2dfc-465a-92b5-7a108990309b';  -- PALETE in DOUBLE RISTRETTO - BARI S.O. 40ml
UPDATE recipe_items SET unit_cost = 0.06, total_cost = 0.06, unit_cost_snapshot = 0.06 WHERE id = 'd62a393d-4b56-4412-b8d4-59794ef5f4ab';  -- PAIE in FRAPPE DOLCE NERA 
UPDATE recipe_items SET unit_cost = 9.0, total_cost = 0.45, unit_cost_snapshot = 9.0 WHERE id = 'dd3b96bd-4f21-4353-9eda-b644e3a4594d';  -- FRISCA SPRAY in FRAPPE DOLCE NERA 
UPDATE recipe_items SET unit_cost = 2.75, total_cost = 2.75, unit_cost_snapshot = 2.75 WHERE id = '5e170b2c-e3de-4b19-bbba-8407cf5cfdf5';  -- PACHET FRAPPE DOLCE NERA in FRAPPE DOLCE NERA 
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = '0e642ea8-5834-4593-a5b2-b5ef0dcbe747';  -- CAPAC PAHAR FRAPPE DL95 in FRAPPE DOLCE NERA 
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.9, unit_cost_snapshot = 6.0 WHERE id = '5347ffec-c628-4c5e-8df7-c583d6452941';  -- LAPTE BIO UHT in FRAPPE DOLCE NERA 
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '33cb2d92-1e4b-4444-8283-aaff0f69939f';  -- CAPAC SL45 in CEAI CAPSUNI & MENTA 480ml
UPDATE recipe_items SET unit_cost = 0.24, total_cost = 0.24, unit_cost_snapshot = 0.24 WHERE id = 'e3f42589-7229-4a93-8fa8-2031216e6332';  -- PAHAR 16 OZ in CEAI CAPSUNI & MENTA 480ml
UPDATE recipe_items SET unit_cost = 0.555, total_cost = 0.555, unit_cost_snapshot = 0.555 WHERE id = 'a59f1372-d7b7-422b-b5ec-56e17b2d1a17';  -- CEAI CAPSUNI & MENTA in CEAI CAPSUNI & MENTA 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'e9bc3af0-010b-4c9a-8c9d-85d95447594c';  -- PALETE in CEAI CAPSUNI & MENTA 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '671cbe1f-8cbc-4ad0-81cb-e46afa2a2960';  -- MIERE PLIC in CEAI CAPSUNI & MENTA 480ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '0104ebb0-5eac-4392-a036-2ebbea5cd050';  -- CAPAC SL45 in CEAI COACAZE 480ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '5e14a099-bd92-499a-b77b-f77182a46651';  -- PALETE in CEAI COACAZE 480ml
UPDATE recipe_items SET unit_cost = 0.0, total_cost = 0.0, unit_cost_snapshot = 0.0 WHERE id = 'ce28953c-1b45-4246-8dc5-3964daeb3c80';  -- PAHAR 16 OZ in CEAI COACAZE 480ml
UPDATE recipe_items SET unit_cost = 0.5, total_cost = 0.5, unit_cost_snapshot = 0.5 WHERE id = 'fd0f7ead-4a94-4e48-89f8-780a48759d86';  -- CEAI COACAZE in CEAI COACAZE 480ml
UPDATE recipe_items SET unit_cost = 0.35, total_cost = 0.35, unit_cost_snapshot = 0.35 WHERE id = '24e7c3ec-5e05-49fa-9b4a-bd9703f5e0e9';  -- MIERE PLIC in CEAI COACAZE 480ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = 'b64ddd91-b56b-4c8c-9ca0-1c312bc70c74';  -- PAHAR 8 OZ in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.9, unit_cost_snapshot = 6.0 WHERE id = 'b1833b15-6049-430f-913c-850c5130daae';  -- LAPTE BIO UHT in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = 'd4013c37-41a8-4ea4-bf0f-bc8043edd5ce';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '58c19fd7-d63a-4b37-8f5c-544e790e7e90';  -- ZAHAR BRUN 5 GR in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = 'fa231f25-62f8-430d-91b1-61fb64fb3a79';  -- CAPAC SL37 in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '0ca1382a-5178-448c-ac31-20ae1e106d7c';  -- PALETE in FLATT WHITE - BARI S.O. 240ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = '4a99bf50-0f43-4157-a13c-fbc411d0ce34';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE RISTRETTO H.B. 40ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '88d83596-b92f-4826-921d-18c1f337e85e';  -- PAHAR 6 OZ in DOUBLE RISTRETTO H.B. 40ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '99f00b0e-725b-4772-8a81-2bb150731495';  -- ZAHAR BRUN 5 GR in DOUBLE RISTRETTO H.B. 40ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '1a6e84c9-97c1-4ee8-bcf6-fdc448eff57c';  -- CAFEA PRAJITA - PREMIUM 3 1kg in DOUBLE RISTRETTO H.B. 40ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '9a9ffedc-bca3-4bfe-8c34-9d6fa549c8f9';  -- PALETE in DOUBLE RISTRETTO H.B. 40ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'be8ef16a-1b63-4dfc-8231-d71d079a8b9e';  -- PAHAR 12 OZ in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '7480f3f4-c240-4e59-9120-f891ad7f81b2';  -- CAPAC SL45 in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'ba6e3e29-9324-407e-a9f7-786a3e165038';  -- ZAHAR BRUN 5 GR in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '971fa547-aa43-414d-81c9-f6693740560c';  -- CAFEA PRAJITA - PREMIUM 3 1kg in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 13.0, total_cost = 3.25, unit_cost_snapshot = 13.0 WHERE id = 'f61500c8-2279-4575-9fca-3a4c36c2d205';  -- MOELK BARISTA BAUTURA VEGETALA DE OVAZ in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'cbeffe5c-63e8-402a-8da1-e4a087cfa625';  -- PALETE in VEGETAL LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = '56b513fc-45cb-4730-8eb3-c734c0caf1d3';  -- PAHAR 8 OZ in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = '2f6a2751-91e5-413c-8872-f7c6ec7203a5';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.9, unit_cost_snapshot = 6.0 WHERE id = '08a7ab40-ba0a-4fcc-8009-8cc6f5bd5aed';  -- LAPTE BIO UHT in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'f9599cf7-4e18-4def-b032-150977a4052a';  -- ZAHAR BRUN 5 GR in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '8b42984a-5eb1-4bf6-a2f8-7460ed70d659';  -- CAPAC SL37 in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 0.0678, total_cost = 0.0678, unit_cost_snapshot = 0.0678 WHERE id = 'b6e54231-5dc7-4a18-8e51-ec4801a16fe4';  -- PALETE CAFEA 14cm in CAPPUCCINO - COLUMBIA BIO 360ml 
UPDATE recipe_items SET unit_cost = 0.2, total_cost = 0.2, unit_cost_snapshot = 0.2 WHERE id = '683b31d5-465e-492f-8c74-bd14d45b4bd9';  -- PAHAR 8 OZ in AMERICANO H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'f04038ea-eb78-491b-898f-41e2989f472d';  -- ZAHAR BRUN 5 GR in AMERICANO H.B. 240ml 
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '3f96e53a-b0c7-438a-a9c1-573a8f03aea6';  -- CAFEA PRAJITA - PREMIUM 3 1kg in AMERICANO H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '229a8c82-e25d-44be-9c68-7ac0cfed3bfd';  -- CAPAC SL37 in AMERICANO H.B. 240ml 
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '93aacbc3-cd01-460d-abbd-4f5d6cc1aaa0';  -- PALETE in AMERICANO H.B. 240ml 
UPDATE recipe_items SET unit_cost = 128.76, total_cost = 2.5752, unit_cost_snapshot = 128.76 WHERE id = '01327d37-094e-491c-ab18-29431bac12bd';  -- CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr in DOUBLE ESPRESSO - PERU S.O. 60ml
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = '55bef092-b664-4499-948f-55a6dfe31bfd';  -- PAHAR 6 OZ in DOUBLE ESPRESSO - PERU S.O. 60ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = '19cb2163-8f63-4ca9-921a-663ddd50dcc2';  -- CAPAC DE PLASTIC 6 OZ in DOUBLE ESPRESSO - PERU S.O. 60ml
UPDATE recipe_items SET unit_cost = 0.0, total_cost = 0.0, unit_cost_snapshot = 0.0 WHERE id = '7aa76889-e8ea-4609-810e-dffb5edbb884';  -- MATCHA POWDER TRADITIONAL GREEN TEA 250 G  in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 0.38, total_cost = 0.38, unit_cost_snapshot = 0.38 WHERE id = 'aec9a9de-178f-4b3a-a966-a5a609c8818a';  -- PAHAR FRAPPE DOLCE NERA 3CNEW in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = '9b5c932d-b3b4-4419-91f9-515558eefad8';  -- CAPAC PAHAR FRAPPE DL95 in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'd1215823-7aa4-4aad-9574-161286c35aaa';  -- LAPTE BIO UHT in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '56f1cf25-f470-4b2b-8372-c84d433bb311';  -- PALETE in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 0.0, total_cost = 0.0, unit_cost_snapshot = 0.0 WHERE id = 'a18c46e1-cc41-4f93-9484-67f438bcfe3c';  -- PIURE GIFFARD MANGO 1L in MATCHA LATTE 400ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'bd532dfd-90a0-49c5-ab12-45a48363cefa';  -- PAHAR 12 OZ in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = '8a08cfc8-a9f8-4a00-a322-636712d9771a';  -- LAPTE BIO UHT in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '11b7c596-5e9f-4204-9c42-2806e3ee73cb';  -- ZAHAR BRUN 5 GR in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = 'd6696b0d-b49f-461f-88f2-4e6c8648d3f8';  -- CAFEA PRAJITA - PREMIUM 3 1kg in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.12, total_cost = 0.12, unit_cost_snapshot = 0.12 WHERE id = '8fb033b3-a39f-4895-b264-4d2a5f82a700';  -- CAPAC SL37 in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '3bba7f52-68b1-4518-9310-74f52fa758fd';  -- PALETE in LATTE H.B. 360ml
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'c77c2246-aafa-46ee-b9b5-cb3813bd98b1';  -- CAPAC DE PLASTIC 6 OZ in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'c8f9613d-f02c-45d2-96a9-eb85c9889e71';  -- PAHAR 6 OZ in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '5f3f389d-1ec7-4c08-9caa-5939ac7a75df';  -- ZAHAR BRUN 5 GR in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '7c41e611-50d1-475d-8514-fa01df8f574e';  -- CAFEA PRAJITA - PREMIUM 3 1kg in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 0.06, unit_cost_snapshot = 6.0 WHERE id = '1b8fbaf6-e646-406f-895d-652ccb714488';  -- LAPTE BIO UHT in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '57a30d56-93bb-46b7-80b1-34919306e3e4';  -- PALETE in MACCHIATO H.B. 40ml 
UPDATE recipe_items SET unit_cost = 0.09, total_cost = 0.09, unit_cost_snapshot = 0.09 WHERE id = 'a7c10af7-443a-4803-8547-7a7f0a44ab99';  -- CAPAC DE PLASTIC 6 OZ in RISTRETTO H.B. 20ml 
UPDATE recipe_items SET unit_cost = 0.1, total_cost = 0.1, unit_cost_snapshot = 0.1 WHERE id = 'cf030833-b18c-4699-9220-6cd7caa740a7';  -- PAHAR 6 OZ in RISTRETTO H.B. 20ml 
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = 'ae114859-2c24-4a10-adcf-6a8d93465b9a';  -- ZAHAR BRUN 5 GR in RISTRETTO H.B. 20ml 
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 1.0, unit_cost_snapshot = 100.0 WHERE id = '360de7d9-61cb-4b2c-af7a-4bdb3f796203';  -- CAFEA PRAJITA - PREMIUM 3 1kg in RISTRETTO H.B. 20ml 
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = '605c36b0-8ca8-425b-92e4-6adc98791033';  -- PALETE in RISTRETTO H.B. 20ml 
UPDATE recipe_items SET unit_cost = 0.06, total_cost = 0.06, unit_cost_snapshot = 0.06 WHERE id = '41b0d6f1-a249-4ace-aba6-6fd3ee186388';  -- PAIE in ITALIAN ICE LATTE 
UPDATE recipe_items SET unit_cost = 0.38, total_cost = 0.38, unit_cost_snapshot = 0.38 WHERE id = 'feec0224-12f8-4174-bf0d-31fc6c9e6d09';  -- PAHAR FRAPPE DOLCE NERA 3CNEW in ITALIAN ICE LATTE 
UPDATE recipe_items SET unit_cost = 0.15, total_cost = 0.15, unit_cost_snapshot = 0.15 WHERE id = '2c961699-0dd1-4a0d-94a0-afb8dafce749';  -- CAPAC PAHAR FRAPPE DL95 in ITALIAN ICE LATTE 
UPDATE recipe_items SET unit_cost = 100.0, total_cost = 2.0, unit_cost_snapshot = 100.0 WHERE id = '2223b128-fb6e-4eef-a6f1-67653828566d';  -- CAFEA PRAJITA - PREMIUM 3 1kg in ITALIAN ICE LATTE 
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.8, unit_cost_snapshot = 6.0 WHERE id = 'b6ce75fd-0fe9-4d9c-a1f7-fbc5adf7b574';  -- LAPTE BIO UHT in ITALIAN ICE LATTE 
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '88b65e8b-89fb-435c-b539-f237e3bec958';  -- PAHAR 12 OZ in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '6eefc773-8aac-405f-a47e-a6e17fe4e66b';  -- CAPAC SL45 in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 111.0, total_cost = 2.22, unit_cost_snapshot = 111.0 WHERE id = '75a8f9e9-64a9-40e3-b3b0-4b354a58620c';  -- CAFEA PRAJITA - BREZZA DI BARI 1KG in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.07, total_cost = 0.07, unit_cost_snapshot = 0.07 WHERE id = '3eb9adfd-9890-4747-b64d-c151c2c61dd4';  -- ZAHAR BRUN 5 GR in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 6.0, total_cost = 1.5, unit_cost_snapshot = 6.0 WHERE id = 'f51a0119-b58d-44e1-bf00-4fc8a90e7c9e';  -- LAPTE BIO UHT in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.04, total_cost = 0.04, unit_cost_snapshot = 0.04 WHERE id = 'ca1bb818-f276-4a15-a15a-a113f5ed6a16';  -- PALETE in LATTE - BARI S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = '4239aa2c-44e9-4aa0-b29c-81dcd7576970';  -- PAHAR 12 OZ in V60 - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = 'ba4951b5-925e-4605-b2e4-e3c1fbba5eb8';  -- CAPAC SL45 in V60 - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 117.0, total_cost = 2.34, unit_cost_snapshot = 117.0 WHERE id = '98de6253-6d78-413d-b9d3-16e69eac1c31';  -- CAFEA PRAJITA - NICARAGUA SHG 250gr in V60 - NICARAGUA S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '706a4a5f-c9d4-4aa0-97da-dd56aaa6cfe6';  -- CAPAC SL45 in V60 - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'dc03fd10-8483-4e94-aeb3-52d4722b30d7';  -- PAHAR 12 OZ in V60 - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 128.76, total_cost = 2.5752, unit_cost_snapshot = 128.76 WHERE id = '7b02a0e1-1b8d-454d-bbea-19c0f25757b3';  -- CAFEA PRAJITA - PERU RUMIYACU A.M. 250gr in V60 - PERU S.O. 360ml
UPDATE recipe_items SET unit_cost = 0.13, total_cost = 0.13, unit_cost_snapshot = 0.13 WHERE id = '8b36d13c-ed85-478d-aaa1-e6e3eb3e2348';  -- CAPAC SL45 in V60 - BIO COLUMBIA S.O. 360ml 
UPDATE recipe_items SET unit_cost = 137.0, total_cost = 2.74, unit_cost_snapshot = 137.0 WHERE id = 'a9a537b5-3df3-48d8-b761-ce77443d981e';  -- CAFEA BIO COLUMBIA - LA ORQUIDEA PLANADAS 250gr in V60 - BIO COLUMBIA S.O. 360ml 
UPDATE recipe_items SET unit_cost = 0.22, total_cost = 0.22, unit_cost_snapshot = 0.22 WHERE id = 'a5e2c0ee-c75c-4d94-aa9a-3bc12f254930';  -- PAHAR 12 OZ in V60 - BIO COLUMBIA S.O. 360ml 
-- Dolce Nera: fill items into an EXISTING empty recipe shell (recipe row exists, 0 items). NOT YET APPLIED.

-- Dolce Nera: brand-new recipes (no existing recipe row at all). NOT YET APPLIED.
-- Re-verify against live Supabase immediately before running — this list is only as fresh as the snapshot.

-- LATTE - NICARAGUA S.O. 360ml -> LATTE - NICARAGUA S.O. 360ml (3d4c2527-b1ae-4ff2-a5e4-a3abab1070cf)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'LATTE - NICARAGUA S.O. 360ml', '3d4c2527-b1ae-4ff2-a5e4-a3abab1070cf', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 12 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.22, 0.22, '0e223cc3-b75b-4bd9-a20c-11fb8753218f'),
  ('CAPAC SL45', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.13, 0.13, '9989a447-5901-4a7c-a2f5-a38f2c5955a7'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31'),
  ('LAPTE BIO UHT', 'b01ce0e0-d01c-4042-0000-000000000042', 0.25, 'L', 6.0, 1.5, '20c512f5-19f5-4bb7-96b3-61c176fbc3ea')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- AMERICANO S.O. 230ml -> AMERICANO S.O. 230ml (81d75718-698b-48cc-86db-38d649355463)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'AMERICANO S.O. 230ml', '81d75718-698b-48cc-86db-38d649355463', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('PAHAR 8 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.2, 0.2, '8eca31f2-7187-433e-8e2b-c7724d2c311c'),
  ('CAPAC SL37', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.12, 0.12, '35565c85-4816-4683-85e3-f215b7315e75'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('CAFEA PRAJITA - GUJI ETHIOPIA 1kg', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 127.0, 2.54, '5ad0c48d-754c-47a2-9268-15a28309d101'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- DOUBLE RISTRETTO - NICARAGUA S.O. 40ml -> DOUBLE RISTRETTO - NICARAGUA S.O. 40ml (3c678a4f-648c-4c03-ab8a-3a818d93c436)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'DOUBLE RISTRETTO - NICARAGUA S.O. 40ml', '3c678a4f-648c-4c03-ab8a-3a818d93c436', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.1, 0.1, '14ecacea-0f5b-4dee-9f98-bfb8d6e8a0a9'),
  ('CAPAC DE PLASTIC 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.09, 0.09, '4d14f609-4674-44b3-b11e-0c2f7e8f0e24'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- DOUBLE ESPRESSO - NICARAGUA S.O. 60ml -> DOUBLE ESPRESSO - NICARAGUA S.O. 60ml (3ea1427f-d150-4b70-a979-e31798ddfb7e)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'DOUBLE ESPRESSO - NICARAGUA S.O. 60ml', '3ea1427f-d150-4b70-a979-e31798ddfb7e', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAPAC DE PLASTIC 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.09, 0.09, '4d14f609-4674-44b3-b11e-0c2f7e8f0e24'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31'),
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.1, 0.1, '14ecacea-0f5b-4dee-9f98-bfb8d6e8a0a9')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- DOUBLE MACCHIATO - NICARAGUA S.O. 80ml -> DOUBLE MACCHIATO - NICARAGUA S.O. 80ml (cc224911-73c0-4d6e-a49a-5350f5b361cf)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'DOUBLE MACCHIATO - NICARAGUA S.O. 80ml', 'cc224911-73c0-4d6e-a49a-5350f5b361cf', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.1, 0.1, '14ecacea-0f5b-4dee-9f98-bfb8d6e8a0a9'),
  ('CAPAC DE PLASTIC 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.09, 0.09, '4d14f609-4674-44b3-b11e-0c2f7e8f0e24'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31'),
  ('LAPTE BIO UHT', 'b01ce0e0-d01c-4042-0000-000000000042', 0.04, 'L', 6.0, 0.24, '20c512f5-19f5-4bb7-96b3-61c176fbc3ea')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- FLAT WHITE - NICARAGUA S.O. 240ml -> FLAT WHITE - NICARAGUA S.O. 240ml (d02872ab-37dd-4473-87b6-6fffa3c1d1bb)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'FLAT WHITE - NICARAGUA S.O. 240ml', 'd02872ab-37dd-4473-87b6-6fffa3c1d1bb', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('LAPTE BIO UHT', 'b01ce0e0-d01c-4042-0000-000000000042', 0.15, 'L', 6.0, 0.9, '20c512f5-19f5-4bb7-96b3-61c176fbc3ea'),
  ('PAHAR 8 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.2, 0.2, '8eca31f2-7187-433e-8e2b-c7724d2c311c'),
  ('CAPAC SL37', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.12, 0.12, '35565c85-4816-4683-85e3-f215b7315e75'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- AMERICANO - NICARAGUA S.O. 360ml -> AMERICANO - NICARAGUA S.O. 360ml (7cc32b1a-0d1f-4534-8f1a-08c8268f8b45)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'AMERICANO - NICARAGUA S.O. 360ml', '7cc32b1a-0d1f-4534-8f1a-08c8268f8b45', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 12 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.22, 0.22, '0e223cc3-b75b-4bd9-a20c-11fb8753218f'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31'),
  ('CAPAC SL45', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.13, 0.13, '9989a447-5901-4a7c-a2f5-a38f2c5955a7')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- BABYCCINNO 240ml -> BABYCCINNO 240ml (d64000ec-2dab-449c-99a9-6edd86b766be)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'BABYCCINNO 240ml', 'd64000ec-2dab-449c-99a9-6edd86b766be', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('PAHAR 8 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.2, 0.2, '8eca31f2-7187-433e-8e2b-c7724d2c311c'),
  ('LAPTE BIO UHT', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'L', 6.0, 0.12, '20c512f5-19f5-4bb7-96b3-61c176fbc3ea'),
  ('WHITE CHOCOLATE GOURMET WHITE VANILA', 'b01ce0e0-d01c-4042-0000-000000000042', 0.01, 'kg', 50.0, 0.5, '19ca7c72-07f0-48a0-9727-e24a637178b0'),
  ('PAIE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.06, 0.06, 'ff4d2154-45be-4940-8f8d-d96508611a1d')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- DOUBLE ESPRESSO - PREMIUM 10 - 60ml -> DOUBLE ESPRESSO - PREMIUM 10 - 60ml (96dc61a8-4f4b-4459-8092-89416a11540a)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'DOUBLE ESPRESSO - PREMIUM 10 - 60ml', '96dc61a8-4f4b-4459-8092-89416a11540a', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('CAPAC DE PLASTIC 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.09, 0.09, '4d14f609-4674-44b3-b11e-0c2f7e8f0e24'),
  ('CAFEA PRAJITA - PREMIUM 10 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 124.32, 2.4864, '06497e03-22fb-4712-b778-11e26bbd8d07'),
  ('PAHAR 6 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.1, 0.1, '14ecacea-0f5b-4dee-9f98-bfb8d6e8a0a9')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- FRESH PORTOCALE -> FRESH PORTOCALE (38c84dd4-fc1a-4bae-8786-302e60f87cdb)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'FRESH PORTOCALE', '38c84dd4-fc1a-4bae-8786-302e60f87cdb', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('PORTOCALE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'kg', 5.0, 5.0, '25ecc230-496d-4409-94bc-47ea9cf5a5bf'),
  ('CAPAC PAHAR FRAPPE DL95', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.15, 0.15, '2f18bad9-0696-40c4-84a5-60b4f1c8ecca'),
  ('CAPAC PAHAR FRAPPE DL95', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.15, 0.15, '2f18bad9-0696-40c4-84a5-60b4f1c8ecca'),
  ('PAIE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.06, 0.06, 'ff4d2154-45be-4940-8f8d-d96508611a1d')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- CAPPUCCINO - NICARAGUA S.O. 360ml -> CAPPUCCINO - NICARAGUA S.O. 360ml (c46afbb7-d6a2-424a-bcf2-28c48a85c5e8)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'CAPPUCCINO - NICARAGUA S.O. 360ml', 'c46afbb7-d6a2-424a-bcf2-28c48a85c5e8', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('LAPTE BIO UHT', 'b01ce0e0-d01c-4042-0000-000000000042', 0.25, 'L', 6.0, 1.5, '20c512f5-19f5-4bb7-96b3-61c176fbc3ea'),
  ('CAFEA PRAJITA - NICARAGUA SHG 250gr', 'b01ce0e0-d01c-4042-0000-000000000042', 0.02, 'kg', 117.0, 2.34, '2a65698d-f4e0-450f-8270-5e862706dc19'),
  ('PAHAR 12 OZ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.22, 0.22, '0e223cc3-b75b-4bd9-a20c-11fb8753218f'),
  ('CAPAC SL45', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.13, 0.13, '9989a447-5901-4a7c-a2f5-a38f2c5955a7'),
  ('PALETE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.04, 0.04, 'afa8aefc-c6d5-4a7d-9a00-b75639c704f4'),
  ('ZAHAR BRUN 5 GR', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.07, 0.07, 'b05b0e00-5331-4a44-beb3-fcd092704c31')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- FRESH MIXT -> FRESH MIXT (95151651-d4ac-438c-930e-02ee582e3d35)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'FRESH MIXT', '95151651-d4ac-438c-930e-02ee582e3d35', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('PAHAR FRAPPE DOLCE NERA 3CNEW', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.38, 0.38, 'fba7aed5-34db-4d36-95ec-fbefbffccc98'),
  ('CAPAC PAHAR FRAPPE DL95', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.15, 0.15, '2f18bad9-0696-40c4-84a5-60b4f1c8ecca'),
  ('PAIE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.06, 0.06, 'ff4d2154-45be-4940-8f8d-d96508611a1d'),
  ('GRAPEFRUIT ROSU ', 'b01ce0e0-d01c-4042-0000-000000000042', 0.35, 'kg', 6.8, 2.38, '2044d514-0d0a-4438-96fc-49f62cc95f79'),
  ('PORTOCALE', 'b01ce0e0-d01c-4042-0000-000000000042', 0.2, 'kg', 5.0, 1.0, '25ecc230-496d-4409-94bc-47ea9cf5a5bf'),
  ('RODII', 'b01ce0e0-d01c-4042-0000-000000000042', 0.3, 'kg', 13.0, 3.9, 'a0e2debc-9c4f-4b4a-b9b4-0b63e103effb'),
  ('LAMAIE ', 'b01ce0e0-d01c-4042-0000-000000000042', 0.15, 'kg', 10.3, 1.545, 'ca2611fa-ce89-4690-b0e6-8cd6ed92e29e')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- FRESH RODII -> FRESH RODII (12bf1683-3895-41e3-907b-31fe9fa7798d)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'FRESH RODII', '12bf1683-3895-41e3-907b-31fe9fa7798d', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('RODII', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'kg', 13.0, 13.0, 'a0e2debc-9c4f-4b4a-b9b4-0b63e103effb'),
  ('PAHAR FRAPPE DOLCE NERA 3CNEW', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.38, 0.38, 'fba7aed5-34db-4d36-95ec-fbefbffccc98'),
  ('CAPAC PAHAR FRAPPE DL95', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.15, 0.15, '2f18bad9-0696-40c4-84a5-60b4f1c8ecca'),
  ('PAIE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.06, 0.06, 'ff4d2154-45be-4940-8f8d-d96508611a1d')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

-- FRESH GRAPEFRUIT -> FRESH GRAPEFRUIT (1174fdee-91e7-46b8-95d3-c7055476f367)
WITH new_recipe AS (
  INSERT INTO recipes (organisation_id, name, product_id, yield_qty)
  VALUES ('b01ce0e0-d01c-4042-0000-000000000042', 'FRESH GRAPEFRUIT', '1174fdee-91e7-46b8-95d3-c7055476f367', 1.0)
  RETURNING id
)
INSERT INTO recipe_items (recipe_id, ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id)
SELECT new_recipe.id, v.ingredient_name, v.organisation_id, v.quantity, v.unit_of_measure, v.unit_cost, v.total_cost, v.ingredient_product_id
FROM new_recipe CROSS JOIN (VALUES
  ('GRAPEFRUIT ROSU ', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'kg', 6.8, 6.8, '2044d514-0d0a-4438-96fc-49f62cc95f79'),
  ('CAPAC PAHAR FRAPPE DL95', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.15, 0.15, '2f18bad9-0696-40c4-84a5-60b4f1c8ecca'),
  ('PAHAR FRAPPE DOLCE NERA 3CNEW', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.38, 0.38, 'fba7aed5-34db-4d36-95ec-fbefbffccc98'),
  ('PAIE', 'b01ce0e0-d01c-4042-0000-000000000042', 1.0, 'Units', 0.06, 0.06, 'ff4d2154-45be-4940-8f8d-d96508611a1d')
) AS v(ingredient_name, organisation_id, quantity, unit_of_measure, unit_cost, total_cost, ingredient_product_id);

