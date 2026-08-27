# 🏠 House Price Prediction — End-to-End ML Web App

An end-to-end machine-learning product: a Jupyter notebook that cleans real-estate data and
trains a regression model, a **FastAPI** backend that serves it, and a **React + TypeScript**
frontend where a user enters property details and instantly sees a predicted price.

> **Dataset note:** This build environment had no network access to `kaggle.com`, so the model
> here was trained on a **synthetic dataset** (`notebooks/gen_data.py`) that reproduces the
> exact column names and messiness of the real
> [House Price dataset by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price)
> (text prices like `"42 Lac"`, text areas like `"1200 sqft"`, floor strings like
> `"3 out of 10"`, high-cardinality locations, missing values, etc.). Drop the real
> `house_prices.csv` into `notebooks/data/` and re-run the notebook — **no other code changes
> are needed**, since every column name matches.

---

## Overview

1. A **Jupyter notebook** (`notebooks/house_price_model.ipynb`) loads the raw CSV, explores it,
   cleans/engineers features, trains and compares several regression models, and exports the
   winning model as `house_price.pkl` (a full scikit-learn `Pipeline`, so all preprocessing
   travels with the model).
2. A **FastAPI backend** (`backend/`) loads that pipeline once at startup and exposes a
   `POST /predict` endpoint.
3. A **React + TypeScript + Vite frontend** (`frontend/`) lets a user fill in property details
   and shows the predicted price.

## Architecture

```
┌─────────────────┐        HTTP (JSON)        ┌───────────────────┐        joblib.load        ┌─────────────────────┐
│  React Frontend  │  ───────────────────────▶ │   FastAPI Backend  │ ─────────────────────────▶ │ house_price.pkl       │
│  (Vite, :5173)   │ ◀─────────────────────── │   (:8000)          │                            │ (sklearn Pipeline:    │
│  PredictionForm  │      predicted_price       │  /predict /health  │                            │  ColumnTransformer +  │
└─────────────────┘                            └───────────────────┘                            │  RandomForestRegressor)│
                                                                                                  └─────────────────────┘
                                                          ▲
                                                          │ trained & exported by
                                                          │
                                                ┌───────────────────────┐
                                                │ Jupyter Notebook        │
                                                │ (clean → train → eval)  │
                                                │ notebooks/*.ipynb       │
                                                └───────────────────────┘
```

## Tech stack

| Layer      | Technology |
|------------|------------|
| Modeling   | Python, pandas, scikit-learn, matplotlib, seaborn, joblib |
| Backend    | FastAPI, Pydantic v2, pydantic-settings, uvicorn |
| Frontend   | React 18, TypeScript, Vite, react-router-dom |
| Packaging  | Docker (backend), npm (frontend) |

## Project structure

```
house-price-project/
├── notebooks/
│   ├── house_price_model.ipynb   # full training notebook (runs top-to-bottom)
│   ├── gen_data.py               # generates the synthetic dataset (see note above)
│   └── data/house_prices.csv     # dataset (not committed if using the real Kaggle file)
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI app, CORS, model loaded at startup (lifespan)
│   │   ├── api/routes/prediction.py   # GET /health, POST /predict
│   │   ├── core/config.py             # Settings from .env (pydantic-settings)
│   │   ├── schemas/prediction.py      # PredictionRequest / PredictionResponse
│   │   ├── services/
│   │   │   ├── preprocessing.py       # turns a request into a one-row DataFrame
│   │   │   └── inference.py           # loads .pkl, runs predict()
│   │   ├── utils/logging_config.py
│   │   ├── locations.json             # exported by the notebook, used for validation
│   │   └── model_metadata.json        # exported by the notebook (metrics, target transform)
│   ├── models/house_price.pkl         # ← copied from the notebook
│   ├── tests/test_prediction.py
│   ├── requirements.txt
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/predictionClient.ts    # fetch wrapper, base URL from VITE_API_BASE_URL
│   │   ├── components/PredictionForm.tsx
│   │   ├── pages/HomePage.tsx | ResultPage.tsx | NotFoundPage.tsx
│   │   ├── types/prediction.ts        # TS types mirroring the backend schema
│   │   └── App.tsx                    # routes: / , /result , * (404)
│   ├── public/locations.json          # copied from backend/app/locations.json
│   └── .env.example
├── docs/screenshots/                  # add your own screenshots here (see below)
└── README.md
```

## Dataset

