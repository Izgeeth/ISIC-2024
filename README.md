
# ISIC Skin Lesion Analysis

A machine learning application for skin lesion analysis using image-based deep learning and metadata-based classification. The project provides a FastAPI backend and a React frontend for running model inference and viewing prediction results.

**This project is intended for research and educational purposes only. It is not a medical diagnostic tool.**

## Features

- **Image-based inference:** Uses a trained ResNet-18 model to process an uploaded skin lesion image and return a model score.
- **Metadata-based inference:** Uses a trained CatBoost model to generate predictions from supported lesion metadata.
- **Interactive dashboard:** React-based frontend for uploading images, submitting metadata, and viewing prediction results.
- **REST API:** FastAPI endpoints for model inference and retrieving metadata records.
- **API documentation:** Interactive Swagger UI for testing backend endpoints.

## Tech Stack

### Machine Learning
- PyTorch
- Torchvision
- CatBoost
- Scikit-learn
- NumPy and Pandas

### Backend
- Python
- FastAPI
- Uvicorn
- Pydantic
- Joblib

### Frontend
- React
- Vite
- JavaScript
- npm

## Project Structure

```text
isic-skin-lesion-analysis/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── api.py
│   │   │       └── endpoints/
│   │   │           └── predictions.py
│   │   ├── services/
│   │   │   ├── image_service.py
│   │   │   └── model_service.py
│   │   └── main.py
│   ├── models/
│   │   ├── catboost_model.cbm
│   │   ├── catboost_frequency_maps_recovered.joblib
│   │   ├── catboost_preprocessing_metadata_recovered.json
│   │   ├── catboost_preprocessor_recovered.joblib
│   │   └── resnet18_I0_baseline.pth
│   ├── requirements.txt
│   └── data/
│       └── train-metadata.csv  # Local dataset; not included in Git
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── ...
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the application:

- Python 3.10 or a compatible version supported by the dependencies
- Node.js and npm
- Git

The application can run CPU inference. GPU acceleration is optional and requires a compatible PyTorch installation and CUDA environment.

## Setup and Installation

### 1. Clone the repository

```bash
git clone https://github.com/Izgeeth/ISIC-2024.git
cd ISIC-2024
```

### 2. Set up the backend

Create and activate a virtual environment from the project root.

**Windows PowerShell:**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install the backend dependencies:

```powershell
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

### 3. Configure the dataset

The metadata row endpoint expects the local file:

```text
backend/data/train-metadata.csv
```

This dataset file is intentionally excluded from version control. Obtain the appropriate dataset separately, ensure that its use and redistribution comply with the dataset terms, and place the file at the path above.

The metadata row lookup will not work until the required file is available. Other inference endpoints may work independently, provided their model artifacts are present.

### 4. Start the backend

From the project root:

```powershell
cd backend
python -m uvicorn app.main:app --reload
```

The backend will normally be available at:

- API base: `http://127.0.0.1:8000`
- Swagger documentation: `http://127.0.0.1:8000/docs`
- ReDoc documentation: `http://127.0.0.1:8000/redoc`

Keep this terminal running.

### 5. Set up the frontend

Open a second terminal and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

Keep both the backend and frontend running while using the application.

## API Endpoints

The current prediction endpoints include:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/v1/predictions/metadata` | Generate a prediction from submitted metadata |
| `GET` | `/api/v1/predictions/metadata/row/{isic_id}` | Retrieve a metadata record by ISIC identifier |
| `POST` | `/api/v1/predictions/image` | Run image-based inference on an uploaded image |

Use the Swagger UI at `/docs` to inspect request schemas and test the endpoints.

## Model Inference

### ResNet-18 — Image-Based Inference

The image inference service loads the trained ResNet-18 checkpoint and processes uploaded images using the configured image preprocessing pipeline.

The response includes a model score and associated prediction information. The displayed percentage is derived from the model's output; it must not be interpreted as a clinically validated probability of cancer.

### CatBoost — Metadata-Based Inference

The metadata inference service uses the trained CatBoost model and its associated preprocessing artifacts to generate predictions from supported metadata features.

The input must follow the schema and preprocessing assumptions expected by the backend.

### Important Implementation Note

Image-based and metadata-based inference are separate prediction paths in the current application. A combined multimodal fusion model should not be assumed to be implemented unless it is explicitly added and tested.

## Research and Medical Disclaimer

This project is intended for machine learning experimentation, software development, and educational use.

- Predictions are experimental model outputs, not medical diagnoses.
- The returned score or percentage is not a substitute for clinical assessment.
- Model performance may vary with image quality, data distribution, and input characteristics.
- Do not use the application to make medical decisions or delay consultation with a qualified healthcare professional.

## Current Scope

The application currently supports:

- ResNet-18 image inference through the backend API.
- CatBoost metadata inference through the backend API.
- A React dashboard for interacting with the inference services.
- Metadata record retrieval when the local dataset is available.
- API testing through FastAPI's interactive documentation.

Additional model integration, deployment, authentication, database functionality, and model-fusion capabilities should be considered separate tasks unless implemented and verified.

## License and Dataset

Add an explicit project license before redistributing this repository. Verify the licensing and redistribution terms of the dataset, trained model checkpoints, and any third-party assets before publishing them.
