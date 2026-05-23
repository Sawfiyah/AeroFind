import { useState, useMemo } from "react";

export function useFlightFilters(flights) {
  // ─── FILTER STATE ────────────────────────────────────────
  const [stops, setStops] = useState("any"); // 'any' | 'direct' | '1stop'
  const [airlines, setAirlines] = useState([]); // [] means all selected
  const [priceMax, setPriceMax] = useState(null); // null means no cap
  const [timeSlots, setTimeSlots] = useState([]); // [] means all times

  // ─── DERIVED MAX PRICE FROM RESULTS ──────────────────────
  const absoluteMax = useMemo(() => {
    if (!flights.length) return 200000;
    return Math.max(...flights.map((f) => f.price));
  }, [flights]);

  // ─── TOGGLE HELPERS ──────────────────────────────────────
  function toggleAirline(code) {
    setAirlines((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function toggleTimeSlot(slot) {
    setTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
    );
  }

  function resetFilters() {
    setStops("any");
    setAirlines([]);
    setPriceMax(null);
    setTimeSlots([]);
  }

  // ─── ACTIVE FILTER COUNT (for badge on mobile button) ────
  const activeCount = [
    stops !== "any",
    airlines.length > 0,
    priceMax !== null,
    timeSlots.length > 0,
  ].filter(Boolean).length;

  // ─── APPLY FILTERS ───────────────────────────────────────
  const filtered = useMemo(() => {
    return flights.filter((flight) => {
      // stops
      if (stops === "direct" && flight.stops !== 0) return false;
      if (stops === "1stop" && flight.stops !== 1) return false;

      // airline
      if (airlines.length > 0 && !airlines.includes(flight.airline.code))
        return false;

      // price
      const cap = priceMax ?? absoluteMax;
      if (flight.price > cap) return false;

      // departure time slot
      if (timeSlots.length > 0) {
        const hour = parseInt(flight.departureTime.split(":")[0], 10);
        const inSlot = timeSlots.some((slot) => {
          if (slot === "early") return hour >= 0 && hour < 8;
          if (slot === "morning") return hour >= 8 && hour < 12;
          if (slot === "afternoon") return hour >= 12 && hour < 16;
          if (slot === "evening") return hour >= 16 && hour < 24;
          return false;
        });
        if (!inSlot) return false;
      }

      return true;
    });
  }, [flights, stops, airlines, priceMax, absoluteMax, timeSlots]);

  return {
    // state
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
    // filtered results
    filtered,
  };
}
