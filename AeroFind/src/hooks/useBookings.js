import { useState } from "react";

const STORAGE_KEY = "aerofind_bookings";

export function useBookings() {
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  const [bookings, setBookings] = useState(load);

  function saveBooking(booking) {
    setBookings((prev) => {
      const next = [booking, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // fail silently
      }
      return next;
    });
  }

  function clearBookings() {
    localStorage.removeItem(STORAGE_KEY);
    setBookings([]);
  }

  return { bookings, saveBooking, clearBookings };
}
