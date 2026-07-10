import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { createBooking } from "../../api/bookings";
import styles from "./PaymentForm.module.css";

export default function PaymentForm({
  clientSecret,
  totalPrice,
  passengerForms,
  passengerSlots,
  contact,
  searchParams,
  flightId,
  adults,
  children,
  infants,
  cabinClass,
  onSuccess,
  onBack,
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay(e) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      // ── confirm payment with Stripe ──
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { email: contact.email },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // ── payment succeeded → create booking in Django ──
        const booking = await createBooking({
          flight_id: Number(flightId),
          total_price: totalPrice,
          seats: searchParams.get("seats") ?? "",
          cabin_class: cabinClass,
          adults,
          children,
          infants,
          stripe_payment_id: paymentIntent.id,
          passengers: passengerForms.map((p, i) => ({
            first_name: p.firstName,
            last_name: p.lastName,
            gender: p.gender,
            dob: p.dob || null,
            pax_type: passengerSlots[i],
          })),
        });

        onSuccess(booking.booking_ref);
      }
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>Payment details</h2>
      <p className={styles.sub}>
        Your card will be charged ₦{totalPrice.toLocaleString("en-NG")}
      </p>

      <form onSubmit={handlePay} className={styles.form}>
        <div className={styles.cardWrap}>
          <label className={styles.label}>Card details</label>
          <div className={styles.cardElement}>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#1a1a1a",
                    fontFamily: "Inter, system-ui, sans-serif",
                    "::placeholder": { color: "#9ca3af" },
                  },
                  invalid: { color: "#dc2626" },
                },
              }}
            />
          </div>
        </div>

        {error && <p className={styles.error}>⚠ {error}</p>}

        <button
          type="submit"
          className={styles.payBtn}
          disabled={!stripe || loading}
        >
          {loading
            ? "Processing payment..."
            : `Pay ₦${totalPrice.toLocaleString("en-NG")} →`}
        </button>

        <button
          type="button"
          className={styles.backBtn}
          onClick={onBack}
          disabled={loading}
        >
          ← Back to passenger details
        </button>
      </form>

      <p className={styles.stripeNote}>
        🔒 Payments secured by Stripe. We never store your card details.
      </p>
    </div>
  );
}
