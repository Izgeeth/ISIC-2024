
import json
from pathlib import Path
from typing import Any, Dict

import joblib
import numpy as np
import pandas as pd
from catboost import CatBoostClassifier


class ModelService:
    def __init__(self) -> None:
        self.is_loaded = False
        self.model = None
        self.preprocessor = None
        self.frequency_maps = None
        self.feature_columns = []
        self.frequency_columns = []

        self.models_dir = Path(__file__).resolve().parents[2] / "models"
        self._load_models()

    def _load_models(self) -> None:
        try:
            model_path = self.models_dir / "catboost_model.cbm"
            preprocessor_path = (
                self.models_dir / "catboost_preprocessor_recovered.joblib"
            )
            frequency_path = (
                self.models_dir / "catboost_frequency_maps_recovered.joblib"
            )
            metadata_path = (
                self.models_dir / "catboost_preprocessing_metadata_recovered.json"
            )

            self.model = CatBoostClassifier()
            self.model.load_model(str(model_path))

            self.preprocessor = joblib.load(preprocessor_path)
            self.frequency_maps = joblib.load(frequency_path)

            with open(metadata_path, "r", encoding="utf-8") as file:
                metadata = json.load(file)

            self.feature_columns = metadata["feature_columns"]
            self.frequency_columns = metadata["frequency_columns"]

            self.is_loaded = True
            print("CatBoost metadata model loaded successfully.")

        except Exception as exc:
            self.is_loaded = False
            print(f"CatBoost model loading failed: {exc}")

    def get_status(self) -> Dict[str, Any]:
        return {
            "models_loaded": self.is_loaded,
            "tabular_model": "CatBoost" if self.is_loaded else None,
            "feature_count": len(self.feature_columns),
            "status": (
                "Metadata inference ready"
                if self.is_loaded
                else "Inference service offline"
            ),
        }


    def predict_metadata(self, metadata: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded:
            raise RuntimeError("CatBoost model is not loaded.")

        # Create a DataFrame containing one prediction sample.
        raw = pd.DataFrame([metadata])

        # Add missing original features before frequency encoding.
        for column in self.frequency_columns:
            if column not in raw.columns:
                raw[column] = np.nan

        # Add any other missing original features required by the model.
        frequency_feature_set = {
            f"{column}_freq" for column in self.frequency_columns
        }

        for column in self.feature_columns:
            if column not in raw.columns and column not in frequency_feature_set:
                raw[column] = np.nan

        # Generate frequency-encoded features.
        for column in self.frequency_columns:
            frequency_column = f"{column}_freq"
            frequency_map = self.frequency_maps[column]

            raw[frequency_column] = (
                raw[column]
                .map(frequency_map)
                .fillna(0.0)
                .astype("float32")
            )

        # Ensure the exact feature order expected by the trained model.
        missing_features = [
            column for column in self.feature_columns
            if column not in raw.columns
        ]
        if missing_features:
            raise ValueError(
                f"Missing model features: {missing_features}"
            )

        raw = raw.reindex(columns=self.feature_columns)

        # Apply the fitted preprocessing pipeline.
        processed = self.preprocessor.transform(raw)

        # Predict the positive-class probability.
        probabilities = self.model.predict_proba(processed)

        if probabilities.ndim != 2 or probabilities.shape[1] < 2:
            raise ValueError(
                "Model did not return probabilities for both classes."
            )

        probability = float(probabilities[0, 1])

        return {
            "risk_score": probability,
            "risk_score_percent": round(probability * 100, 2),
            "model": "CatBoost",
            "disclaimer": (
                "Experimental research score, not a medical diagnosis. "
                "Consult a qualified healthcare professional for assessment."
            ),
        }



model_service = ModelService()
