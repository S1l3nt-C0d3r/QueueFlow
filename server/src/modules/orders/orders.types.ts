import { OrderStatus, OrderCreatorType } from "../../shared/constants";

export interface OrderEntity {
  id: string;

  restaurantId: string;

  sessionId: string;

  tableId: string;

  status: OrderStatus;

  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;

  createdAt: string;

  updatedAt: string;
}

export interface OrderItemEntity {
  id: string;

  orderId: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId: string | null;

  notes: string | null;

  createdAt: string;
}

export interface SubmitOrderItemRequest {
    menuItemId: string;
    quantity: number;
    notes?: string;
}

export interface SubmitOrderRequest {
    sessionId: string;

    items: SubmitOrderItemRequest[];

    createdByType: OrderCreatorType;
    createdById: string;
    takenByStaffId?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}

export interface OrderResponse {
  id: string;

  sessionId: string;

  tableId: string;

  status: OrderStatus;

  subtotal: number;

  discount: number;

  tax: number;

  grandTotal: number;

  createdAt: string;

  updatedAt: string;
}

export interface OrderItemResponse {
  id: string;

  menuItemId: string;

  itemName: string;

  quantity: number;

  unitPrice: number;

  totalPrice: number;

  createdByType: OrderCreatorType;

  createdById: string;

  takenByStaffId: string | null;

  notes: string | null;
}

export interface CreateOrderItemRequest {

    quantity: number;

    notes?: string;

    createdByType: OrderCreatorType;

    createdById: string;

    takenByStaffId?: string;

}