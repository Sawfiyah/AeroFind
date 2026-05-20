// ─── PRICE ──────────────────────────────────────────────────
/**
 * Formats a number as Nigerian Naira
 * e.g. 35000 → "₦35,000"
 */
export function formatPrice(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─── DURATION ───────────────────────────────────────────────
/**
 * Converts total minutes into a readable string
 * e.g. 110 → "1h 50m"
 */
export function formatDuration(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// ─── DATE ───────────────────────────────────────────────────
/**
 * Formats a YYYY-MM-DD string into a readable date
 * e.g. "2026-06-10" → "Tue, 10 Jun 2026"
 */
export function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00"); // force local time, avoid UTC shift
  return date.toLocaleDateString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Returns today's date as YYYY-MM-DD
 * Useful as the default value for date inputs
 */
export function todayString() {
  return new Date().toISOString().split("T")[0];
}

/**
 * Checks if a date string is in the past
 * e.g. used to disable past dates on the search form
 */
export function isPastDate(dateStr) {
  return new Date(dateStr + "T00:00:00") < new Date(new Date().toDateString());
}
