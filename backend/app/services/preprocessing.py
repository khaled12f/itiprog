"""Turns a validated PredictionRequest into the exact one-row DataFrame shape
the trained pipeline expects. Unknown locations are mapped to "other",
mirroring the top-N grouping done in the training notebook.
"""
import pandas as pd

from app.schemas.prediction import PredictionRequest

NUMERIC_FEATURES = ["carpet_area_sqft", "floor_num", "bathroom", "balcony", "car_parking"]
CATEGORICAL_FEATURES = ["location_grouped", "Furnishing", "Transaction", "Ownership", "facing"]
FEATURE_ORDER = NUMERIC_FEATURES + CATEGORICAL_FEATURES


def request_to_dataframe(payload: PredictionRequest, known_locations: set[str]) -> pd.DataFrame:
    location_grouped = payload.location if payload.location in known_locations else "other"

    row = {
        "carpet_area_sqft": payload.carpet_area_sqft,
        "floor_num": payload.floor_num,
        "bathroom": payload.bathroom,
        "balcony": payload.balcony,
        "car_parking": payload.car_parking,
        "location_grouped": location_grouped,
        "Furnishing": payload.furnishing,
        "Transaction": payload.transaction,
        "Ownership": payload.ownership,
        "facing": payload.facing,
    }
    return pd.DataFrame([row], columns=FEATURE_ORDER)
