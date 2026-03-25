// types/car.d.ts
interface Car {
  id: string;
  brand: string;
  model: string;
  year: string; // ISO date string from DB, e.g. "2023-05-01"
  price: number;
  fuel_type: string;
  photos: string[];
  listing_type: "sale" | "rental" | "reserved" | "sold";
  mileage: number;
  body_type: string;
  color: string;
  horsepower: number;
  transmission: string;
  doors: number;
  features: {
    [key: string]: string[];
    safety: string[];
    comfort: string[];
    entertainment: string[];
  };
  description: string;
  is_hidden: boolean;
  is_exclusive: boolean;
  display_index?: number;
  created_at?: string;
}

export default Car;
