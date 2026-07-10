import { useSearchParams, useNavigate } from "react-router-dom";
import { createPaymentIntent } from "../api/bookings";
import useAuth from "../context/useAuth";
import { useState, useMemo } from "react";
import { AIRPORTS, AIRLINES } from "../data/nigeria";
import {
  formatPrice,
  formatDate,
  todayString,
  getPastDate,
} from "../utils/formatters";
import styles from "./BookingPage.module.css";
import tick from "../assets/tick.png";
import PaymentForm from "../components/ui/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function BookingPage() {
  const [bookingRef, setBookingRef] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState("details"); // 'details' | 'payment'
  const [clientSecret, setClientSecret] = useState("");

  // ─── URL PARAMS ───────────────────────────────────────────
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const departureTime = searchParams.get("departureTime");
  const arrivalTime = searchParams.get("arrivalTime");
  const returnDate = searchParams.get("returnDate");
  const tripType = searchParams.get("tripType");
  const adults = Number(searchParams.get("adults"));
  const children = Number(searchParams.get("children"));
  const infants = Number(searchParams.get("infants"));
  const totalPrice = Number(searchParams.get("totalPrice"));
  const flightId = searchParams.get("flightId");
  const flightNumber = searchParams.get("flightNumber");
  const cabinClass = searchParams.get("cabinClass") ?? "economy";

  // ─── DERIVED DATA ─────────────────────────────────────────
  const originAirport = AIRPORTS.find((a) => a.code === origin);
  const destinationAirport = AIRPORTS.find((a) => a.code === destination);

  // parse airline code + flight number from flightId
  // flightId format: "AT-2026-06-10-LOS-ABV-0"
  const flightCode = flightId?.split("-")[0] ?? "";
  const airline = AIRLINES.find((a) => a.code === flightCode);

  // ─── PASSENGER SLOTS ──────────────────────────────────────
  const passengerSlots = [
    ...Array(adults).fill("adult"),
    ...Array(children).fill("child"),
    ...Array(infants).fill("infant"),
  ];

  // ─── PRICE BREAKDOWN ──────────────────────────────────────
  // back-calculate base price per adult from totalPrice
  const basePricePerAdult = useMemo(() => {
    const divisor = adults + children * 0.75 + infants * 0.1;
    return divisor > 0 ? totalPrice / divisor : 0;
  }, [totalPrice, adults, children, infants]);

  // ─── STATE ────────────────────────────────────────────────
  const emptyPassenger = { firstName: "", lastName: "", gender: "", dob: "" };
  const [passengerForms, setPassengerForms] = useState(
    passengerSlots.map(() => ({ ...emptyPassenger })),
  );
  const [contact, setContact] = useState({ email: "", phone: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── HELPERS ──────────────────────────────────────────────
  function updatePassenger(index, field, value) {
    setPassengerForms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }

  function badgeClass(type) {
    if (type === "adult") return styles.badgeAdult;
    if (type === "child") return styles.badgeChild;
    return styles.badgeInfant;
  }

  // ─── VALIDATION ───────────────────────────────────────────
  function validate() {
    for (let i = 0; i < passengerForms.length; i++) {
      const p = passengerForms[i];
      const type = passengerSlots[i];
      if (!p.firstName.trim())
        return `Passenger ${i + 1}: first name is required.`;
      if (!p.lastName.trim())
        return `Passenger ${i + 1}: last name is required.`;
      if (!p.gender) return `Passenger ${i + 1}: gender is required.`;
      if (type !== "adult" && !p.dob)
        return `Passenger ${i + 1}: date of birth is required.`;
    }
    if (!contact.email.includes("@"))
      return "Please enter a valid email address.";
    if (contact.phone.length < 11) return "Please enter a valid phone number.";
    return "";
  }

  // ─── SUBMIT ───────────────────────────────────────────────
  // async function handleConfirm(e) {
  //   e.preventDefault();
  //   const err = validate();
  //   if (err) return setError(err);

  //   // redirect to login if not authenticated
  //   if (!user) {
  //     setBookingRef(handleBookingRef());
  //     setConfirmed(true);
  //     return;
  //   }

  //   setError("");
  //   setLoading(true);

  //   try {
  //     const booking = await createBooking({
  //       flight_id: Number(flightId),
  //       total_price: totalPrice,
  //       seats: searchParams.get("seats") ?? "",
  //       cabin_class: cabinClass,
  //       adults,
  //       children,
  //       infants,
  //       passengers: passengerForms.map((p, i) => ({
  //         first_name: p.firstName,
  //         last_name: p.lastName,
  //         gender: p.gender,
  //         dob: p.dob || null,
  //         pax_type: passengerSlots[i],
  //       })),
  //     });

  //     setBookingRef(booking.booking_ref);
  //     setConfirmed(true);
  //   } catch (err) {
  //     console.log(err);
  //     setError("Booking failed. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function handleConfirm(e) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);

    if (!user) {
      navigate("/login");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await createPaymentIntent(totalPrice);
      setClientSecret(data.client_secret);
      setStep("payment");
    } catch {
      setError("Could not initiate payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ─── GUARD ────────────────────────────────────────────────
  if (!origin || !destination || !date || !flightId) {
    return (
      <div className={styles.confirmPage}>
        <div className={styles.confirmCard}>
          <p className={styles.confirmTitle}>Invalid booking</p>
          <p
            style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}
          >
            Please search for a flight first.
          </p>
          <button className={styles.newSearchBtn} onClick={() => navigate("/")}>
            Back to search
          </button>
        </div>
      </div>
    );
  }

  // ─── CONFIRMATION SCREEN ──────────────────────────────────
  if (confirmed) {
    return (
      <div className={styles.confirmPage}>
        <div className={styles.confirmCard}>
          <div>
            {" "}
            <img src={tick} className={styles.confirmImg} />{" "}
          </div>
          <h2 className={styles.confirmTitle}>Booking Confirmed!</h2>
          <div className={styles.confirmRef}>{bookingRef}</div>

          <div className={styles.confirmDetails}>
            <div className={styles.confirmRow}>
              <span className={styles.confirmRowLabel}>Route</span>
              <span className={styles.confirmRowValue}>
                {originAirport?.city} → {destinationAirport?.city}
              </span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmRowLabel}>Class</span>
              <span className={styles.confirmRowValue}>
                {cabinClass === "business" ? "Business" : "Economy"}
              </span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmRowLabel}>Date</span>
              <span className={styles.confirmRowValue}>{formatDate(date)}</span>
            </div>
            {tripType === "round" && returnDate && (
              <div className={styles.confirmRow}>
                <span className={styles.confirmRowLabel}>Return</span>
                <span className={styles.confirmRowValue}>
                  {formatDate(returnDate)}
                </span>
              </div>
            )}
            <div className={styles.confirmRow}>
              <span className={styles.confirmRowLabel}>Passengers</span>
              <span className={styles.confirmRowValue}>
                {passengerSlots.length} passenger
                {passengerSlots.length > 1 ? "s" : ""}
              </span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmRowLabel}>Total paid</span>
              <span className={styles.confirmRowValue}>
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>

          <p className={styles.confirmEmail}>
            Confirmation sent to <strong>{contact.email}</strong>
          </p>

          <button className={styles.newSearchBtn} onClick={() => navigate("/")}>
            Book another flight
          </button>
        </div>
      </div>
    );
  }

  // ─── MAIN BOOKING FORM ────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <span className={styles.logo} onClick={() => navigate("/")}>
          ✈ AeroFind
        </span>
        <button className={styles.backBtn} onClick={() => navigate(-2)}>
          ← Back to results
        </button>
      </header>

      <div>
        <div className={styles.main}>
          {/* ── LEFT COLUMN ── */}
          {step === "details" && (
            <>
              {/* ── all your existing form content stays here unchanged ── */}
              {/* flight summary, passenger cards, contact details */}
              <div>
                {/* Flight summary */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Your Flight</h2>
                  <div className={styles.flightSummary}>
                    <div className={styles.summaryTimes}>
                      <div className={styles.summaryTimeBlock}>
                        <span className={styles.summaryTime}>
                          {departureTime ?? "--:--"}
                        </span>
                        <span className={styles.summaryAirport}>{origin}</span>
                      </div>
                      <span className={styles.summaryArrow}>——✈——</span>
                      <div className={styles.summaryTimeBlock}>
                        <span className={styles.summaryTime}>
                          {arrivalTime ?? "--:--"}
                        </span>
                        <span className={styles.summaryAirport}>
                          {destination}
                        </span>
                      </div>
                    </div>
                    <div className={styles.summaryMeta}>
                      <span className={styles.summaryAirline}>
                        {airline?.name ?? "Airline"}
                      </span>
                      <span className={styles.summaryFlight}>
                        {flightNumber}
                      </span>
                      <span className={styles.summaryDate}>
                        {formatDate(date)}
                      </span>
                      <span
                        className={`${styles.summaryClass} ${cabinClass === "business" ? styles.summaryClassBusiness : styles.summaryClassEconomy}`}
                      >
                        {cabinClass === "business" ? "✦ Business" : "Economy"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Passenger forms */}
                {passengerSlots.map((type, index) => (
                  <div key={index} className={styles.passengerCard}>
                    <div className={styles.passengerHeader}>
                      <h3 className={styles.passengerTitle}>
                        Passenger {index + 1}
                      </h3>
                      <span
                        className={`${styles.passengerBadge} ${badgeClass(type)}`}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </span>
                    </div>

                    <div className={styles.formGrid}>
                      <div className={styles.field}>
                        <label className={styles.label}>First name</label>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="e.g. Sawfiyah"
                          value={passengerForms[index].firstName}
                          onChange={(e) =>
                            updatePassenger(index, "firstName", e.target.value)
                          }
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label}>Last name</label>
                        <input
                          className={styles.input}
                          type="text"
                          placeholder="e.g. Bagudu"
                          value={passengerForms[index].lastName}
                          onChange={(e) =>
                            updatePassenger(index, "lastName", e.target.value)
                          }
                        />
                      </div>

                      <div
                        className={`${styles.field} ${type !== "adult" ? "" : styles.formGridFull}`}
                      >
                        <label className={styles.label}>Gender</label>
                        <select
                          className={styles.select}
                          value={passengerForms[index].gender}
                          onChange={(e) =>
                            updatePassenger(index, "gender", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Prefer not to say</option>
                        </select>
                      </div>

                      {type === "infant" && (
                        <div className={styles.field}>
                          <label className={styles.label}>Date of birth</label>
                          <input
                            className={styles.input}
                            type="date"
                            max={todayString()}
                            min={getPastDate(2)}
                            value={passengerForms[index].dob}
                            onChange={(e) =>
                              updatePassenger(index, "dob", e.target.value)
                            }
                          />
                        </div>
                      )}

                      {type === "child" && (
                        <div className={styles.field}>
                          <label className={styles.label}>Date of birth</label>
                          <input
                            className={styles.input}
                            type="date"
                            max={getPastDate(2)}
                            min={getPastDate(11)}
                            value={passengerForms[index].dob}
                            onChange={(e) =>
                              updatePassenger(index, "dob", e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Contact details */}
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Contact Details</h2>
                  <div className={styles.contactGrid}>
                    <div className={styles.field}>
                      <label className={styles.label}>Email address</label>
                      <input
                        className={styles.input}
                        type="email"
                        placeholder="you@example.com"
                        value={contact.email}
                        onChange={(e) =>
                          setContact({ ...contact, email: e.target.value })
                        }
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Phone number</label>
                      <input
                        className={styles.input}
                        type="tel"
                        placeholder="08012345678"
                        value={contact.phone}
                        onChange={(e) =>
                          setContact({ ...contact, phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                {error && <p className={styles.error}>⚠ {error}</p>}
              </div>
            </>
          )}

          {step === "payment" && clientSecret && (
            <div className={styles.paymentWrap}>
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <PaymentForm
                  clientSecret={clientSecret}
                  totalPrice={totalPrice}
                  passengerForms={passengerForms}
                  passengerSlots={passengerSlots}
                  contact={contact}
                  searchParams={searchParams}
                  flightId={flightId}
                  origin={origin}
                  destination={destination}
                  date={date}
                  adults={adults}
                  children={children}
                  infants={infants}
                  cabinClass={cabinClass}
                  returnDate={returnDate}
                  tripType={tripType}
                  onSuccess={(ref) => {
                    setBookingRef(ref);
                    setConfirmed(true);
                  }}
                  onBack={() => setStep("details")}
                />
              </Elements>
            </div>
          )}

          {/* ── RIGHT SIDEBAR ── */}
          <div className={styles.sidebar}>
            <div className={styles.priceCard}>
              <h3 className={styles.priceTitle}>Price Summary</h3>
              {adults > 0 && (
                <div className={styles.priceRow}>
                  <span>
                    {adults} Adult{adults > 1 ? "s" : ""} ×{" "}
                    {formatPrice(basePricePerAdult)}
                  </span>
                  <span>{formatPrice(basePricePerAdult * adults)}</span>
                </div>
              )}
              {children > 0 && (
                <div className={styles.priceRow}>
                  <span>
                    {children} Child{children > 1 ? "ren" : ""} ×{" "}
                    {formatPrice(basePricePerAdult * 0.75)}
                  </span>
                  <span>
                    {formatPrice(basePricePerAdult * 0.75 * children)}
                  </span>
                </div>
              )}
              {infants > 0 && (
                <div className={styles.priceRow}>
                  <span>
                    {infants} Infant{infants > 1 ? "s" : ""} x{" "}
                    {formatPrice(basePricePerAdult * 0.1)}
                  </span>
                  <span>{formatPrice(basePricePerAdult * 0.1 * infants)}</span>
                </div>
              )}
              <div className={styles.priceRowTotal}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>

              {step === "details" && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  className={styles.confirmBtn}
                  disabled={loading}
                >
                  {loading ? "Please wait..." : "Continue to payment →"}
                </button>
              )}

              <p className={styles.secureNote}>🔒 Secure payment via Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
