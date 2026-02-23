import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import CarCard from "../../components/CarCard";

// Mock next/image so it renders a simple img tag for tests
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} priority={props.priority ? "true" : "false"} />;
  },
}));

// Mock useFavorites hook to provide mock functions
jest.mock("../../hooks/useFavorites", () => ({
  useFavorites: () => ({
    handleShare: jest.fn(),
  }),
}));

const mockCar: any = {
  id: "test-car-1",
  brand: "BMW",
  model: "M3",
  year: "2023-01-01",
  price: 55000,
  mileage: 15000,
  fuel_type: "Petrol",
  transmission: "Automatic",
  listing_type: "sale",
  is_exclusive: false,
  photos: ["/test-image.jpg"],
};

describe("CarCard Component", () => {
  it("renders basic car information correctly", () => {
    render(<CarCard car={mockCar} />);

    expect(screen.getByText("BMW M3")).toBeInTheDocument();
    expect(screen.getByText("€55.000")).toBeInTheDocument();
    expect(screen.getByText("Petrol")).toBeInTheDocument();
  });

  it("renders exclusive badge when is_exclusive is true", () => {
    const exclusiveCar = { ...mockCar, is_exclusive: true };
    render(<CarCard car={exclusiveCar} />);

    // Shows "exclusive" badge text
    expect(screen.getByText("💎 EXCLUSIVE")).toBeInTheDocument();
    // Replaces asking price with available upon request text
    expect(screen.getByText("Price available upon request")).toBeInTheDocument();
  });

  it("calls onFavoriteToggle when favorite button is clicked", () => {
    const mockToggle = jest.fn();
    render(<CarCard car={mockCar} onFavoriteToggle={mockToggle} isFavorite={false} />);

    // Click the favorite button (aria-label Add to favorites)
    const favButton = screen.getByLabelText("Add to favorites");
    fireEvent.click(favButton);

    expect(mockToggle).toHaveBeenCalledTimes(1);
    expect(mockToggle).toHaveBeenCalledWith("test-car-1");
  });

  it("calls onRemove when delete button is clicked", () => {
    const mockRemove = jest.fn();
    render(<CarCard car={mockCar} onRemove={mockRemove} />);

    const deleteBtn = screen.getByLabelText("Remove car");
    fireEvent.click(deleteBtn);

    expect(mockRemove).toHaveBeenCalledTimes(1);
    expect(mockRemove).toHaveBeenCalledWith("test-car-1");
  });
});