- **Source:** [House Price by Juhi Bhojani](https://www.kaggle.com/datasets/juhibhojani/house-price) on Kaggle (~187,000 real Indian property listings).
- **Download (Kaggle CLI):**

```bash
pip install kaggle
# Get your API token: Kaggle → Settings → API → "Create New Token"
# Place kaggle.json in C:\Users\<you>\.kaggle\ (Windows) or ~/.kaggle/ (macOS/Linux)
kaggle datasets download -d juhibhojani/house-price -p notebooks/data --unzip
```

- **In this repository**, `notebooks/data/house_prices.csv` was instead generated by
  `notebooks/gen_data.py` (synthetic data, same schema — see the note at the top of this file).
  Regenerate it any time with:

```bash
cd notebooks
python gen_data.py
```

## Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # .venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
# open http://localhost:8000/docs
```

Run tests:

```bash
pytest
```

### Environment variables (`backend/.env`)

| Variable          | Default                          | Description                              |
|-------------------|-----------------------------------|-------------------------------------------|
| `APP_NAME`        | `House Price Prediction API`      | Display name used in the FastAPI app.     |
| `MODEL_PATH`       | `models/house_price.pkl`          | Path to the exported pipeline.            |
| `LOCATIONS_PATH`   | `app/locations.json`              | Known locations used to map unknown ones to `"other"`. |
| `METADATA_PATH`    | `app/model_metadata.json`         | Tells the backend whether to `expm1()` the prediction. |
| `CORS_ORIGINS`     | `http://localhost:5173`           | Comma-separated list of allowed frontend origins. |

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
# open http://localhost:5173
```

### Environment variables (`frontend/.env`)

| Variable               | Default                  | Description                          |
|------------------------|---------------------------|----------------------------------------|
| `VITE_API_BASE_URL`    | `http://localhost:8000`   | Base URL of the FastAPI backend.      |

Build for production:

```bash
npm run build
```

## API reference

### `GET /health`

```bash
curl http://localhost:8000/health
```

```json
{"status": "ok"}
```

### `POST /predict`

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "location": "Wakad, Pune",
    "carpet_area_sqft": 1200,
    "floor_num": 3,
    "bathroom": 2,
    "balcony": 1,
    "car_parking": 1,
    "furnishing": "Semi-Furnished",
    "transaction": "Resale",
    "ownership": "Freehold",
    "facing": "East"
  }'
```

```json
{"predicted_price": 9778266.82}
```

## Model metrics (test set)

Winning model: **RandomForestRegressor** trained on `log1p(price)` (inverted with `expm1` at
prediction time), chosen from 6 model+target combinations compared in the notebook
(`LinearRegression`, `RandomForestRegressor`, `GradientBoostingRegressor` × raw price /
log1p(price)).

| Metric | Value |
|--------|-------|
| MAE    | ₹ 2,222,696 |
| RMSE   | ₹ 3,234,194 |
| R²     | 0.849 |

*(Full comparison table, predicted-vs-actual plot, and 5-fold cross-validation are in the notebook.)*

## Screenshots

> Run the app locally (`uvicorn` + `npm run dev`) and drop your own screenshots here — this
> sandboxed build environment could not launch a browser to capture them.

- `docs/screenshots/form.png` — the prediction form
- `docs/screenshots/result.png` — the predicted price page

## Deliverables checklist

- [x] `notebooks/house_price_model.ipynb` — runs top-to-bottom without errors, with EDA plots,
      cleaning, 6 model/target combinations compared, test metrics, and model export.
- [x] `backend/` — FastAPI app with `/health` + `/predict`, `.env.example`, pinned
      `requirements.txt`, passing `pytest` (3/3 tests).
- [x] `frontend/` — React form → result page, `.env.example`, `npm run build` succeeds.
- [x] `models/house_price.pkl` (in `backend/models/`) served by the backend and produced by the notebook.
- [x] Root `README.md`.
- [ ] Public GitHub repository — push this folder yourself (see below).
- [x] End-to-end demo works: form → API → model → predicted price on screen (verified with `curl`).

## Publishing to GitHub

```bash
git init
git add .
git commit -m "House price prediction: notebook, FastAPI backend, React frontend"
git branch -M main
git remote add origin https://github.com/<your-username>/house-price-app.git
git push -u origin main
```

`.gitignore` already excludes `.venv/`, `__pycache__/`, `node_modules/`, `dist/`, `.env`,
`*.log`, and the raw dataset CSV.
