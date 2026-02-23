import { carService } from "../../services/carService";
import { supabase } from "../../lib/supabaseClient";

// Mock the whole supabase client
jest.mock("../../lib/supabaseClient", () => ({
  supabase: {
    from: jest.fn(),
  },
}));

describe("carService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockQueryBuilder = (mockData: any, mockError: any = null) => {
    const builder: any = {};
    builder.select = jest.fn().mockReturnValue(builder);
    builder.insert = jest.fn().mockReturnValue(builder);
    builder.update = jest.fn().mockReturnValue(builder);
    builder.delete = jest.fn().mockReturnValue(builder);
    builder.eq = jest.fn().mockReturnValue(builder);
    builder.order = jest.fn().mockReturnValue(builder);
    builder.single = jest.fn().mockResolvedValue({ data: mockData, error: mockError });
    // If it's not a single resolution, i.e., fetching arrays
    builder.then = (resolve: any) => resolve({ data: mockData, error: mockError });
    return builder;
  };

  it("should fetch all cars including hidden", async () => {
    const mockCars = [{ id: "1", brand: "Audi" }];
    const queryBuilder = mockQueryBuilder(mockCars);
    (supabase.from as jest.Mock).mockReturnValue(queryBuilder);

    const cars = await carService.getCars(true);

    expect(supabase.from).toHaveBeenCalledWith("cars");
    expect(queryBuilder.select).toHaveBeenCalledWith("*");
    expect(queryBuilder.eq).not.toHaveBeenCalledWith("is_hidden", false);
    expect(cars).toEqual(mockCars);
  });

  it("should fetch visible cars only", async () => {
    const mockCars = [{ id: "1", brand: "Audi", is_hidden: false }];
    const queryBuilder = mockQueryBuilder(mockCars);
    (supabase.from as jest.Mock).mockReturnValue(queryBuilder);

    const cars = await carService.getCars(false);

    expect(queryBuilder.eq).toHaveBeenCalledWith("is_hidden", false);
    expect(cars).toEqual(mockCars);
  });

  it("should create a new car", async () => {
    const newCarData = { brand: "Tesla", model: "Model S" };
    const savedCar = { id: "2", ...newCarData };
    const queryBuilder = mockQueryBuilder(savedCar);
    (supabase.from as jest.Mock).mockReturnValue(queryBuilder);

    const result = await carService.createCar(newCarData);

    expect(queryBuilder.insert).toHaveBeenCalledWith([newCarData]);
    expect(result).toEqual(savedCar);
  });

  it("should toggle a cars visibility", async () => {
    const queryBuilder = mockQueryBuilder(null);
    (supabase.from as jest.Mock).mockReturnValue(queryBuilder);

    await carService.toggleVisibility("123", true);

    expect(queryBuilder.update).toHaveBeenCalledWith({ is_hidden: false });
    expect(queryBuilder.eq).toHaveBeenCalledWith("id", "123");
  });

  it("should fail gracefully and throw when query errors", async () => {
    const errorObj = { message: "Database error" };
    const queryBuilder = mockQueryBuilder(null, errorObj);
    (supabase.from as jest.Mock).mockReturnValue(queryBuilder);

    await expect(carService.getCars()).rejects.toEqual(errorObj);
  });
});
