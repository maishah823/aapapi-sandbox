import { User } from './User';
import { Payment } from './Payment';
export class Invoice{
    _id?:string;
    user?: User;
    invoiceRef: string;
    invoiceNumber: string;
    type?:string;
    memo?:string;
    amount:number;
    paid?:boolean;
    payment?:Payment;
    created_at: Date;
    updated_at: Date;
    couponCode: any;
    discount: number;
}