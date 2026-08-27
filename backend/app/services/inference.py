"""Loads the trained scikit-learn pipeline once and exposes a predict() helper.

The pipeline was exported by the training notebook and already bundles all
preprocessing (imputation, scaling, one-hot encoding) via a ColumnTransformer,
so the backend only has to build a one-row DataFrame with the right columns.
"""
import json
import logging
from pathlib import Path

import joblib
import numpy as np

from app.core.config import settings
from app.schemas.prediction import PredictionRequest
from app.services.preprocessing import request_to_dataframe

logger = logging.getLogger(__name__)


class InferenceService:
    def __init__(self) -> None:
        self.model = None
        self.known_locations: set[str] = set()
        self.target_transform = "price"

    def load(self) -> None:
        model_path = Path(settings.MODEL_PATH)
        logger.info("Loading model from %s", model_path)
        self.model = joblib.load(model_path)

        locations_path = Path(settings.LOCATIONS_PATH)
        if locations_path.exists():
            self.known_locations = set(json.loads(locations_path.read_text()))
            logger.info("Loaded %d known locations", len(self.known_locations))

        metadata_path = Path(settings.METADATA_PATH)
        if metadata_path.exists():
            metadata = json.loads(metadata_path.read_text())
            self.target_transform = metadata.get("target_transform", "price")
            logger.info("Model target transform: %s", self.target_transform)

    def is_ready(self) -> bool:
        return self.model is not None

    def predict(self, payload: PredictionRequest) -> float:
        if self.model is None:
            raise RuntimeError("Model is not loaded yet")

        df = request_to_dataframe(payload, self.known_locations)
        raw_prediction = self.model.predict(df)[0]

        if self.target_transform == "log1p(price)":
            prediction = float(np.expm1(raw_prediction))
        else:
            prediction = float(raw_prediction)

        return max(prediction, 0.0)


inference_service = InferenceService()
