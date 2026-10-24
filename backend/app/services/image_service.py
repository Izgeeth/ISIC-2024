from pathlib import Path
from typing import Any

import torch
import torch.nn as nn
from PIL import Image, UnidentifiedImageError
from torchvision import models, transforms


class ImageService:
    def __init__(self) -> None:
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.is_loaded = False

        self.model_path = (
            Path(__file__).resolve().parents[2]
            / "models"
            / "resnet18_I0_baseline.pth"
        )

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225],
            ),
        ])

        self._load_model()

    def _load_model(self) -> None:
        try:
            checkpoint = torch.load(
                self.model_path,
                map_location=self.device,
                weights_only=True,
            )

            model = models.resnet18(weights=None)
            model.fc = nn.Sequential(
                nn.Dropout(p=0.30),
                nn.Linear(model.fc.in_features, 1),
            )
            model.load_state_dict(checkpoint)
            model.to(self.device)
            model.eval()

            self.model = model
            self.is_loaded = True
            print(f"ResNet-18 image model loaded on {self.device}.")
        except Exception as exc:
            self.is_loaded = False
            print(f"ResNet-18 image model loading failed: {exc}")

    def get_status(self) -> dict[str, Any]:
        return {
            "image_model": "ResNet-18" if self.is_loaded else None,
            "image_inference_ready": self.is_loaded,
            "device": str(self.device),
        }

    def predict_image(self, image: Image.Image) -> dict[str, Any]:
        if not self.is_loaded or self.model is None:
            raise RuntimeError("ResNet-18 image model is not loaded.")

        image = image.convert("RGB")
        tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.inference_mode():
            logit = self.model(tensor)
            probability = torch.sigmoid(logit).item()

        return {
            "risk_score": float(probability),
            "risk_score_percent": round(probability * 100, 2),
            "model": "ResNet-18",
            "disclaimer": (
                "Experimental research score, not a medical diagnosis. "
                "Consult a qualified healthcare professional for assessment."
            ),
        }


image_service = ImageService()