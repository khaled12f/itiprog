import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  FACING_OPTIONS,
  FURNISHING_OPTIONS,
  OWNERSHIP_OPTIONS,
  TRANSACTION_OPTIONS,
  type PredictionRequest,
} from "../types/prediction";
import { fetchLocations, predictPrice, ApiError } from "../api/predictionClient";

type FormState = {
  location: string;
  carpet_area_sqft: string;
  floor_num: string;
  bathroom: string;
  balcony: string;
  car_parking: string;
  furnishing: PredictionRequest["furnishing"];
  transaction: PredictionRequest["transaction"];
  ownership: string;
  facing: string;
};

const initialState: FormState = {
  location: "",
  carpet_area_sqft: "",
  floor_num: "",
  bathroom: "",
  balcony: "0",
  car_parking: "0",
  furnishing: "Semi-Furnished",
  transaction: "Resale",
  ownership: OWNERSHIP_OPTIONS[0],
  facing: FACING_OPTIONS[0],
};

export default function PredictionForm() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<string[]>([]);
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations()
      .then((locs) => {
        setLocations(locs);
        setForm((f) => ({ ...f, location: locs[0] ?? "" }));
      })
      .catch(() => setLocations([]));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (!form.location) next.location = "Please select a location.";
    if (!form.carpet_area_sqft || Number(form.carpet_area_sqft) <= 0)
      next.carpet_area_sqft = "Area must be greater than 0.";
    if (form.floor_num === "" || Number(form.floor_num) < -1)
      next.floor_num = "Enter a valid floor number.";
    if (form.bathroom === "" || Number(form.bathroom) < 0)
      next.bathroom = "Enter a valid number of bathrooms.";
    if (form.balcony === "" || Number(form.balcony) < 0)
      next.balcony = "Enter a valid number of balconies.";
    if (form.car_parking === "" || Number(form.car_parking) < 0)
      next.car_parking = "Enter a valid number of parking spots.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    const payload: PredictionRequest = {
      location: form.location,
      carpet_area_sqft: Number(form.carpet_area_sqft),
      floor_num: Number(form.floor_num),
      bathroom: Number(form.bathroom),
      balcony: Number(form.balcony),
      car_parking: Number(form.car_parking),
      furnishing: form.furnishing,
      transaction: form.transaction,
      ownership: form.ownership,
      facing: form.facing,
    };

    setLoading(true);
    try {
      const result = await predictPrice(payload);
      navigate("/result", { state: { predictedPrice: result.predicted_price } });
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card" onSubmit={handleSubmit} noValidate>
      {submitError && <div className="banner error">{submitError}</div>}

      <div className="form-grid">
        <div className="form-field full-width">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          >
            {locations.length === 0 && <option value="">Loading locations...</option>}
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
          {errors.location && <span className="field-error">{errors.location}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="carpet_area_sqft">Carpet area (sqft)</label>
          <input
            id="carpet_area_sqft"
            type="number"
            min={1}
            value={form.carpet_area_sqft}
            onChange={(e) => update("carpet_area_sqft", e.target.value)}
          />
          {errors.carpet_area_sqft && (
            <span className="field-error">{errors.carpet_area_sqft}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="floor_num">Floor number</label>
          <input
            id="floor_num"
            type="number"
            min={-1}
            value={form.floor_num}
            onChange={(e) => update("floor_num", e.target.value)}
          />
          {errors.floor_num && <span className="field-error">{errors.floor_num}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="bathroom">Bathrooms</label>
          <input
            id="bathroom"
            type="number"
            min={0}
            value={form.bathroom}
            onChange={(e) => update("bathroom", e.target.value)}
          />
          {errors.bathroom && <span className="field-error">{errors.bathroom}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="balcony">Balconies</label>
          <input
            id="balcony"
            type="number"
            min={0}
            value={form.balcony}
            onChange={(e) => update("balcony", e.target.value)}
          />
          {errors.balcony && <span className="field-error">{errors.balcony}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="car_parking">Car parking spots</label>
          <input
            id="car_parking"
            type="number"
            min={0}
            value={form.car_parking}
            onChange={(e) => update("car_parking", e.target.value)}
          />
          {errors.car_parking && <span className="field-error">{errors.car_parking}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="furnishing">Furnishing</label>
          <select
            id="furnishing"
            value={form.furnishing}
            onChange={(e) =>
              update("furnishing", e.target.value as PredictionRequest["furnishing"])
            }
          >
            {FURNISHING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="transaction">Transaction type</label>
          <select
            id="transaction"
            value={form.transaction}
            onChange={(e) =>
              update("transaction", e.target.value as PredictionRequest["transaction"])
            }
          >
            {TRANSACTION_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="ownership">Ownership</label>
          <select
            id="ownership"
            value={form.ownership}
            onChange={(e) => update("ownership", e.target.value)}
          >
            {OWNERSHIP_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="facing">Facing</label>
          <select
            id="facing"
            value={form.facing}
            onChange={(e) => update("facing", e.target.value)}
          >
            {FACING_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button className="submit-button" type="submit" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? "Predicting..." : "Predict price"}
      </button>
    </form>
  );
}
