"""
Verification test for ML inference endpoints (ResNet-18 Image and CatBoost Metadata).
"""

import sys
import os
from pathlib import Path
from PIL import Image

backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from app.services.model_service import model_service
from app.services.image_service import image_service
from app.api.v1.endpoints.predictions import (
    predict_metadata,
    MetadataPredictionRequest,
)

print("1. Verifying CatBoost metadata inference...", flush=True)
assert model_service.is_loaded is True
metadata_input = {
    "age_approx": 65.0,
    "sex": "male",
    "anatom_site_general": "head/neck",
    "clin_size_long_diam_mm": 8.0,
}
catboost_res = model_service.predict_metadata(metadata_input)
assert "risk_score" in catboost_res
assert "risk_score_percent" in catboost_res
assert catboost_res["model"] == "CatBoost"
print(f"[PASS] CatBoost predicted risk: {catboost_res['risk_score_percent']}%")

print("2. Verifying ResNet-18 image inference...", flush=True)
assert image_service.is_loaded is True
# Generate synthetic test dermoscopic crop (224x224 RGB image)
test_img = Image.new("RGB", (224, 224), color=(180, 120, 90))
resnet_res = image_service.predict_image(test_img)
assert "risk_score" in resnet_res
assert "risk_score_percent" in resnet_res
assert resnet_res["model"] == "ResNet-18"
print(f"[PASS] ResNet-18 predicted risk: {resnet_res['risk_score_percent']}%")

print("\n[SUCCESS] Both ML inference models are fully verified and operational!")
