from io import BytesIO

from fastapi import UploadFile, File
from PIL import Image, UnidentifiedImageError

from app.services.image_service import image_service
import os
from pathlib import Path

import pandas as pd
from fastapi import Query

from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.model_service import model_service

router = APIRouter()


class MetadataPredictionRequest(BaseModel):
    age_approx: Optional[float] = None
    sex: Optional[str] = None
    anatom_site_general: Optional[str] = None
    clin_size_long_diam_mm: Optional[float] = None
    tbp_tile_type: Optional[str] = None

    tbp_lv_A: Optional[float] = None
    tbp_lv_Aext: Optional[float] = None
    tbp_lv_B: Optional[float] = None
    tbp_lv_Bext: Optional[float] = None
    tbp_lv_C: Optional[float] = None
    tbp_lv_Cext: Optional[float] = None
    tbp_lv_H: Optional[float] = None
    tbp_lv_Hext: Optional[float] = None
    tbp_lv_L: Optional[float] = None
    tbp_lv_Lext: Optional[float] = None
    tbp_lv_areaMM2: Optional[float] = None
    tbp_lv_area_perim_ratio: Optional[float] = None
    tbp_lv_color_std_mean: Optional[float] = None
    tbp_lv_deltaA: Optional[float] = None
    tbp_lv_deltaB: Optional[float] = None
    tbp_lv_deltaL: Optional[float] = None
    tbp_lv_deltaLB: Optional[float] = None
    tbp_lv_deltaLBnorm: Optional[float] = None
    tbp_lv_eccentricity: Optional[float] = None
    tbp_lv_location: Optional[str] = None
    tbp_lv_location_simple: Optional[str] = None
    tbp_lv_minorAxisMM: Optional[float] = None
    tbp_lv_nevi_confidence: Optional[float] = None
    tbp_lv_norm_border: Optional[float] = None
    tbp_lv_norm_color: Optional[float] = None
    tbp_lv_perimeterMM: Optional[float] = None
    tbp_lv_radial_color_std_max: Optional[float] = None
    tbp_lv_stdL: Optional[float] = None
    tbp_lv_stdLExt: Optional[float] = None
    tbp_lv_symm_2axis: Optional[float] = None
    tbp_lv_symm_2axis_angle: Optional[float] = None
    tbp_lv_x: Optional[float] = None
    tbp_lv_y: Optional[float] = None
    tbp_lv_z: Optional[float] = None

    attribution: Optional[str] = None
    copyright_license: Optional[str] = None


@router.post("/metadata")
def predict_metadata(request: MetadataPredictionRequest):
    if not model_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="CatBoost model is not available.",
        )

    try:
        result = model_service.predict_metadata(
            request.model_dump(exclude_unset=True)
        )
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Metadata prediction failed: {str(exc)}",
        ) from exc


# Path to the ISIC metadata CSV.
DATA_PATH = (
    Path(__file__).resolve().parents[4]
    / "data"
    / "train-metadata.csv"
)

print("Predictions file:", Path(__file__).resolve())
print("CSV path:", DATA_PATH)
print("CSV exists:", DATA_PATH.is_file())

# Features expected by the trained model, excluding generated _freq columns.
MODEL_INPUT_COLUMNS = [
    "age_approx", "sex", "anatom_site_general",
    "clin_size_long_diam_mm", "tbp_tile_type",
    "tbp_lv_A", "tbp_lv_Aext", "tbp_lv_B", "tbp_lv_Bext",
    "tbp_lv_C", "tbp_lv_Cext", "tbp_lv_H", "tbp_lv_Hext",
    "tbp_lv_L", "tbp_lv_Lext", "tbp_lv_areaMM2",
    "tbp_lv_area_perim_ratio", "tbp_lv_color_std_mean",
    "tbp_lv_deltaA", "tbp_lv_deltaB", "tbp_lv_deltaL",
    "tbp_lv_deltaLB", "tbp_lv_deltaLBnorm",
    "tbp_lv_eccentricity", "tbp_lv_location",
    "tbp_lv_location_simple", "tbp_lv_minorAxisMM",
    "tbp_lv_nevi_confidence", "tbp_lv_norm_border",
    "tbp_lv_norm_color", "tbp_lv_perimeterMM",
    "tbp_lv_radial_color_std_max", "tbp_lv_stdL",
    "tbp_lv_stdLExt", "tbp_lv_symm_2axis",
    "tbp_lv_symm_2axis_angle", "tbp_lv_x", "tbp_lv_y",
    "tbp_lv_z", "attribution", "copyright_license",
]


@router.get("/metadata/row/{isic_id}")
def get_metadata_row(isic_id: str):
    """Retrieve one ISIC row without exposing labels or diagnosis fields."""
    if not DATA_PATH.is_file():
        raise HTTPException(
            status_code=500,
            detail="ISIC metadata CSV was not found in backend/data.",
        )

    try:
        # Read the identifier as text to preserve its exact format.
        df = pd.read_csv(
            DATA_PATH,
            usecols=lambda column: column == "isic_id"
            or column in MODEL_INPUT_COLUMNS,
            dtype={"isic_id": str},
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not read ISIC metadata CSV: {exc}",
        ) from exc

    matches = df.loc[df["isic_id"] == isic_id]

    if matches.empty:
        raise HTTPException(
            status_code=404,
            detail=f"ISIC ID '{isic_id}' was not found.",
        )

    row = matches.iloc[0]
    metadata = {}

    for column in MODEL_INPUT_COLUMNS:
        value = row.get(column)

        if pd.isna(value):
            metadata[column] = None
        elif column in {
            "sex", "anatom_site_general", "tbp_tile_type",
            "tbp_lv_location", "tbp_lv_location_simple",
            "attribution", "copyright_license",
        }:
            metadata[column] = str(value)
        else:
            metadata[column] = float(value)

    return {
        "isic_id": isic_id,
        "metadata": metadata,
    }



@router.post("/image")
async def predict_image(file: UploadFile = File(...)):
    """Run experimental ResNet-18 inference on an uploaded skin image."""

    if not image_service.is_loaded:
        raise HTTPException(
            status_code=503,
            detail="ResNet-18 image model is not available.",
        )

    if file.content_type and not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=415,
            detail="Please upload an image file.",
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail="The uploaded file is empty.",
            )

        image = Image.open(BytesIO(contents))
        image.load()

        result = image_service.predict_image(image)
        return result

    except HTTPException:
        raise
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is not a valid readable image.",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Image prediction failed: {str(exc)}",
        ) from exc
    finally:
        await file.close()
