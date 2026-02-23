// lib/constants.ts

export const bodyTypeOptions = [
  "Sedan",
  "Coupe",
  "Hatchback",
  "Pickup",
  "Off-Road",
  "Sport",
  "Van",
  "Convertible",
  "Crossover",
  "SUV",
  "Station Wagon",
  "Muscle",
  "Roadster",
  "Cabriolet",
  "Compact",
] as const;

export const transmissionOptions = [
  "Automatic",
  "Manual",
  "Semi-Automatic",
] as const;

export const doorOptions = ["3", "4", "5"] as const;

export const colorOptions = [
  "White",
  "Black",
  "Gray",
  "Silver",
  "Red",
  "Blue",
  "Other",
] as const;

export const fuelTypeOptions = [
  "Petrol",
  "Diesel",
  "Electric",
  "Hybrid",
  "LPG",
] as const;

export const featureOptions: { [key: string]: string[] } = {
  safety: [
    "ABS",
    "Airbags",
    "Parking Sensors",
    "Lane Assist",
    "Blind Spot Detection",
    "AEB",
    "BAS",
    "Child Lock",
    "Distronic",
    "ESP / VSA",
    "Night Vision System",
    "Immobilizer",
    "Isofix",
    "Central Locking",
    "Hill Start Assist",
    "Driver Fatigue Detection",
  ],
  comfort: [
    "Climate Control",
    "Heated Seats",
    "Keyless Entry",
    "Sunroof",
    "Power Windows",
    "Leather Seats",
    "Power Seats",
    "Functional Steering Wheel",
    "Rearview Camera",
    "Head-up Display",
    "Cruise Control",
    "Hydraulic Steering",
    "Heated Steering Wheel",
    "Memory Seats",
    "Cooled Seats",
    "Fabric Seats",
    "Automatic Dimming Rearview Mirror",
    "Front Armrest",
    "Cooled Glove Compartment",
    "Start / Stop",
    "Trip Computer",
    "Power Mirrors",
    "Heated Mirrors",
    "Adaptive Headlights",
    "Automatic Doors",
    "Panoramic Sunroof",
    "Parking Assist",
    "Rear Parking Sensors",
    "Trailer Tow Hitch",
    "Sliding Door (Single)",
  ],
  entertainment: [
    "Navigation",
    "USB / AUX",
    "Bluetooth",
    "Apple CarPlay",
    "Android Auto",
    "Rear Camera",
  ],
};
