export const EVENTS = {
  CUSTOMER_SEATED: "customer.seated",

  CUSTOMER_CALLED: "customer.called",

  TABLE_FREED: "table.freed",

  ORDER_CREATED: "order.created",

  BILL_GENERATED: "bill.generated",
} as const;

export type EventName =
  (typeof EVENTS)[keyof typeof EVENTS];