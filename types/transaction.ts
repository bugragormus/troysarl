export interface Transaction {
  id: string;
  car_id: string;
  customer_fullname: string;
  phone_number: string;
  start_date: string;
  end_date: string | null;
  total_price: number;
  transaction_type: "rental" | "sale";
  chassis_number?: string;
  payment_method: string;
  purchase_date?: string;
  purchase_amount?: number;
  invoice_number?: string;
  seller_name?: string;
}
