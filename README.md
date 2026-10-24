# ISIC Skin Lesion Analysis

A full-stack machine learning application for skin lesion risk analysis using image-based deep learning (PyTorch ResNet-18) and metadata-based classification (CatBoost). The project provides a FastAPI backend with SQLAlchemy database persistence, JWT authentication, and an interactive React + Tailwind CSS dashboard.

**This project is intended for research and educational purposes only. It is not a medical diagnostic tool.**

---

## Features

- **Image-based inference:** ResNet-18 deep CNN classifier processing uploaded dermoscopy images (JPEG, PNG, WebP) with RGB normalization and 224×224 cropping.
- **Metadata-based inference:** CatBoost model analyzing 48 structured tabular features trained on ISIC 2024 patient-level clinical metadata.
- **Authentication & User Management:** User registration and login using bcrypt password hashing and JWT bearer tokens.
- **Database Persistence & Prediction History:** SQLAlchemy ORM with SQLite by default (and PostgreSQL support via `DATABASE_URL`). Authenticated users automatically have their predictions saved to a private history log with full data isolation.
- **Interactive Dashboard:** React/Vite interface with image dropzone preview, ISIC metadata input form, ISIC dataset CSV row loader, and live patient history table.
- **REST API Documentation:** Interactive Swagger UI (`/docs`) for inspecting schemas and testing endpoints.

---

## Tech Stack

### Machine Learning
- **PyTorch & Torchvision:** ResNet-18 image classification
- **CatBoost:** Tabular gradient-boosted decision trees
- **Scikit-learn, Pandas, NumPy, Joblib:** Preprocessing pipeline & frequency encoding

### Backend
- **FastAPI:** High-performance async Python web framework
- **SQLAlchemy:** ORM supporting SQLite (default local) and PostgreSQL
- **Bcrypt & PyJWT:** Secure password hashing and token generation
- **Uvicorn:** ASGI production server
- **Pydantic v2:** Request and response data validation

### Frontend
- **React 18 & Vite:** Modern component-driven single-page architecture
- **Tailwind CSS:** Responsive, restrained clinical aesthetic
- **Lucide React:** Iconography
- **Context API:** Authentication state persisted in local storage

---

## Project Structure

```text
isic-skin-lesion-analysis/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── deps.py                 # DB session & JWT user dependencies
│   │   │   └── v1/
│   │   │       ├── api.py              # Router aggregator
│   │   │       └── endpoints/
│   │   │           ├── auth.py         # Register, Login, Current User
│   │   │           ├── history.py      # User-isolated prediction history CRUD
│   │   │           ├── health.py       # API & service health status
│   │   │           └── predictions.py  # Image & Metadata inference endpoints
│   │   ├── core/
│   │   │   ├── config.py               # Settings & environment variables
│   │   │   └── security.py             # Bcrypt hashing & PyJWT tokens
│   │   ├── db/
│   │   │   ├── models.py               # User and PredictionHistory ORM models
│   │   │   └── session.py              # Engine, sessionmaker, schema init
│   │   ├── schemas/                    # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── db_service.py           # DB connectivity status service
│   │   │   ├── image_service.py        # PyTorch ResNet-18 loader & inference
│   │   │   └── model_service.py        # CatBoost loader & preprocessing pipeline
│   │   └── main.py                     # App entry point, CORS, and lifespan
│   ├── models/                         # Trained model weights & artifacts
│   ├── tests/                          # Backend integration tests
│   ├── .env.example                    # Environment variable template
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/                 # Header, ImageUploader, MetadataForm, etc.
│   │   ├── context/                    # AuthContext (JWT & session state)
│   │   ├── pages/                      # Dashboard and History pages
│   │   └── services/                   # Centralized API client (api.js)
│   ├── package.json
│   └── ...
└── README.md
```

---

## Quickstart & Local Setup

### 1. Prerequisites
- Python 3.10+ (Python 3.12 tested)
- Node.js (v18 or v20 LTS recommended) and npm
- Git

---

### 2. Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. (Optional) Create and activate a virtual environment:
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment (optional):
   ```powershell
   cp .env.example .env
   ```
   *By default, the application runs with a local SQLite database (`isic_app.db`) without any manual setup. To use PostgreSQL, set `DATABASE_URL=postgresql://user:password@localhost:5432/isic_db` in `.env`.*

5. Launch the FastAPI backend server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   * **API Base:** `http://127.0.0.1:8000`
   * **Swagger Docs:** `http://127.0.0.1:8000/docs`
   * **Health Check:** `http://127.0.0.1:8000/health`

---

### 3. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start Vite development server:
   ```bash
   npm run dev
   ```
   * **Application URL:** `http://localhost:5173`

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/register` | Register a new user account and return JWT access token |
| `POST` | `/api/v1/auth/login` | Authenticate with email/password and return JWT token |
| `GET` | `/api/v1/auth/me` | Retrieve profile of the currently authenticated user |

### Model Predictions
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/predictions/metadata` | Run CatBoost inference on ISIC tabular metadata (auto-saved if authenticated) |
| `GET` | `/api/v1/predictions/metadata/row/{isic_id}` | Load complete metadata row for an ISIC ID from local CSV |
| `POST` | `/api/v1/predictions/image` | Run ResNet-18 inference on uploaded skin lesion image (auto-saved if authenticated) |

### Prediction History (Protected)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/predictions/history` | List current user's saved predictions (ordered by newest first) |
| `GET` | `/api/v1/predictions/history/{id}` | Retrieve specific prediction record details belonging to current user |
| `DELETE` | `/api/v1/predictions/history/{id}` | Delete a prediction record belonging to current user |

---

## Testing & Quality Verification

Run backend integration tests:
```powershell
python backend/tests/test_auth_history.py
```
*Validates registration, login, duplicate email prevention, invalid credentials rejection, protected `/auth/me`, metadata prediction persistence, guest prediction execution, and cross-user isolation.*

Run ML model verification:
```powershell
python backend/tests/test_models.py
```
*Validates that CatBoost metadata preprocessing and PyTorch ResNet-18 image classification are loaded and producing valid probabilities.*

Build frontend production bundle:
```powershell
cd frontend
npm run build
```

---

## Research and Medical Disclaimer

This project is intended strictly for machine learning experimentation, software development, and educational evaluation:
- Predictions are experimental model outputs, **not medical diagnoses**.
- Output risk percentages are derived from research benchmarks and must not be interpreted as validated clinical cancer risk.
- Do not make healthcare or patient care decisions based on this application. Always consult a qualified dermatologist or medical professional.
