// types/car.d.ts
interface Car {
  id: string;
  brand: string;
  model: string;
  manufactureDate: number;
  year: number;
  price: number;
  fuel_type: string;
  photos: string[];
  listing_type: "sale" | "rental" | "both" | "sold";
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
}

export default Car;
