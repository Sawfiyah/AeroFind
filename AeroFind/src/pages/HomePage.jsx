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
  const [passengers, setPassengers] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [error, setError] = useState("");

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
      passengers,
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
              <label htmlFor="passengers">Passengers</label>
              <input
                id="passengers"
                type="number"
                min={1}
                max={9}
                value={passengers}
                onChange={(e) => setPassengers(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="children">Children</label>
              <input
                id="children"
                type="number"
                min={0}
                max={6}
                value={children}
                onChange={(e) => setChildren(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="infants">Infants</label>
              <input
                id="infants"
                type="number"
                min={0}
                max={2}
                value={infants}
                onChange={(e) => setInfants(e.target.value)}
              />
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
