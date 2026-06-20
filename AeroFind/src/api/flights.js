import { api } from "./client";

export async function fetchAirports() {
  return api.get("/flights/airports/");
}

export async function searchFlights({ origin, destination, date, cabinClass }) {
  const params = new URLSearchParams({
    origin,
    destination,
    date,
    cabin_class: cabinClass,
  });
  return api.get(`/flights/search/?${params.toString()}`);
}
