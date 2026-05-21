import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AIRPORTS } from "../data/nigeria";
import { todayString } from "../utils/formatters";

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

    // pass search params via URL query string
    const params = new URLSearchParams({
      origin,
      destination,
      date: departDate,
      adults: passengers.adults,
      children: passengers.children,
      infants: passengers.infants,
      tripType,
      ...(tripType === "round" && returnDate ? { returnDate } : {}),
    });

    navigate(`/search?${params.toString()}`);
  }

  return (
    <div>
      <header>
        <span>✈ AeroFind</span>
        <nav>
          <a href="/">Home</a>
          <a href="#">My Trips</a>
          <a href="#">Help</a>
        </nav>
      </header>

      <main>
        <section>
          <h1>Fly anywhere in Nigeria</h1>
          <p>Search flights across all major domestic routes</p>

          <form onSubmit={handleSearch}>
            {/* Trip type toggle */}
            <div>
              <button type="button" onClick={() => setTripType("round")}>
                Round trip
              </button>
              <button type="button" onClick={() => setTripType("oneway")}>
                One way
              </button>
            </div>

            {/* Origin & destination */}
            <div>
              <div>
                <label htmlFor="origin">From</label>
                <select
                  id="origin"
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

              <button type="button" onClick={handleSwap}>
                ⇄
              </button>

              <div>
                <label htmlFor="destination">To</label>
                <select
                  id="destination"
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

            {/* Dates */}
            <div>
              <div>
                <label htmlFor="departDate">Depart</label>
                <input
                  id="departDate"
                  type="date"
                  value={departDate}
                  min={todayString()}
                  onChange={(e) => setDepartDate(e.target.value)}
                />
              </div>

              {tripType === "round" && (
                <div>
                  <label htmlFor="returnDate">Return</label>
                  <input
                    id="returnDate"
                    type="date"
                    value={returnDate}
                    min={departDate || todayString()}
                    onChange={(e) => setReturnDate(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Passengers */}
            <div>
              <label>Passengers</label>
              <button
                type="button"
                onClick={() => setShowPaxDropdown(!showPaxDropdown)}
              >
                {paxSummary()} ▾
              </button>

              {showPaxDropdown && (
                <div>
                  {/* Adults */}
                  <div>
                    <div>
                      <span>Adult</span>
                      <span>12 years and above</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => updatePax("adults", -1)}
                      >
                        -
                      </button>
                      <span>{passengers.adults}</span>
                      <button
                        type="button"
                        onClick={() => updatePax("adults", +1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div>
                    <div>
                      <span>Child</span>
                      <span>2 - 11 years</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => updatePax("children", -1)}
                      >
                        -
                      </button>
                      <span>{passengers.children}</span>
                      <button
                        type="button"
                        onClick={() => updatePax("children", +1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div>
                    <div>
                      <span>Infant</span>
                      <span>Under 2 years · sits on lap</span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => updatePax("infants", -1)}
                      >
                        -
                      </button>
                      <span>{passengers.infants}</span>
                      <button
                        type="button"
                        onClick={() => updatePax("infants", +1)}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPaxDropdown(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            {/* Error */}
            {error && <p>{error}</p>}

            <button type="submit">Search flights</button>
          </form>
        </section>
      </main>
    </div>
  );
}
