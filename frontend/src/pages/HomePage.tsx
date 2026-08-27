import PredictionForm from "../components/PredictionForm";

export default function HomePage() {
  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>🏠 House Price Prediction</h1>
        <p>Enter the property details below to get an estimated price.</p>
      </div>
      <PredictionForm />
    </div>
  );
}
