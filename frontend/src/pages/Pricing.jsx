import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await api.get(
          "/plans"
        );

        setPlans(response.data.plans);
      } catch {
        setError("Could not load plans.");
      }
    };

    fetchPlans();
  }, []);

  return (
    <main className="page"><header className="pricing-head"><p className="eyebrow">Simple pricing</p><h1 className="page-title">Choose the plan that fits</h1><p className="page-subtitle">Start free, then upgrade when your team needs more room to think.</p></header>

      {error && (
        <p className="alert alert-error">{error}</p>
      )}

      <div className="pricing-grid">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`card price-card ${plan.name !== "free" ? "featured" : ""}`}
          >
            {plan.name !== "free" && <span className="popular">POPULAR</span>}<span className="badge badge-purple">{plan.name === "free" ? "For individuals" : "For growing teams"}</span><h3>{plan.display_name}</h3>
            <p className="price">${plan.monthly_price}<span> / month</span></p>
            <ul className="features">
              {plan.features.map((feature) => (
                <li key={feature}>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              className={`btn btn-block ${plan.name === "free" ? "btn-ghost" : "btn-primary"}`} disabled={plan.name === "free"}
              onClick={() =>
                window.alert(
                  "Stripe Checkout will be added on production."
                )
              }
            >
              {plan.name === "free"
                ? "Free Plan"
                : "Upgrade to Pro"}
            </button>
          </article>
        ))}
      </div>
    </main>
  );
}
