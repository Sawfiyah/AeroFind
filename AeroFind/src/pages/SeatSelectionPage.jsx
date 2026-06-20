import { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  generateSeats,
  SEAT_COLS,
  TOTAL_ROWS,
  getSeatType,
  getSeatUpgradePrice,
} from "../data/nigeria";
import { formatPrice, formatDate } from "../utils/formatters";
import Navbar from "../components/layout/Navbar";
import styles from "./SeatSelectionPage.module.css";

export default function SeatSelectionPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ─── URL PARAMS ───────────────────────────────────────────
  const flightId = searchParams.get("flightId");
  const flightNumber = searchParams.get("flightNumber");
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
  const basePrice = Number(searchParams.get("basePrice"));
  const cabinClass = searchParams.get("cabinClass") ?? "economy";

  // total seats to pick — infants share a lap, no seat needed
  const seatsNeeded = adults + children;

  // ─── SEAT STATE ───────────────────────────────────────────
  const seats = useMemo(() => generateSeats(flightId), [flightId]);
  const [selected, setSelected] = useState([]); // array of seat ids

  // ─── HELPERS ──────────────────────────────────────────────
  function toggleSeat(seatId) {
    const seat = seats[seatId];
    if (seat.occupied) return;

    setSelected((prev) => {
      if (prev.includes(seatId)) {
        // deselect
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length >= seatsNeeded) {
        // replace the oldest selection
        return [...prev.slice(1), seatId];
      }
      return [...prev, seatId];
    });
  }

  function getSeatState(seatId) {
    if (seats[seatId].occupied) return "occupied";
    if (selected.includes(seatId)) return "selected";
    return "available";
  }

  // ─── UPGRADE COST ─────────────────────────────────────────
  const upgradeCost = selected.reduce(
    (sum, id) => sum + getSeatUpgradePrice(seats[id].row, cabinClass),
    0,
  );

  // ─── TOTAL PRICE ──────────────────────────────────────────
  const totalPrice = Math.round(
    basePrice * adults +
      basePrice * 0.75 * children +
      basePrice * 0.1 * infants +
      upgradeCost,
  );

  // ─── PROCEED TO BOOKING ───────────────────────────────────
  function handleContinue() {
    const params = new URLSearchParams({
      flightId,
      flightNumber,
      origin,
      destination,
      date,
      adults,
      children,
      infants,
      tripType,
      totalPrice,
      cabinClass,
      departureTime,
      arrivalTime,
      seats: selected.join(","),
      ...(returnDate ? { returnDate } : {}),
    });
    navigate(`/booking?${params.toString()}`);
  }

  // ─── GUARD ────────────────────────────────────────────────
  if (!flightId || !origin || !destination) {
    return (
      <div>
        <p>Invalid session. Please search again.</p>
        <button onClick={() => navigate("/")}>Back to search</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.main}>
        {/* ── LEFT: CABIN MAP ── */}
        <div className={styles.cabinWrap}>
          <div className={styles.cabinHeader}>
            <h2 className={styles.cabinTitle}>
              Select your seat{seatsNeeded > 1 ? "s" : ""}
            </h2>
            <p className={styles.cabinSub}>
              {origin} → {destination} · {formatDate(date)}
            </p>
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            {[
              { cls: styles.legendAvailable, label: "Available" },
              { cls: styles.legendSelected, label: "Selected" },
              { cls: styles.legendOccupied, label: "Occupied" },
              { cls: styles.legendBusiness, label: "Business" },
              { cls: styles.legendLegroom, label: "Extra legroom" },
              // add this to the legend array conditionally
              ...(cabinClass === "economy"
                ? [{ cls: styles.legendLocked, label: "Business only" }]
                : []),
            ].map(({ cls, label }) => (
              <div key={label} className={styles.legendItem}>
                <div className={`${styles.legendDot} ${cls}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Cabin map */}
          <div className={styles.cabin}>
            {/* Column headers */}
            <div className={styles.colHeaders}>
              <div className={styles.rowNumSpacer} />
              {SEAT_COLS.map((col, i) => (
                <div key={col} className={styles.colHeader}>
                  {i === 3 && <div className={styles.aisleGap} />}
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map((row) => {
              const type = getSeatType(row);
              return (
                <div key={row} className={`${styles.row}`}>
                  <div className={styles.rowNum}>{row}</div>
                  {SEAT_COLS.map((col, i) => {
                    const id = `${row}${col}`;
                    const state = getSeatState(id);
                    const isBusinessRow = row <= 4;
                    const isEconomyRow = row > 4;

                    // economy passengers can't select business rows
                    const isLocked =
                      (cabinClass === "economy" && isBusinessRow) ||
                      (cabinClass === "business" && isEconomyRow);

                    return (
                      <div key={col} className={styles.seatWrapper}>
                        {i === 3 && <div className={styles.aisle} />}
                        <button
                          className={`
          ${styles.seat}
          ${isLocked ? styles.seatLocked : ""}
          ${!isLocked && state === "occupied" ? styles.seatOccupied : ""}
          ${!isLocked && state === "selected" ? styles.seatSelected : ""}
          ${!isLocked && state === "available" && type === "business" ? styles.seatBusiness : ""}
          ${!isLocked && state === "available" && type === "legroom" ? styles.seatLegroom : ""}
        `}
                          onClick={() => !isLocked && toggleSeat(id)}
                          disabled={state === "occupied" || isLocked}
                          title={
                            isLocked
                              ? "Business class only"
                              : state === "occupied"
                                ? "Occupied"
                                : seats[id].upgrade > 0 &&
                                    cabinClass === "economy"
                                  ? `+${formatPrice(getSeatUpgradePrice(seats[id].row, cabinClass))}`
                                  : "Available"
                          }
                        >
                          {state === "selected" ? "✓" : isLocked ? "" : ""}
                        </button>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: SUMMARY SIDEBAR ── */}
        <div className={styles.sidebar}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Seat summary</h3>

            <div className={styles.summaryFlight}>
              <span className={styles.summaryRoute}>
                {origin} → {destination}
              </span>
              <span className={styles.summaryDate}>{formatDate(date)}</span>
            </div>

            {/* Selected seats list */}
            <div className={styles.selectedList}>
              {Array.from({ length: seatsNeeded }, (_, i) => (
                <div key={i} className={styles.selectedRow}>
                  <span className={styles.selectedLabel}>
                    Passenger {i + 1}
                  </span>
                  {selected[i] ? (
                    <div className={styles.selectedInfo}>
                      <span className={styles.selectedSeat}>
                        Seat {selected[i]}
                      </span>
                      {seats[selected[i]].upgrade > 0 &&
                        cabinClass === "economy" && (
                          <span className={styles.selectedUpgrade}>
                            +{formatPrice(seats[selected[i]].upgrade)}
                          </span>
                        )}
                    </div>
                  ) : (
                    <span className={styles.selectedEmpty}>Not selected</span>
                  )}
                </div>
              ))}
              {infants > 0 && (
                <div className={styles.selectedRow}>
                  <span className={styles.selectedLabel}>
                    Infant{infants > 1 ? "s" : ""}
                  </span>
                  <span className={styles.selectedEmpty}>Lap seat</span>
                </div>
              )}
            </div>

            {/* Price breakdown */}
            <div className={styles.priceBreakdown}>
              <div className={styles.priceRow}>
                <span>Base fare</span>
                {<span>{formatPrice(totalPrice - upgradeCost)}</span>}
              </div>
              {upgradeCost > 0 && (
                <div className={styles.priceRow}>
                  <span>Seat upgrade</span>
                  <span>+{formatPrice(upgradeCost)}</span>
                </div>
              )}
              <div className={styles.priceRowTotal}>
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <button
              className={styles.continueBtn}
              onClick={handleContinue}
              disabled={selected.length < seatsNeeded}
            >
              {selected.length < seatsNeeded
                ? `Select ${seatsNeeded - selected.length} more seat${seatsNeeded - selected.length > 1 ? "s" : ""}`
                : "Continue to booking →"}
            </button>

            <button
              className={styles.skipBtn}
              onClick={() => {
                const params = new URLSearchParams({
                  flightId,
                  origin,
                  destination,
                  date,
                  adults,
                  children,
                  infants,
                  tripType,
                  totalPrice: Math.round(
                    basePrice * adults +
                      basePrice * 0.75 * children +
                      basePrice * 0.1 * infants,
                  ),
                  seats: "",
                  ...(returnDate ? { returnDate } : {}),
                });
                navigate(`/booking?${params.toString()}`);
              }}
            >
              Skip seat selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
