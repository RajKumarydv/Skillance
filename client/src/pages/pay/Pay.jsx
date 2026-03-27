// src/pages/Pay/Pay.jsx

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { axiosFetch } from "../../utils";
import { CheckoutForm } from "../../components";
import "./Pay.scss";

// ✅ Stripe public key from .env
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
console.log("Stripe Publishable Key:", import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


const Pay = () => {
  const { _id } = useParams();
  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axiosFetch.post(
          `/orders/create-payment-intent/${_id}`
        );
        console.log("CLIENT SECRET:", data.clientSecret); // ✅ Debug log
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error(
          "Payment intent creation failed:",
          err?.response?.data || err.message
        );
        setError("Failed to initialize payment. Please try again.");
      }
    })();
    window.scrollTo(0, 0);
  }, [_id]);

  const appearance = {
    theme: "stripe",
  };

  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="pay">
      <h2>Pay Securely with Stripe</h2>
      {error && <p className="error">{error}</p>}
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : !error ? (
        <p>Loading payment form...</p>
      ) : null}
    </div>
  );
};

export default Pay;
