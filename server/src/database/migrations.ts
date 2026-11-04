import { db } from "./connection";

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS restaurants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      roleId TEXT NOT NULL,
      permissionId TEXT NOT NULL,

      PRIMARY KEY (roleId, permissionId),

      FOREIGN KEY (roleId) REFERENCES roles(id),
      FOREIGN KEY (permissionId) REFERENCES permissions(id)
    );

    CREATE TABLE IF NOT EXISTS staff (
      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      roleId TEXT NOT NULL,

      staffNumber TEXT NOT NULL UNIQUE,

      displayName TEXT NOT NULL,

      email TEXT UNIQUE,

      passwordHash TEXT NOT NULL,

      active INTEGER NOT NULL DEFAULT 1,

      createdAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      FOREIGN KEY (roleId)
        REFERENCES roles(id)
    );

    CREATE TABLE IF NOT EXISTS queue (
      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      tokenNumber INTEGER NOT NULL,

      customerName TEXT NOT NULL,

      phone TEXT,

      partySize INTEGER NOT NULL,

      status TEXT NOT NULL,

      tableId TEXT,

      notes TEXT,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS queue_counter (
      restaurantId TEXT PRIMARY KEY,

      currentToken INTEGER NOT NULL DEFAULT 0,

      lastResetDate TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id)
    );

    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      tableNumber TEXT NOT NULL,

      capacity INTEGER NOT NULL,

      status TEXT NOT NULL,

      tableToken TEXT NOT NULL UNIQUE,

      currentQueueId TEXT,

      active INTEGER NOT NULL DEFAULT 1,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      FOREIGN KEY (currentQueueId)
        REFERENCES queue(id),

      UNIQUE (restaurantId, tableNumber)
    );

    CREATE INDEX IF NOT EXISTS idx_tables_restaurant
    ON tables(restaurantId);

    CREATE INDEX IF NOT EXISTS idx_tables_status
    ON tables(status);

    CREATE INDEX IF NOT EXISTS idx_tables_queue
    ON tables(currentQueueId);

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      sessionId TEXT NOT NULL,

      tableId TEXT NOT NULL,

      waiterId TEXT NOT NULL,

      status TEXT NOT NULL,

      subtotal REAL NOT NULL DEFAULT 0,

      discount REAL NOT NULL DEFAULT 0,

      tax REAL NOT NULL DEFAULT 0,

      grandTotal REAL NOT NULL DEFAULT 0,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      FOREIGN KEY (sessionId)
        REFERENCES dining_sessions(id),

      FOREIGN KEY (tableId)
        REFERENCES tables(id),

      FOREIGN KEY (waiterId)
        REFERENCES staff(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (

      id TEXT PRIMARY KEY,

      orderId TEXT NOT NULL,

      menuItemId TEXT NOT NULL,

      itemName TEXT NOT NULL,

      quantity INTEGER NOT NULL,

      unitPrice REAL NOT NULL,

      totalPrice REAL NOT NULL,

      createdByType TEXT NOT NULL,

      createdById TEXT NOT NULL,

      takenByStaffId TEXT,

      notes TEXT,

      createdAt TEXT NOT NULL,

      FOREIGN KEY(orderId)
        REFERENCES orders(id)
        ON DELETE CASCADE

    );

    CREATE INDEX IF NOT EXISTS idx_orders_restaurant
    ON orders(restaurantId);

    CREATE INDEX IF NOT EXISTS idx_orders_session
    ON orders(sessionId);

    CREATE INDEX IF NOT EXISTS idx_orders_table
    ON orders(tableId);

    CREATE INDEX IF NOT EXISTS idx_orders_waiter
    ON orders(waiterId);

    CREATE INDEX IF NOT EXISTS idx_orders_status
    ON orders(status);

    CREATE TABLE IF NOT EXISTS menu_items (

      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      name TEXT NOT NULL,

      description TEXT,

      price REAL NOT NULL,

      active INTEGER NOT NULL DEFAULT 1,

      available INTEGER NOT NULL DEFAULT 1,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      UNIQUE (restaurantId, name)

    );

    CREATE INDEX IF NOT EXISTS idx_menu_restaurant
    ON menu_items(restaurantId);

    CREATE INDEX IF NOT EXISTS idx_menu_active
    ON menu_items(active);

    CREATE TABLE IF NOT EXISTS bills (

      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      sessionId TEXT NOT NULL,

      billNumber INTEGER NOT NULL,

      subtotal REAL NOT NULL,

      discount REAL NOT NULL DEFAULT 0,

      tax REAL NOT NULL DEFAULT 0,

      serviceCharge REAL NOT NULL DEFAULT 0,

      grandTotal REAL NOT NULL,

      status TEXT NOT NULL,

      paymentMethod TEXT,

      paidAt TEXT,

      createdByStaffId TEXT NOT NULL,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      FOREIGN KEY (sessionId)
        REFERENCES dining_sessions(id),

      FOREIGN KEY (createdByStaffId)
        REFERENCES staff(id),

      UNIQUE(sessionId)

    );

    CREATE INDEX IF NOT EXISTS idx_bills_restaurant
    ON bills(restaurantId);

    CREATE INDEX IF NOT EXISTS idx_bills_session
    ON bills(sessionId);

    CREATE INDEX IF NOT EXISTS idx_bills_status
    ON bills(status);

    CREATE TABLE IF NOT EXISTS dining_sessions (

      id TEXT PRIMARY KEY,

      restaurantId TEXT NOT NULL,

      tableId TEXT NOT NULL,

      queueId TEXT,

      waiterStaffId TEXT NOT NULL,

      sessionToken TEXT NOT NULL UNIQUE,

      joinCode TEXT NOT NULL,

      createdByName TEXT NOT NULL,

      createdByPhone TEXT NOT NULL,

      status TEXT NOT NULL,

      source TEXT NOT NULL,

      partySize INTEGER NOT NULL,

      startedAt TEXT NOT NULL,

      endedAt TEXT,

      createdAt TEXT NOT NULL,

      updatedAt TEXT NOT NULL,

      FOREIGN KEY (restaurantId)
        REFERENCES restaurants(id),

      FOREIGN KEY (tableId)
        REFERENCES tables(id),

      FOREIGN KEY (queueId)
        REFERENCES queue(id)

    );

    CREATE INDEX IF NOT EXISTS idx_session_restaurant
    ON dining_sessions(restaurantId);

    CREATE INDEX IF NOT EXISTS idx_session_table
    ON dining_sessions(tableId);

    CREATE INDEX IF NOT EXISTS idx_session_status
    ON dining_sessions(status);

    CREATE INDEX IF NOT EXISTS idx_session_token
    ON dining_sessions(sessionToken);

    CREATE TABLE IF NOT EXISTS session_participants (

      id TEXT PRIMARY KEY,

      sessionId TEXT NOT NULL,

      name TEXT NOT NULL,

      phone TEXT NOT NULL,

      isOwner INTEGER NOT NULL DEFAULT 0,

      joinedAt TEXT NOT NULL,

      FOREIGN KEY (sessionId)
        REFERENCES dining_sessions(id)
        ON DELETE CASCADE

    );

    CREATE INDEX IF NOT EXISTS idx_session_table_status
    ON dining_sessions(tableId, status);

    CREATE INDEX IF NOT EXISTS idx_session_participants_session
    ON session_participants(sessionId);

    CREATE INDEX IF NOT EXISTS idx_tables_token
    ON tables(tableToken);
  `);

  console.log("Database migrations completed.");
}
