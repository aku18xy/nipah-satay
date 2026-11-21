import { neon } from '@neondatabase/serverless';
import { INITIAL_ORDERS, INITIAL_MEAT_INTAKE, INITIAL_SKEWER_LOGS, INITIAL_STORAGE } from '@/lib/data';
import { Order, MeatIntakeRecord, SkeweringWorkerLog, ColdStorageInventory } from '@/lib/types';

// Detect Neon Postgres connection string from any possible Vercel env variable name
export function getConnectionString(): string | null {
  const url =
    process.env.NIPAH_DATABASE_URL ||
    process.env.NIPAH_POSTGRES_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.NIPAH_DATABASE_URL_UNPOOLED;

  if (!url || url.includes('[SENSITIVE]') || url === 'undefined') {
    return null;
  }
  return url;
}

export function isDbConnected(): boolean {
  return getConnectionString() !== null;
}

export function getSql() {
  const connString = getConnectionString();
  if (!connString) return null;
  return neon(connString);
}

// In-memory fallback stores when running in local development without pulled secrets
let memoryOrders: Order[] = [...INITIAL_ORDERS];
let memoryMeatIntake: MeatIntakeRecord[] = [...INITIAL_MEAT_INTAKE];
let memorySkewerLogs: SkeweringWorkerLog[] = [...INITIAL_SKEWER_LOGS];
let memoryStorage: ColdStorageInventory = { ...INITIAL_STORAGE };

