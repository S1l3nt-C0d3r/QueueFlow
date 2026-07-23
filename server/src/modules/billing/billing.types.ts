import {
  BillStatus,
  PaymentMethod,
} from "../../shared/constants";

export interface BillEntity {
  id: string;

  restaurantId: string;

  sessionId: string;

  billNumber: number;

  subtotal: number;

  discount: number;

  tax: number;

  serviceCharge: number;

  grandTotal: number;

  status: BillStatus;

  createdByStaffId: string;

  createdAt: string;

  updatedAt: string;
}

export interface CreateBillRequest {
    sessionId: string;

    createdByStaffId: string;
}

export interface BillResponse {
  id: string;

  sessionId: string;

  billNumber: number;

  subtotal: number;

  discount: number;

  tax: number;

  serviceCharge: number;

  grandTotal: number;

  status: BillStatus;

  createdAt: string;

  updatedAt: string;
}