export interface KOTItemResponse {

  itemName: string;

  quantity: number;

  notes: string | null;

}

export interface KOTResponse {

    tableNumber: string;

    createdAt: string;

    items: KOTItemResponse[];

}