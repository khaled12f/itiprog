// Mirrors backend/app/schemas/prediction.py

export interface PredictionRequest {
  location: string;
  carpet_area_sqft: number;
  floor_num: number;
  bathroom: number;
  balcony: number;
  car_parking: number;
  furnishing: "Furnished" | "Semi-Furnished" | "Unfurnished";
  transaction: "New Property" | "Resale";
  ownership: string;
  facing: string;
}

export interface PredictionResponse {
  predicted_price: number;
}

export const FURNISHING_OPTIONS: PredictionRequest["furnishing"][] = [
  "Unfurnished",
  "Semi-Furnished",
  "Furnished",
];

export const TRANSACTION_OPTIONS: PredictionRequest["transaction"][] = [
  "New Property",
  "Resale",
];

export const OWNERSHIP_OPTIONS: string[] = [
  "Freehold",
  "Leasehold",
  "Co-operative Society",
  "Power Of Attorney",
];

export const FACING_OPTIONS: string[] = [
  "East",
  "West",
  "North",
  "South",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
