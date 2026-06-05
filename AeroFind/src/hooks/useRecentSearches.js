import { useState } from "react";
import { AIRPORTS } from "../data/nigeria";

const STORAGE_KEY = "aerofind_recent_searches";
const MAX_SAVED = 5;

export function useRecentSearches() {
  // ─── READ FROM LOCALSTORAGE ───────────────────────────────
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  const [searches, setSearches] = useState(load);

  // ─── SAVE A NEW SEARCH ────────────────────────────────────
  function saveSearch(params) {
    // params = { origin, destination, date, cabinClass, passengers }
    const entry = {
      id: Date.now(),
      origin: params.origin,
      destination: params.destination,
      date: params.date,
      cabinClass: params.cabinClass,
      adults: params.adults,
      children: params.children,
      infants: params.infants,
      tripType: params.tripType,
      returnDate: params.returnDate ?? "",
    };

    setSearches((prev) => {
      // remove duplicate if same route + date already exists
      const deduped = prev.filter(
        (s) =>
          !(
            s.origin === entry.origin &&
            s.destination === entry.destination &&
            s.date === entry.date
          ),
      );

      // newest first, cap at MAX_SAVED
      const next = [entry, ...deduped].slice(0, MAX_SAVED);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // localStorage unavailable — fail silently
      }

      return next;
    });
  }

  // ─── CLEAR ALL ────────────────────────────────────────────
  function clearSearches() {
    localStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  }

  // ─── HELPERS ──────────────────────────────────────────────
  function getAirportCity(code) {
    return AIRPORTS.find((a) => a.code === code)?.city ?? code;
  }

  return { searches, saveSearch, clearSearches, getAirportCity };
}
