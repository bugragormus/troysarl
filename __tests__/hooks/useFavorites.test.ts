import { renderHook, act } from "@testing-library/react";
import { useFavorites } from "../../hooks/useFavorites";

// Mock toast notifications
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

describe("useFavorites hook", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with empty favorites", () => {
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });

  it("should load favorites from localStorage on mount", () => {
    window.localStorage.setItem("favorites", JSON.stringify(["car1", "car2"]));
    const { result } = renderHook(() => useFavorites());

    expect(result.current.favorites).toEqual(["car1", "car2"]);
  });

  it("should add a car to favorites and localStorage", () => {
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("car1");
    });

    expect(result.current.favorites).toEqual(["car1"]);
    expect(window.localStorage.getItem("favorites")).toBe(JSON.stringify(["car1"]));
  });

  it("should remove a car from favorites if it already exists", () => {
    window.localStorage.setItem("favorites", JSON.stringify(["car1"]));
    const { result } = renderHook(() => useFavorites());

    act(() => {
      result.current.toggleFavorite("car1");
    });

    expect(result.current.favorites).toEqual([]);
    expect(window.localStorage.getItem("favorites")).toBe(JSON.stringify([]));
  });

  it("should share a car correctly utilizing navigator.share", async () => {
    const mockCar: any = { id: "123", brand: "TestBrand", model: "TestModel" };
    const { result } = renderHook(() => useFavorites());

    await act(async () => {
      await result.current.handleShare(mockCar);
    });

    expect(navigator.share).toHaveBeenCalled();
    expect(navigator.share).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Troy Cars - Vehicle Details",
      })
    );
  });
});
