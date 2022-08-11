import { User } from "@shared/classes/User";

export class Payment{
companyName?:string;
  firstName:string;
  lastName:string;
  address:{
      street1:string;
      street2:string;
      city:string;
      state:string;
      zip:string;
      country:string;
      workPhone:string;
  };
  email:string;
  invoiceNumbers:[string];
  transaction?:string;
  amount:Number;
  manualBy: User;
  manualOn:Date;
  created_at: Date;
  updated_at: Date;
}