import { api } from "./client";

export async function createBooking(data) {
  return api.post("/bookings/", data);
}

export async function fetchBookings() {
  return api.get("/bookings/");
}

export async function fetchBookingByRef(ref) {
  return api.get(`/bookings/${ref}/`);
}
