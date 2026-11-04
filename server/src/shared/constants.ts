export const SYSTEM_ROLES = {
    ADMIN: "Admin",
    MANAGER: "Manager",
    WAITER: "Waiter",
    RECEPTIONIST: "Receptionist",
    CASHIER: "Cashier",
} as const;

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
}

export const QUEUE_STATUS = {
  WAITING: "waiting",
  CALLED: "called",
  SEATED: "seated",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type QueueStatus =
  (typeof QUEUE_STATUS)[keyof typeof QUEUE_STATUS];

export const PERMISSIONS = {

    // Staff
    STAFF_CREATE: "staff.create",
    STAFF_EDIT: "staff.edit",
    STAFF_DELETE: "staff.delete",
    STAFF_VIEW: "staff.view",

    // Queue
    QUEUE_VIEW: "queue.view",
    QUEUE_MANAGE: "queue.manage",

    // Orders
    ORDER_CREATE: "orders.create",
    ORDER_EDIT: "orders.edit",
    ORDER_CANCEL: "orders.cancel",

    // Billing
    BILL_CREATE: "billing.create",
    BILL_REFUND: "billing.refund",

    // Reports
    REPORT_VIEW: "reports.view",

    // Menu
    MENU_EDIT: "menu.edit",

    // Tables
    TABLE_MANAGE: "tables.manage",

    // Settings
    SETTINGS_EDIT: "settings.edit",

} as const;

export const PERMISSION_LIST = Object.values(PERMISSIONS);

const roles = [
  {
    id: "role-admin",
    name: SYSTEM_ROLES.ADMIN,
    description: "Restaurant Administrator",
  },
  {
    id: "role-manager",
    name: SYSTEM_ROLES.MANAGER,
    description: "Restaurant Manager",
  },
  {
    id: "role-waiter",
    name: SYSTEM_ROLES.WAITER,
    description: "Wait Staff",
  },
  {
    id: "role-receptionist",
    name: SYSTEM_ROLES.RECEPTIONIST,
    description: "Front Desk",
  },
  {
    id: "role-cashier",
    name: SYSTEM_ROLES.CASHIER,
    description: "Cashier",
  },
];

export const AUDIT_ACTIONS = {
    STAFF_CREATED: "staff.created",

    STAFF_UPDATED: "staff.updated",

    STAFF_PASSWORD_RESET:
        "staff.password.reset",

    QUEUE_CREATED: "queue.created",

    TABLE_ASSIGNED:
        "table.assigned",

    BILL_GENERATED:
        "bill.generated",
} as const;

// ==============================================
// Role IDs (Database IDs)
// ==============================================

export const ROLE_IDS = {
  ADMIN: "role-admin",
  MANAGER: "rolemanager",
  WAITER: "role-waiter",
  RECEPTIONIST: "role-receptionist",
  CASHIER: "role-cashier",
} as const;

export type RoleId =
  (typeof ROLE_IDS)[keyof typeof ROLE_IDS];

export const ROLE_LIST = roles;

export const TABLE_STATUS = {
  AVAILABLE: "available",
  RESERVED: "reserved",
  OCCUPIED: "occupied",
  CLEANING: "cleaning",
} as const;

export type TableStatus =
  (typeof TABLE_STATUS)[keyof typeof TABLE_STATUS];

export const ORDER_STATUS = {
  PLACED: "Placed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus =
  (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const PAYMENT_METHOD = {
  CASH: "cash",
  CARD: "card",
  UPI: "upi",
} as const;

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const BILL_STATUS = {
  PAID: "Paid",
  VOID: "Void",
  OPEN:"Open",
} as const;

export type BillStatus =
  (typeof BILL_STATUS)[keyof typeof BILL_STATUS];

export const SESSION_STATUS = {
  ACTIVE: "active",
  BILLING: "billing",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type SessionStatus =
  (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

export const SESSION_SOURCE = {
  RECEPTION: "reception",
  QR: "qr",
  WAITER: "waiter",
  QUEUE: "queue"
} as const;

export type SessionSource =
  (typeof SESSION_SOURCE)[keyof typeof SESSION_SOURCE];


export const ORDER_CREATOR_TYPE = {

  CUSTOMER: "customer",

  STAFF: "staff",

} as const;

export type OrderCreatorType =
  typeof ORDER_CREATOR_TYPE[keyof typeof ORDER_CREATOR_TYPE];