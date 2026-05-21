import { useSearchParams, useNavigate } from "react-router-dom";
import { generateFlights } from "../data/nigeria";
import { formatPrice, formatDuration, formatDate } from "../utils/formatters";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── READ URL PARAMS ──────────────────────────────────────
  const origin = searchParams.get("origin");
  const destination = searchParams.get("destination");
  const date = searchParams.get("date");
  const tripType = searchParams.get("tripType");
  const returnDate = searchParams.get("returnDate");
  const adults = Number(searchParams.get("adults"));
  const children = Number(searchParams.get("children"));
  const infants = Number(searchParams.get("infants"));
  const totalPax = adults + children + infants;

  // ─── GENERATE FLIGHTS ─────────────────────────────────────
  const flights = generateFlights(origin, destination, date);

  // ─── CALCULATE TOTAL PRICE PER FLIGHT ─────────────────────
  function getTotalPrice(basePrice) {
    const adultFare = basePrice * adults;
    const childFare = basePrice * 0.75 * children;
    const infantFare = basePrice * 0.1 * infants;
    return adultFare + childFare + infantFare;
  }

  // ─── HANDLE SELECT FLIGHT ─────────────────────────────────
  function handleSelect(flight) {
    const params = new URLSearchParams({
      flightId: flight.id,
      origin,
      destination,
      date,
      adults,
      children,
      infants,
      tripType,
      totalPrice: Math.round(getTotalPrice(flight.price)),
      ...(returnDate ? { returnDate } : {}),
    });
    navigate(`/booking?${params.toString()}`);
  }

  // ─── GUARD: missing params ─────────────────────────────────
  if (!origin || !destination || !date) {
    return (
      <div>
        <p>Invalid search. Please go back and try again.</p>
        <button onClick={() => navigate("/")}>Back to search</button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header>
        <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          ✈ AeroFind
        </span>
      </header>

      {/* Search summary */}
      <section>
        <h2>
          {origin} → {destination}
        </h2>
        <p>
          {formatDate(date)}
          {tripType === "round" &&
            returnDate &&
            ` · Return ${formatDate(returnDate)}`}
          {` · ${totalPax} Passenger${totalPax > 1 ? "s" : ""}`}
        </p>
        <button onClick={() => navigate(-1)}>Modify search</button>
      </section>

      {/* Results */}
      <section>
        {flights.length === 0 ? (
          <div>
            <p>No flights found for this route.</p>
            <button onClick={() => navigate("/")}>Try another search</button>
          </div>
        ) : (
          <>
            <p>{flights.length} flights found</p>

            {flights.map((flight) => (
              <div key={flight.id}>
                {/* Airline */}
                <div>
                  <span>{flight.airline.name}</span>
                  <span>{flight.flightNumber}</span>
                </div>

                {/* Times & duration */}
                <div>
                  <div>
                    <span>{flight.departureTime}</span>
                    <span>{origin}</span>
                  </div>

                  <div>
                    <span>{formatDuration(flight.durationMins)}</span>
                    <span>
                      {flight.stops === 0 ? "Direct" : `${flight.stops} stop`}
                    </span>
                  </div>

                  <div>
                    <span>{flight.arrivalTime}</span>
                    <span>{destination}</span>
                  </div>
                </div>

                {/* Price & CTA */}
                <div>
                  <div>
                    <span>{formatPrice(getTotalPrice(flight.price))}</span>
                    <span>
                      for {totalPax} passenger{totalPax > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div>
                    <span>{flight.seatsLeft} seats left</span>
                  </div>
                  <button onClick={() => handleSelect(flight)}>Select</button>
                </div>
              </div>
            ))}
          </>
        )}
      </section>
    </div>
  );
}
