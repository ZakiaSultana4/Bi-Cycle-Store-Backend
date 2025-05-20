import { Types } from "mongoose";


export type OrderStatus = 'Pending' | 'Delivered' | 'Cancelled'|'Paid'|'Shipped' ;

export interface IOrder {
  user: Types.ObjectId;
  products: {
    product: Types.ObjectId;
    quantity: number;
  }[];
  productDetails: {
    name: string;
    brand: string;
    price: number;
  };
  totalPrice: number;
  status?: OrderStatus;
  transaction?: {
    id?: string;
    transactionStatus?: string;
    bank_status?: string;
    sp_code?: string;
    sp_message?: string;
    method?: string;
    date_time?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}