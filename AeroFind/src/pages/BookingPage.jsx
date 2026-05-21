import { useSearchParams, useNavigate } from "react-router-dom";
import { AIRPORTS } from "../data/nigeria";
import {
  formatPrice,
  formatDate,
  todayString,
  handleBookingRef,
  getPastDate,
} from "../utils/formatters";
import { useState } from "react";

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── READ URL PARAMS ──────────────────────────────────────
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const returnDate = searchParams.get("returnDate");
  const tripType = searchParams.get("tripType");
  const adults = Number(searchParams.get("adults"));
  const children = Number(searchParams.get("children"));
  const infants = Number(searchParams.get("infants"));
  const totalPrice = Number(searchParams.get("totalPrice"));
  const flightId = searchParams.get("flightId");

  // ─── DERIVE AIRPORT NAMES ─────────────────────────────────
  const originAirport = AIRPORTS.find((a) => a.code === origin);
  const destinationAirport = AIRPORTS.find((a) => a.code === destination);

  // ─── BUILD PASSENGER SLOTS ────────────────────────────────
  // e.g. 2 adults + 1 child = ['adult', 'adult', 'child']
  const passengerSlots = [
    ...Array(adults).fill("adult"),
    ...Array(children).fill("child"),
    ...Array(infants).fill("infant"),
  ];

  // ─── PASSENGER FORM STATE ─────────────────────────────────
  // One form entry per passenger slot
  const emptyPassenger = { firstName: "", lastName: "", gender: "", dob: "" };
  const [passengerForms, setPassengerForms] = useState(
    passengerSlots.map(() => ({ ...emptyPassenger })),
  );

  // ─── CONTACT DETAILS STATE ────────────────────────────────
  const [contact, setContact] = useState({ email: "", phone: "" });

  // ─── BOOKING CONFIRMED STATE ──────────────────────────────
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  // ─── UPDATE A SINGLE PASSENGER FIELD ─────────────────────
  function updatePassenger(index, field, value) {
    setPassengerForms((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
  function handleConfirm(e) {
    e.preventDefault();
    const err = validate();
    if (err) return setError(err);
    setError("");
    setConfirmed(true);
  }

  // ─── GUARD ────────────────────────────────────────────────
  if (!origin || !destination || !date || !flightId) {
    return (
      <div>
        <p>Invalid booking. Please search for a flight first.</p>
        <button onClick={() => navigate("/")}>Back to search</button>
      </div>
    );
  }

  // ─── CONFIRMATION SCREEN ──────────────────────────────────
  if (confirmed) {
    const bookingRef = handleBookingRef();
    return (
      <div>
        <header>
          <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            ✈ AeroFind
          </span>
        </header>

        <section>
          <h2>Booking Confirmed! 🎉</h2>
          <p>
            Booking reference: <strong>{bookingRef}</strong>
          </p>
          <p>
            {originAirport.city} → {destinationAirport.city}
          </p>
          <p>{formatDate(date)}</p>
          <p>
            {passengerSlots.length} Passenger
            {passengerSlots.length > 1 ? "s" : ""}
          </p>
          <p>Total paid: {formatPrice(totalPrice)}</p>
          <p>A confirmation will be sent to {contact.email}</p>
          <button onClick={() => navigate("/")}>Book another flight</button>
        </section>
      </div>
    );
  }

  // ─── MAIN BOOKING FORM ────────────────────────────────────
  return (
    <div>
      <header>
        <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          ✈ AeroFind
        </span>
      </header>

      <form onSubmit={handleConfirm}>
        {/* Flight summary */}
        <section>
          <h2>Flight Summary</h2>
          <p>
            {originAirport.city} ({origin}) → {destinationAirport.city} (
            {destination})
          </p>
          <p>{formatDate(date)}</p>
          {tripType === "round" && returnDate && (
            <p>Return: {formatDate(returnDate)}</p>
          )}
          <p>Flight: {flightId.split("-")[0]}</p>
        </section>

        {/* Passenger forms */}
        <section>
          <h2>Passenger Details</h2>

          {passengerSlots.map((type, index) => (
            <div key={index}>
              <h3>
                Passenger {index + 1} —{" "}
                {type.charAt(0).toUpperCase() + type.substring(1)}
              </h3>

              <div>
                <label>First name</label>
                <input
                  type="text"
                  value={passengerForms[index].firstName}
                  onChange={(e) =>
                    updatePassenger(index, "firstName", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Last name</label>
                <input
                  type="text"
                  value={passengerForms[index].lastName}
                  onChange={(e) =>
                    updatePassenger(index, "lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label>Gender</label>
                <select
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

              {/* DOB only for children and infants */}
              {type === "infant" && (
                <div>
                  <label>Date of birth</label>
                  <input
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
                <div>
                  <label>Date of birth</label>
                  <input
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
          ))}
        </section>

        {/* Contact details */}
        <section>
          <h2>Contact Details</h2>
          <p>Your booking confirmation will be sent here</p>

          <div>
            <label>Email address</label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
            />
          </div>

          <div>
            <label>Phone number</label>
            <input
              type="tel"
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
            />
          </div>
        </section>

        {/* Price summary */}
        <section>
          <h2>Price Summary</h2>
          <p>Total: {formatPrice(totalPrice)}</p>
          <p>
            {adults > 0 && `${adults} Adult${adults > 1 ? "s" : ""}`}
            {children > 0 && ` · ${children} Child${children > 1 ? "ren" : ""}`}
            {infants > 0 && ` · ${infants} Infant${infants > 1 ? "s" : ""}`}
          </p>
        </section>

        {error && <p>{error}</p>}

        <button type="submit">Confirm booking</button>
      </form>
    </div>
  );
}
