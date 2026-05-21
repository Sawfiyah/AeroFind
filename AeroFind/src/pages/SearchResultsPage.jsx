import { useSearchParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { generateFlights } from "../data/nigeria";
import { formatPrice, formatDuration, formatDate } from "../utils/formatters";
import styles from "./SearchResultsPage.module.css";

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState("cheapest");

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

  // ─── GENERATE + SORT FLIGHTS ──────────────────────────────
  // ─── GENERATE ONCE (only when route/date changes) ─────────
  const flights = useMemo(() => {
    return generateFlights(origin, destination, date);
  }, [origin, destination, date]); // ← sortBy removed from deps

  // ─── SORT SEPARATELY (only when flights or sortBy changes) ─
  const sortedFlights = useMemo(() => {
    if (sortBy === "cheapest")
      return [...flights].sort((a, b) => a.price - b.price);
    if (sortBy === "earliest")
      return [...flights].sort((a, b) =>
        a.departureTime.localeCompare(b.departureTime),
      );
    if (sortBy === "fastest")
      return [...flights].sort((a, b) => a.durationMins - b.durationMins);
    return flights;
  }, [flights, sortBy]);

  // ─── TOTAL PRICE ──────────────────────────────────────────
  function getTotalPrice(basePrice) {
    return (
      basePrice * adults +
      basePrice * 0.75 * children +
      basePrice * 0.1 * infants
    );
  }

  // ─── SELECT FLIGHT ────────────────────────────────────────
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

  // ─── GUARD ────────────────────────────────────────────────
  if (!origin || !destination || !date) {
    return (
      <div className={styles.page}>
        <div
          className={styles.empty}
          style={{ margin: "4rem auto", maxWidth: 400 }}
        >
          <p className={styles.emptyTitle}>Invalid search</p>
          <p className={styles.emptyText}>Please go back and try again.</p>
          <button className={styles.backBtn} onClick={() => navigate("/")}>
            Back to search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Navbar */}
      <header className={styles.navbar}>
        <span className={styles.logo} onClick={() => navigate("/")}>
          ✈ AeroFind
        </span>
      </header>

      {/* Summary bar */}
      <div className={styles.summaryBar}>
        <div className={styles.summaryInner}>
          <div>
            <div className={styles.summaryRoute}>
              {origin} → {destination}
            </div>
            <div className={styles.summaryMeta}>
              {formatDate(date)}
              {tripType === "round" &&
                returnDate &&
                ` · Return ${formatDate(returnDate)}`}
              {` · ${totalPax} Passenger${totalPax > 1 ? "s" : ""}`}
            </div>
          </div>
          <button className={styles.modifyBtn} onClick={() => navigate(-1)}>
            Modify search
          </button>
        </div>
      </div>

      {/* Results */}
      <main className={styles.main}>
        {/* Sort bar */}
        <div className={styles.sortBar}>
          <span className={styles.resultsCount}>
            {sortedFlights.length} flight{sortedFlights.length !== 1 ? "s" : ""}{" "}
            found
          </span>
          <div className={styles.sortBtns}>
            {[
              { key: "cheapest", label: "Cheapest" },
              { key: "earliest", label: "Earliest" },
              { key: "fastest", label: "Fastest" },
            ].map(({ key, label }) => (
              <button
                key={key}
                className={`${styles.sortBtn} ${sortBy === key ? styles.sortBtnActive : ""}`}
                onClick={() => setSortBy(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Flight cards */}
        {sortedFlights.length === 0 ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No flights found</p>
            <p className={styles.emptyText}>Try a different date or route.</p>
            <button className={styles.backBtn} onClick={() => navigate("/")}>
              Try another search
            </button>
          </div>
        ) : (
          sortedFlights.map((flight) => (
            <div key={flight.id} className={styles.flightCard}>
              {/* Airline */}
              <div className={styles.airlineCol}>
                <span className={styles.airlineName}>
                  {flight.airline.name}
                </span>
                <span className={styles.flightNumber}>
                  {flight.flightNumber}
                </span>
              </div>

              {/* Times */}
              <div className={styles.timesCol}>
                <div className={styles.timeBlock}>
                  <span className={styles.time}>{flight.departureTime}</span>
                  <span className={styles.airportCode}>{origin}</span>
                </div>

                <div className={styles.durationBlock}>
                  <div className={styles.durationLine}>
                    <div className={styles.line} />
                    <span className={styles.plane}>✈</span>
                    <div className={styles.line} />
                  </div>
                  <span className={styles.durationText}>
                    {formatDuration(flight.durationMins)}
                  </span>
                  <span
                    className={`${styles.stops} ${flight.stops === 0 ? styles.stopsDirect : styles.stopsOne}`}
                  >
                    {flight.stops === 0 ? "Direct" : "1 stop"}
                  </span>
                </div>

                <div className={styles.timeBlock}>
                  <span className={styles.time}>{flight.arrivalTime}</span>
                  <span className={styles.airportCode}>{destination}</span>
                </div>
              </div>

              {/* Price */}
              <div className={styles.priceCol}>
                <span className={styles.price}>
                  {formatPrice(getTotalPrice(flight.price))}
                </span>
                <span className={styles.paxNote}>
                  for {totalPax} passenger{totalPax > 1 ? "s" : ""}
                </span>
                <span
                  className={
                    flight.seatsLeft <= 7
                      ? styles.seatsLeft
                      : styles.seatsLeftOk
                  }
                >
                  {flight.seatsLeft <= 7
                    ? `⚠ ${flight.seatsLeft} seats left`
                    : `${flight.seatsLeft} seats`}
                </span>
                <button
                  className={styles.selectBtn}
                  onClick={() => handleSelect(flight)}
                >
                  Select →
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