// Initialize Database Schema if not exists
export async function initDatabase() {
  const sql = getSql();
  if (!sql) {
    return { success: true, mode: 'memory', message: 'Running in in-memory fallback mode' };
  }

  try {
    // 1. Create orders table
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(64) PRIMARY KEY,
        order_number VARCHAR(32) NOT NULL,
        type VARCHAR(32) NOT NULL,
        table_number VARCHAR(32),
        customer_name VARCHAR(128),
        customer_phone VARCHAR(64),
        items JSONB NOT NULL,
        status VARCHAR(32) NOT NULL,
        station_status JSONB NOT NULL,
        payment_method VARCHAR(32) NOT NULL,
        is_paid BOOLEAN NOT NULL DEFAULT true,
        subtotal NUMERIC(10, 2) NOT NULL,
        discount NUMERIC(10, 2) NOT NULL DEFAULT 0,
        total NUMERIC(10, 2) NOT NULL,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );
    `;

    // Ensure created_at / completed_at can accept flexible string formats
    await sql`ALTER TABLE orders ALTER COLUMN created_at TYPE TEXT;`.catch(() => {});
    await sql`ALTER TABLE orders ALTER COLUMN completed_at TYPE TEXT;`.catch(() => {});

    // 2. Create meat_intake table
    await sql`
      CREATE TABLE IF NOT EXISTS meat_intake (
        id VARCHAR(64) PRIMARY KEY,
        date VARCHAR(32) NOT NULL,
        supplier VARCHAR(128) NOT NULL,
        meat_type VARCHAR(64) NOT NULL,
        gross_weight_kg NUMERIC(10, 2) NOT NULL,
        trim_loss_kg NUMERIC(10, 2) NOT NULL,
        net_weight_kg NUMERIC(10, 2) NOT NULL,
        yield_percent NUMERIC(6, 2) NOT NULL,
        target_sticks_expected INTEGER NOT NULL,
        cost_per_kg NUMERIC(10, 2) NOT NULL,
        total_cost NUMERIC(10, 2) NOT NULL,
        marinade_batch_code VARCHAR(64) NOT NULL,
        status VARCHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 3. Create worker_skewer_logs table
    await sql`
      CREATE TABLE IF NOT EXISTS worker_skewer_logs (
        id VARCHAR(64) PRIMARY KEY,
        worker_name VARCHAR(128) NOT NULL,
        date VARCHAR(32) NOT NULL,
        shift VARCHAR(32) NOT NULL,
        meat_type VARCHAR(64) NOT NULL,
        sticks_completed INTEGER NOT NULL,
        rate_per_stick NUMERIC(10, 2) NOT NULL,
        total_earnings NUMERIC(10, 2) NOT NULL,
        quality_check VARCHAR(32) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // 4. Create chiller_inventory table
    await sql`
      CREATE TABLE IF NOT EXISTS chiller_inventory (
        id VARCHAR(32) PRIMARY KEY DEFAULT 'current',
        data JSONB NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;

    // Seed initial orders if empty
    const existingOrders = await sql`SELECT count(*) FROM orders;`;
    if (Number(existingOrders[0].count) === 0) {
      for (const ord of INITIAL_ORDERS) {
        await sql`
          INSERT INTO orders (
            id, order_number, type, table_number, customer_name, customer_phone,
            items, status, station_status, payment_method, is_paid,
            subtotal, discount, total, created_at, completed_at
          ) VALUES (
            ${ord.id}, ${ord.orderNumber}, ${ord.type}, ${ord.tableNumber || null},
            ${ord.customerName || null}, ${ord.customerPhone || null},
            ${JSON.stringify(ord.items)}, ${ord.status},
            ${JSON.stringify(ord.stationStatus)}, ${ord.paymentMethod},
            ${ord.isPaid}, ${ord.subtotal}, ${ord.discount}, ${ord.total},
            ${ord.createdAt}, ${ord.completedAt || null}
          );
        `;
      }
    }

    // Seed storage if empty
    const existingStorage = await sql`SELECT count(*) FROM chiller_inventory WHERE id = 'current';`;
    if (Number(existingStorage[0].count) === 0) {
      await sql`
        INSERT INTO chiller_inventory (id, data, updated_at)
        VALUES ('current', ${JSON.stringify(INITIAL_STORAGE)}, NOW())
        ON CONFLICT (id) DO NOTHING;
      `;
    }

    // Seed meat intake if empty
    const existingIntake = await sql`SELECT count(*) FROM meat_intake;`;
    if (Number(existingIntake[0].count) === 0) {
      for (const item of INITIAL_MEAT_INTAKE) {
        await sql`
          INSERT INTO meat_intake (
            id, date, supplier, meat_type, gross_weight_kg, trim_loss_kg,
            net_weight_kg, yield_percent, target_sticks_expected, cost_per_kg,
            total_cost, marinade_batch_code, status
          ) VALUES (
            ${item.id}, ${item.date}, ${item.supplier}, ${item.meatType},
            ${item.grossWeightKg}, ${item.trimLossKg}, ${item.netWeightKg},
            ${item.yieldPercent}, ${item.targetSticksExpected}, ${item.costPerKg},
            ${item.totalCost}, ${item.marinadeBatchCode}, ${item.status}
          );
        `;
      }
    }

    // Seed skewer logs if empty
    const existingLogs = await sql`SELECT count(*) FROM worker_skewer_logs;`;
    if (Number(existingLogs[0].count) === 0) {
      for (const log of INITIAL_SKEWER_LOGS) {
        await sql`
          INSERT INTO worker_skewer_logs (
            id, worker_name, date, shift, meat_type, sticks_completed,
            rate_per_stick, total_earnings, quality_check
          ) VALUES (
            ${log.id}, ${log.workerName}, ${log.date}, ${log.shift},
            ${log.meatType}, ${log.sticksCompleted}, ${log.ratePerStick},
            ${log.totalEarnings}, ${log.qualityCheck}
          );
        `;
      }
    }

    return { success: true, mode: 'neon', message: 'Neon Postgres tables and seed initialized' };
  } catch (error: any) {
    console.error('Error initializing Neon DB:', error);
    return { success: false, mode: 'neon_error', error: error.message };
  }
}

// ----------------- ORDERS SERVICE -----------------
export async function getDbOrders(): Promise<Order[]> {
  const sql = getSql();
  if (!sql) return memoryOrders;

  try {
    await initDatabase();
    const rows = await sql`
      SELECT 
        id, order_number as "orderNumber", type, table_number as "tableNumber",
        customer_name as "customerName", customer_phone as "customerPhone",
        items, status, station_status as "stationStatus",
        payment_method as "paymentMethod", is_paid as "isPaid",
        subtotal::float, discount::float, total::float,
        created_at as "createdAt", completed_at as "completedAt"
      FROM orders
      ORDER BY created_at DESC;
    `;

    return rows.map((r: any) => ({
      id: r.id,
      orderNumber: r.orderNumber,
      type: r.type,
      tableNumber: r.tableNumber || undefined,
      customerName: r.customerName || undefined,
      customerPhone: r.customerPhone || undefined,
      items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
      status: r.status,
      stationStatus: typeof r.stationStatus === 'string' ? JSON.parse(r.stationStatus) : r.stationStatus,
      paymentMethod: r.paymentMethod,
      isPaid: Boolean(r.isPaid),
      subtotal: Number(r.subtotal),
      discount: Number(r.discount),
      total: Number(r.total),
      createdAt: typeof r.createdAt === 'object' ? r.createdAt.toISOString() : String(r.createdAt),
      completedAt: r.completedAt ? (typeof r.completedAt === 'object' ? r.completedAt.toISOString() : String(r.completedAt)) : undefined,
    }));
  } catch (err) {
    console.warn('Failed to query Neon orders, falling back to memory:', err);
    return memoryOrders;
  }
}

export async function createDbOrder(order: Order): Promise<Order> {
  const sql = getSql();
  if (!sql) {
    memoryOrders = [order, ...memoryOrders];
    return order;
  }

  try {
    await initDatabase();
    await sql`
      INSERT INTO orders (
        id, order_number, type, table_number, customer_name, customer_phone,
        items, status, station_status, payment_method, is_paid,
        subtotal, discount, total, created_at
      ) VALUES (
        ${order.id}, ${order.orderNumber}, ${order.type}, ${order.tableNumber || null},
        ${order.customerName || null}, ${order.customerPhone || null},
        ${JSON.stringify(order.items)}, ${order.status},
        ${JSON.stringify(order.stationStatus)}, ${order.paymentMethod},
        ${order.isPaid}, ${order.subtotal}, ${order.discount}, ${order.total},
        ${order.createdAt}
      );
    `;
    memoryOrders = [order, ...memoryOrders];
    return order;
  } catch (err) {
    console.warn('Failed to insert order to Neon, saving to memory fallback:', err);
    memoryOrders = [order, ...memoryOrders];
    return order;
  }
}

export async function updateDbOrderStatus(
  orderId: string, 
  status: Order['status'], 
  stationStatus?: Order['stationStatus']
): Promise<boolean> {
  const sql = getSql();
  if (!sql) {
    memoryOrders = memoryOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            ...(stationStatus ? { stationStatus } : {}),
            ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          }
        : o
    );
    return true;
  }

  try {
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    if (stationStatus) {
      await sql`
        UPDATE orders
        SET status = ${status},
            station_status = ${JSON.stringify(stationStatus)},
            completed_at = COALESCE(${completedAt}, completed_at)
        WHERE id = ${orderId};
      `;
    } else {
      await sql`
        UPDATE orders
        SET status = ${status},
            completed_at = COALESCE(${completedAt}, completed_at)
        WHERE id = ${orderId};
      `;
    }
    // Also update memory
    memoryOrders = memoryOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status,
            ...(stationStatus ? { stationStatus } : {}),
            ...(status === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          }
        : o
    );
    return true;
  } catch (err) {
    console.warn('Failed to update order status in Neon:', err);
    return false;
  }
}

