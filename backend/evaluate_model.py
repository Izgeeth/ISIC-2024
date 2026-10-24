
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    log_loss,
)

from app.services.model_service import model_service


DATA_PATH = Path("data/train-metadata.csv")
SAMPLE_SIZE = 200
RANDOM_STATE = 42


def main():
    if not model_service.is_loaded:
        raise RuntimeError("CatBoost model did not load.")

    if not DATA_PATH.exists():
        raise FileNotFoundError(f"CSV not found: {DATA_PATH.resolve()}")

    df = pd.read_csv(
        DATA_PATH,
        usecols=lambda c: c == "target"
        or c in raw_features,
        low_memory=False,
    )

    if "target" not in df.columns:
        raise ValueError("CSV must contain the target column.")

    # Derive the original input features from the model metadata.
    raw_features = [
        c for c in model_service.feature_columns
        if not c.endswith("_freq")
    ]

    missing = [c for c in raw_features if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing features: {missing}")

    # Keep only rows with valid binary labels.
    df = df[df["target"].isin([0, 1])].copy()

    # Quick smoke test; this is NOT a held-out validation evaluation.
    sample = df.sample(
        n=min(SAMPLE_SIZE, len(df)),
        random_state=RANDOM_STATE,
    )

    y_true = sample["target"].astype(int).to_numpy()
    probabilities = []

    for _, row in sample.iterrows():
        metadata = {
            col: (
                None if pd.isna(row[col])
                else row[col].item()
                if isinstance(row[col], np.generic)
                else row[col]
            )
            for col in raw_features
        }

        result = model_service.predict_metadata(metadata)
        probabilities.append(result["risk_score"])

    y_prob = np.asarray(probabilities)
    y_pred = (y_prob >= 0.5).astype(int)

    print(f"Rows evaluated: {len(sample)}")
    print(f"Positive labels: {int(y_true.sum())}")
    print(f"Negative labels: {int((y_true == 0).sum())}")
    print(f"Mean predicted probability: {y_prob.mean():.6f}")

    if len(np.unique(y_true)) == 2:
        print(f"ROC-AUC: {roc_auc_score(y_true, y_prob):.6f}")
        print(
            "Average precision: "
            f"{average_precision_score(y_true, y_prob):.6f}"
        )
        print(
            "Log loss: "
            f"{log_loss(y_true, y_prob, labels=[0, 1]):.6f}"
        )
    else:
        print("Cannot calculate ranking metrics: only one label class.")

    print(f"Predictions >= 0.5: {int(y_pred.sum())}")
    print(
        "\nWARNING: This random sample may include rows used during training. "
        "Do not report these metrics as held-out validation performance."
    )


if __name__ == "__main__":
    main()
