import { AIRLINES } from "../../data/nigeria";
import { formatPrice } from "../../utils/formatters";
import styles from "./FlightFilters.module.css";

export default function FlightFilters({
  // filter state
  stops,
  setStops,
  airlines,
  toggleAirline,
  priceMax,
  setPriceMax,
  timeSlots,
  toggleTimeSlot,
  absoluteMax,
  activeCount,
  resetFilters,
  // mobile
  isMobile,
  onClose,
}) {
  return (
    <div className={`${styles.panel} ${isMobile ? styles.panelMobile : ""}`}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.title}>Filters</span>
        <div className={styles.headerRight}>
          {activeCount > 0 && (
            <button className={styles.resetBtn} onClick={resetFilters}>
              Reset all
            </button>
          )}
          {isMobile && (
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── STOPS ── */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Stops</h4>
        {[
          { value: "any", label: "Any" },
          { value: "direct", label: "Direct only" },
          { value: "1stop", label: "1 Stop" },
        ].map(({ value, label }) => (
          <label key={value} className={styles.radioRow}>
            <input
              type="radio"
              name="stops"
              value={value}
              checked={stops === value}
              onChange={() => setStops(value)}
              className={styles.radio}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>

      {/* ── AIRLINES ── */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Airline</h4>
        {AIRLINES.map((airline) => (
          <label key={airline.code} className={styles.checkRow}>
            <input
              type="checkbox"
              checked={airlines.includes(airline.code)}
              onChange={() => toggleAirline(airline.code)}
              className={styles.checkbox}
            />
            <span>{airline.name}</span>
          </label>
        ))}
      </div>

      {/* ── PRICE RANGE ── */}
      <div className={styles.section}>
        <div className={styles.priceHeader}>
          <h4 className={styles.sectionTitle}>Max price</h4>
          <span className={styles.priceValue}>
            {formatPrice(priceMax ?? absoluteMax)}
          </span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={absoluteMax}
          step={1000}
          value={priceMax ?? absoluteMax}
          onChange={(e) => {
            const val = Number(e.target.value);
            setPriceMax(val === absoluteMax ? null : val);
          }}
        />
        <div className={styles.sliderLabels}>
          <span>₦0</span>
          <span>{formatPrice(absoluteMax)}</span>
        </div>
      </div>

      {/* ── DEPARTURE TIME ── */}
      <div className={styles.section}>
        <h4 className={styles.sectionTitle}>Departure time</h4>
        {[
          { value: "early", label: "Early morning", sub: "12am - 8am" },
          { value: "morning", label: "Morning", sub: "8am - 12pm" },
          { value: "afternoon", label: "Afternoon", sub: "12pm - 4pm" },
          { value: "evening", label: "Evening", sub: "4pm - 12am" },
        ].map(({ value, label, sub }) => (
          <label key={value} className={styles.checkRow}>
            <input
              type="checkbox"
              checked={timeSlots.includes(value)}
              onChange={() => toggleTimeSlot(value)}
              className={styles.checkbox}
            />
            <div>
              <span className={styles.checkLabel}>{label}</span>
              <span className={styles.checkSub}>{sub}</span>
            </div>
          </label>
        ))}
      </div>

      {/* Mobile done button */}
      {isMobile && (
        <div className={styles.mobileFooter}>
          <button className={styles.doneBtn} onClick={onClose}>
            Show results
          </button>
        </div>
      )}
    </div>
  );
}