// ----------------- PRODUCTION SERVICE -----------------
export async function getDbProductionData() {
  const sql = getSql();
  if (!sql) {
    return {
      intakeRecords: memoryMeatIntake,
      skewerLogs: memorySkewerLogs,
      storage: memoryStorage,
    };
  }

  try {
    await initDatabase();
    const intakes = await sql`
      SELECT 
        id, date, supplier, meat_type as "meatType",
        gross_weight_kg::float as "grossWeightKg",
        trim_loss_kg::float as "trimLossKg",
        net_weight_kg::float as "netWeightKg",
        yield_percent::float as "yieldPercent",
        target_sticks_expected as "targetSticksExpected",
        cost_per_kg::float as "costPerKg",
        total_cost::float as "totalCost",
        marinade_batch_code as "marinadeBatchCode",
        status
      FROM meat_intake
      ORDER BY created_at DESC;
    `;

    const logs = await sql`
      SELECT 
        id, worker_name as "workerName", date, shift,
        meat_type as "meatType", sticks_completed as "sticksCompleted",
        rate_per_stick::float as "ratePerStick",
        total_earnings::float as "totalEarnings",
        quality_check as "qualityCheck"
      FROM worker_skewer_logs
      ORDER BY created_at DESC;
    `;

    const storageRow = await sql`
      SELECT data FROM chiller_inventory WHERE id = 'current';
    `;
    const storageData = storageRow.length > 0
      ? (typeof storageRow[0].data === 'string' ? JSON.parse(storageRow[0].data) : storageRow[0].data)
      : memoryStorage;

    return {
      intakeRecords: intakes as MeatIntakeRecord[],
      skewerLogs: logs as SkeweringWorkerLog[],
      storage: storageData as ColdStorageInventory,
    };
  } catch (err) {
    console.warn('Failed to query production data from Neon:', err);
    return {
      intakeRecords: memoryMeatIntake,
      skewerLogs: memorySkewerLogs,
      storage: memoryStorage,
    };
  }
}

