import { Link, useLocation, Navigate } from "react-router-dom";

function formatIndianPrice(price: number): string {
  if (price >= 1e7) {
    return `₹ ${(price / 1e7).toFixed(2)} Cr`;
  }
  if (price >= 1e5) {
    return `₹ ${(price / 1e5).toFixed(2)} Lac`;
  }
  return `₹ ${price.toLocaleString("en-IN")}`;
}

export default function ResultPage() {
  const location = useLocation();
  const state = location.state as { predictedPrice?: number } | null;

  if (!state || typeof state.predictedPrice !== "number") {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>Estimated price</h1>
        <p>Based on the details you provided</p>
      </div>
      <div className="card" style={{ textAlign: "center" }}>
        <div className="result-price">{formatIndianPrice(state.predictedPrice)}</div>
        <div className="result-sub">
          Exact value: ₹ {Math.round(state.predictedPrice).toLocaleString("en-IN")}
        </div>
        <Link className="back-link" to="/">
          ← Predict another property
        </Link>
      </div>
    </div>
  );
}
