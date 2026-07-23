import {
  BillEntity,
  BillResponse,
} from "./billing.types";

export function toBillResponse(
  entity: BillEntity
): BillResponse {

  return {

    id: entity.id,

    sessionId: entity.sessionId,

    subtotal: entity.subtotal,

    discount: entity.discount,

    tax: entity.tax,

    grandTotal: entity.grandTotal,

    status: entity.status,

    paymentMethod: entity.paymentMethod,

    paidAt: entity.paidAt,

    createdAt: entity.createdAt,

    updatedAt: entity.updatedAt,

  };

}

export function toBillResponseList(
  entities: BillEntity[]
): BillResponse[] {

  return entities.map(
    toBillResponse
  );

}