export async function addDbMeatIntake(record: MeatIntakeRecord) {
  const sql = getSql();
  if (!sql) {
    memoryMeatIntake = [record, ...memoryMeatIntake];
    return record;
  }

  try {
    await sql`
      INSERT INTO meat_intake (
        id, date, supplier, meat_type, gross_weight_kg, trim_loss_kg,
        net_weight_kg, yield_percent, target_sticks_expected, cost_per_kg,
        total_cost, marinade_batch_code, status
      ) VALUES (
        ${record.id}, ${record.date}, ${record.supplier}, ${record.meatType},
        ${record.grossWeightKg}, ${record.trimLossKg}, ${record.netWeightKg},
        ${record.yieldPercent}, ${record.targetSticksExpected}, ${record.costPerKg},
        ${record.totalCost}, ${record.marinadeBatchCode}, ${record.status}
      );
    `;
    memoryMeatIntake = [record, ...memoryMeatIntake];
    return record;
  } catch (err) {
    memoryMeatIntake = [record, ...memoryMeatIntake];
    return record;
  }
}

export async function addDbSkewerLog(log: SkeweringWorkerLog) {
  const sql = getSql();
  if (!sql) {
    memorySkewerLogs = [log, ...memorySkewerLogs];
    return log;
  }

  try {
    await sql`
      INSERT INTO worker_skewer_logs (
        id, worker_name, date, shift, meat_type, sticks_completed,
        rate_per_stick, total_earnings, quality_check
      ) VALUES (
        ${log.id}, ${log.workerName}, ${log.date}, ${log.shift},
        ${log.meatType}, ${log.sticksCompleted}, ${log.ratePerStick},
        ${log.totalEarnings}, ${log.qualityCheck}
      );
    `;
    memorySkewerLogs = [log, ...memorySkewerLogs];
    return log;
  } catch (err) {
    memorySkewerLogs = [log, ...memorySkewerLogs];
    return log;
  }
}

export async function updateDbStorage(storage: ColdStorageInventory) {
  const sql = getSql();
  memoryStorage = storage;
  if (!sql) return storage;

  try {
    await sql`
      INSERT INTO chiller_inventory (id, data, updated_at)
      VALUES ('current', ${JSON.stringify(storage)}, NOW())
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();
    `;
    return storage;
  } catch (err) {
    return storage;
  }
}
