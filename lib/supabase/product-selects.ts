/** PostgREST embed hints — required since products has two FKs to product_categories. */
export const PRODUCT_INVENTORY_CATEGORY_EMBED =
  "inventory_category:product_categories!category_id" as const;
export const PRODUCT_POS_CATEGORY_EMBED =
  "pos_category:product_categories!pos_category_id" as const;

export const PRODUCT_LIST_SELECT =
  `*,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name,color)` as const;

export const PRODUCT_LIST_WITH_POS_SELECT =
  `*,${PRODUCT_INVENTORY_CATEGORY_EMBED}(id,name,color),${PRODUCT_POS_CATEGORY_EMBED}(id,name,color)` as const;

export const PRODUCT_EXPORT_SELECT =
  `*,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name),${PRODUCT_POS_CATEGORY_EMBED}(name)` as const;

export const STOCK_PRODUCT_SELECT =
  `id,name,current_stock_qty,reorder_level,unit_of_measure,cost_price,active,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name)` as const;

export const OPERATIONS_PRODUCT_SELECT =
  `id,name,current_stock_qty,reorder_level,unit_of_measure,cost_price,${PRODUCT_INVENTORY_CATEGORY_EMBED}(name)` as const;

export const PRODUCT_DETAIL_SELECT =
  "*,product_categories:product_categories!category_id(name,color)" as const;
