import {
  sqliteTable,
  text,
  integer,
  real,
  index,
} from 'drizzle-orm/sqlite-core';


export const meta = sqliteTable('meta', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});// electron/drizzle.config.ts


export const products = sqliteTable(
  'products',
  {
    id: text('id').primaryKey(), // server UUID
    name: text('name').notNull(),
    sku: text('sku').notNull(),
    price: real('price').notNull(),
    stockQuantity: integer('stock_quantity').notNull(),
    isActive: integer('is_active').notNull(), // 0 / 1
    updatedAt: text('updated_at').notNull(),
  },
  (t) => ({
    skuIdx: index('products_sku_idx').on(t.sku),
  }),
);

export const productBarcodes = sqliteTable(
  'product_barcodes',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull(),
    barcode: text('barcode').notNull(),
    isPrimary: integer('is_primary').notNull(),
  },
  (t) => ({
    barcodeIdx: index('barcode_idx').on(t.barcode),
  }),
);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // cashier, manager
  isActive: integer('is_active').notNull(),
});

export const sales = sqliteTable(
  'sales',
  {
    id: text('id'), // server UUID (nullable until synced)
    localId: text('local_id').primaryKey(), // ALWAYS present
    status: text('status').notNull(),
    paymentMethod: text('payment_method').notNull(),
    subtotal: real('subtotal').notNull(),
    tax: real('tax').notNull(),
    total: real('total').notNull(),
    reference: text('reference'),
    createdAt: text('created_at').notNull(),
    synced: integer('synced').default(0).notNull(),
  },
  (t) => ({
    syncedIdx: index('sales_synced_idx').on(t.synced),
  }),
);

export const saleItems = sqliteTable('sale_items', {
  id: text('id').primaryKey(),
  saleLocalId: text('sale_local_id').notNull(),
  productId: text('product_id').notNull(),
  quantity: integer('quantity').notNull(),
  price: real('price').notNull(),
  total: real('total').notNull(),
});

export const inventoryLogs = sqliteTable(
  'inventory_logs',
  {
    id: text('id').primaryKey(),
    productId: text('product_id').notNull(),
    changeType: text('change_type').notNull(),
    quantityChange: integer('quantity_change').notNull(),
    previousQuantity: integer('previous_quantity').notNull(),
    newQuantity: integer('new_quantity').notNull(),
    createdAt: text('created_at').notNull(),
    synced: integer('synced').default(0).notNull(),
  },
  (t) => ({
    syncedIdx: index('inventory_synced_idx').on(t.synced),
  }),
);

export const syncQueue = sqliteTable('sync_queue', {
  id: text('id').primaryKey(),
  entity: text('entity').notNull(), // sale, inventory_log
  entityId: text('entity_id').notNull(),
  createdAt: text('created_at').notNull(),
});
