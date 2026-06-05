import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIRPORTS } from "../data/nigeria";
import { todayString } from "../utils/formatters";
import { useRecentSearches } from "../hooks/useRecentSearches";
import RecentSearches from "../components/ui/RecentSearches";
import Navbar from "../components/layout/Navbar";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState("round"); // 'round' | 'oneway'
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [departDate, setDepartDate] = useState(todayString());
  const [returnDate, setReturnDate] = useState("");
  const [passengers, setPassengers] = useState({
    adults: 1,
    children: 0,
    infants: 0,
  });
  const [showPaxDropdown, setShowPaxDropdown] = useState(false);
  const [error, setError] = useState("");
  const [cabinClass, setCabinClass] = useState("economy");
  const { searches, saveSearch, clearSearches, getAirportCity } =
    useRecentSearches();

  function updatePax(type, delta) {
    setPassengers((prev) => {
      const next = { ...prev, [type]: prev[type] + delta };

      // adults: min 1, max 9
      if (next.adults < 1 || next.adults > 9) return prev;

      // children: min 0, max 8
      if (next.children < 0 || next.children > 8) return prev;

      // infants: min 0, can't exceed adults
      if (next.infants < 0 || next.infants > next.adults) return prev;

      // total passengers can't exceed 9
      if (next.adults + next.children + next.infants > 9) return prev;

      return next;
    });
  }

  function paxSummary() {
    const { adults, children, infants } = passengers;
    const parts = [`${adults} Adult${adults > 1 ? "s" : ""}`];
    if (children > 0)
      parts.push(`${children} Child${children > 1 ? "ren" : ""}`);
    if (infants > 0) parts.push(`${infants} Infant${infants > 1 ? "s" : ""}`);
    return parts.join(", ");
  }

  function handleSwap() {
    setOrigin(destination);
    setDestination(origin);
  }

  function handleSearch(e) {
    e.preventDefault();

    // basic validation
    if (!origin) return setError("Please select a departure city.");
    if (!destination) return setError("Please select a destination.");
    if (origin === destination)
      return setError("Origin and destination cannot be the same.");
    if (!departDate) return setError("Please select a departure date.");

    setError("");

    saveSearch({
      origin,
      destination,
      date: departDate,
      cabinClass,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      tripType,
      returnDate,
    });

    // pass search params via URL query string
    const params = new URLSearchParams({
      origin,
      destination,
      date: departDate,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      tripType,
      cabinClass,
      ...(tripType === "round" && returnDate ? { returnDate } : {}),
    });

    navigate(`/search?${params.toString()}`);
  }

  function handleRecentSelect(s) {
    setOrigin(s.origin);
    setDestination(s.destination);
    setDepartDate(s.date);
    setReturnDate(s.returnDate ?? "");
    setTripType(s.tripType);
    setCabinClass(s.cabinClass);
    setPassengers({
      adults: s.adults,
      children: s.children,
      infants: s.infants,
    });
    // scroll up to the form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Fly anywhere in Nigeria</h1>
        <p className={styles.heroSub}>
          Search flights across all major domestic routes
        </p>
      </div>

      <div className={styles.cardWrap}>
        <div className={styles.card}>
          {/* Trip tabs */}
          <div className={styles.tripTabs}>
            <button
              type="button"
              className={`${styles.tab} ${tripType === "round" ? styles.tabActive : ""}`}
              onClick={() => setTripType("round")}
            >
              Round trip
            </button>
            <button
              type="button"
              className={`${styles.tab} ${tripType === "oneway" ? styles.tabActive : ""}`}
              onClick={() => setTripType("oneway")}
            >
              One way
            </button>
          </div>

          <form onSubmit={handleSearch}>
            {/* Origin & destination */}
            <div className={styles.airportRow}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="origin">
                  From
                </label>
                <select
                  id="origin"
                  className={styles.select}
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                >
                  <option value="">Select city</option>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className={styles.swapBtn}
                onClick={handleSwap}
              >
                ⇄
              </button>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="destination">
                  To
                </label>
                <select
                  id="destination"
                  className={styles.select}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                >
                  <option value="">Select city</option>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>
                      {a.city} ({a.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.classGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="cabinClass">
                  Class
                </label>
                <select
                  id="cabinClass"
                  className={styles.select}
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                >
                  <option value="economy">Economy</option>
                  <option value="business">Business</option>
                </select>
              </div>
            </div>

            {/* Dates + passengers */}
            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="departDate">
                  Depart
                </label>
                <input
                  id="departDate"
                  type="date"
                  className={styles.input}
                  value={departDate}
                  min={todayString()}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
              </div>

              {tripType === "round" && (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="returnDate">
                    Return
                  </label>
                  <input
                    id="returnDate"
                    type="date"
                    className={styles.input}
                    value={returnDate}
                    min={departDate || todayString()}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              )}

              {/* Passengers */}
              <div className={styles.field}>
                <label className={styles.label}>Passengers</label>
                <div className={styles.paxWrap}>
                  <button
                    type="button"
                    className={`${styles.paxTrigger} ${showPaxDropdown ? styles.paxTriggerOpen : ""}`}
                    onClick={() => setShowPaxDropdown(!showPaxDropdown)}
                  >
                    <span>{paxSummary()}</span>
                    <span>{showPaxDropdown ? "▴" : "▾"}</span>
                  </button>

                  {showPaxDropdown && (
                    <div className={styles.paxDropdown}>
                      {[
                        {
                          key: "adults",
                          label: "Adult",
                          sub: "12 years and above",
                          min: 1,
                        },
                        {
                          key: "children",
                          label: "Child",
                          sub: "2 - 11 years",
                          min: 0,
                        },
                        {
                          key: "infants",
                          label: "Infant",
                          sub: "Under 2 · lap seat",
                          min: 0,
                        },
                      ].map(({ key, label, sub, min }) => (
                        <div key={key} className={styles.paxRow}>
                          <div className={styles.paxInfo}>
                            <span>{label}</span>
                            <span>{sub}</span>
                          </div>
                          <div className={styles.paxControls}>
                            <button
                              type="button"
                              className={styles.paxBtn}
                              onClick={() => updatePax(key, -1)}
                              disabled={passengers[key] <= min}
                            >
                              -
                            </button>
                            <span className={styles.paxCount}>
                              {passengers[key]}
                            </span>
                            <button
                              type="button"
                              className={styles.paxBtn}
                              onClick={() => updatePax(key, +1)}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        className={styles.paxDone}
                        onClick={() => setShowPaxDropdown(false)}
                      >
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.searchBtn}>
              Search flights →
            </button>
          </form>
        </div>
      </div>

      {/* Popular routes */}
      <main className={styles.main}>
        <RecentSearches
          searches={searches}
          clearSearches={clearSearches}
          getAirportCity={getAirportCity}
          onSelect={handleRecentSelect}
        />

        <p className={styles.sectionTitle}>Popular routes</p>
        <div className={styles.routesGrid}>
          {[
            {
              from: "LOS",
              to: "ABV",
              label: "Lagos → Abuja",
              price: "₦55,000",
            },
            {
              from: "ABV",
              to: "LOS",
              label: "Abuja → Lagos",
              price: "₦57,000",
            },
            {
              from: "LOS",
              to: "PHC",
              label: "Lagos → Port Harcourt",
              price: "₦60,000",
            },
            {
              from: "LOS",
              to: "ENU",
              label: "Lagos → Enugu",
              price: "₦69,000",
            },
            { from: "ABV", to: "KAN", label: "Abuja → Kano", price: "₦58,000" },
          ].map((r) => (
            <div
              key={r.from + r.to}
              className={styles.routeCard}
              onClick={() => {
                setOrigin(r.from);
                setDestination(r.to);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <div className={styles.routeCities}>
                {r.from} → {r.to}
              </div>
              <div className={styles.routeLabel}>{r.label}</div>
              <div className={styles.routePrice}>from {r.price}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
