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

export async function createPaymentIntent(totalPrice) {
  return api.post("/bookings/create-payment-intent/", {
    total_price: totalPrice,
  });
}
