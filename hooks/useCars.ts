import { useState, useCallback } from "react";
import Car from "@/types/car";
import { carService } from "@/services/carService";
import toast from "react-hot-toast";
import * as Sentry from "@sentry/react";

export function useCars(includeHidden = true) {
  const [cars, setCars] = useState<Car[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCars = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await carService.getCars(includeHidden);
      setCars(data);
    } catch (err: any) {
      console.error("Error fetching cars:", err);
      setError(err.message || "Failed to load cars.");
      toast.error("Araçlar yüklenirken bir hata oluştu.");
      Sentry.captureException(err);
    } finally {
      setIsLoading(false);
    }
  }, [includeHidden]);

  const addCar = async (carData: Partial<Car>) => {
    try {
      const newCar = await carService.createCar(carData);
      setCars((prev) => [newCar, ...prev]);
      return newCar;
    } catch (err: any) {
      throw err;
    }
  };

  const updateCar = async (id: string, carData: Partial<Car>) => {
    try {
      const updatedCar = await carService.updateCar(id, carData);
      setCars((prev) => prev.map((c) => (c.id === id ? updatedCar : c)));
      return updatedCar;
    } catch (err: any) {
      throw err;
    }
  };

  const removeCar = async (id: string, photos?: string[]) => {
    try {
      await carService.deleteCar(id, photos);
      setCars((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      throw err;
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      await carService.toggleVisibility(id, currentStatus);
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, is_hidden: !currentStatus } : c))
      );
    } catch (err: any) {
      throw err;
    }
  };

  const updateDisplayIndex = async (id: string, displayIndex: number) => {
    try {
      await carService.updateCar(id, { display_index: displayIndex });
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, display_index: displayIndex } : c))
      );
    } catch (err: any) {
      throw err;
    }
  };

  const updateListingType = async (id: string, newType: Car["listing_type"]) => {
    try {
      await carService.updateListingType(id, newType);
      setCars((prev) =>
        prev.map((c) => (c.id === id ? { ...c, listing_type: newType } : c))
      );
    } catch (err: any) {
      throw err;
    }
  };

  return {
    cars,
    setCars,
    isLoading,
    error,
    fetchCars,
    addCar,
    updateCar,
    removeCar,
    toggleVisibility,
    updateListingType,
    updateDisplayIndex,
  };
}
