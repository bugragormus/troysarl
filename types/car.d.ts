// types/car.d.ts
interface Car {
    id: string;
    brand: string;
    model: string;
    year: number;
    price: number;
    fuel_type: string;
    photos: string[];
    listing_type: 'sale' | 'rental' | 'both';
    mileage: number;
    body_type: string;
    color: string;
    horsepower: number;
    transmission: string;
    doors: number;
    features: {
        safety: string[];
        comfort: string[];
        entertainment: string[];
    };
    description: string;
    is_hidden: boolean;
}

export default Car;