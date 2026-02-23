export interface Transaction {
  id: string;
  car_id: string;
  customer_name: string;
  customer_surname: string;
  phone_number: string;
  start_date: string;
  end_date: string;
  total_price: number;
  transaction_type: "rental" | "sale";
}
