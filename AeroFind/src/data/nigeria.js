// ─── AIRPORTS ───────────────────────────────────────────────
export const AIRPORTS = [
  {
    code: "LOS",
    name: "Murtala Muhammed International",
    city: "Lagos",
    state: "Lagos",
  },
  {
    code: "ABV",
    name: "Nnamdi Azikiwe International",
    city: "Abuja",
    state: "FCT",
  },
  {
    code: "KAN",
    name: "Mallam Aminu Kano International",
    city: "Kano",
    state: "Kano",
  },
  {
    code: "PHC",
    name: "Port Harcourt International",
    city: "Port Harcourt",
    state: "Rivers",
  },
  {
    code: "ENU",
    name: "Akanu Ibiam International",
    city: "Enugu",
    state: "Enugu",
  },
  {
    code: "CBQ",
    name: "Margaret Ekpo International",
    city: "Calabar",
    state: "Cross River",
  },
  { code: "ILR", name: "Ilorin International", city: "Ilorin", state: "Kwara" },
  {
    code: "SKO",
    name: "Sadiq Abubakar III International",
    city: "Sokoto",
    state: "Sokoto",
  },
  { code: "BNI", name: "Benin Airport", city: "Benin City", state: "Edo" },
];

// ─── AIRLINES ───────────────────────────────────────────────
export const AIRLINES = [
  { code: "P4", name: "Air Peace", logo: "✈" },
  { code: "QI", name: "Ibom Air", logo: "✈" },
  { code: "W3", name: "Arik Air", logo: "✈" },
  { code: "N2", name: "Aero Contractors", logo: "✈" },
  { code: "9J", name: "Dana Air", logo: "✈" },
  { code: "UN", name: "United Nigeria", logo: "✈" },
  { code: "R4", name: "Rano Air", logo: "✈" },
];

// ─── HELPERS ────────────────────────────────────────────────
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pad = (n) => String(n).padStart(2, "0");

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total = h * 60 + m + mins;
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

// ─── FLIGHT GENERATOR ───────────────────────────────────────
export function generateFlights(
  origin,
  destination,
  date,
  cabinClass = "economy",
) {
  if (!origin || !destination || origin === destination) return [];

  const results = [];
  const slots = [
    "06:00",
    "07:30",
    "09:00",
    "10:30",
    "12:00",
    "13:30",
    "15:00",
    "16:30",
    "18:00",
  ];

  AIRLINES.forEach((airline) => {
    const numFlights = rand(1, 2);

    for (let i = 0; i < numFlights; i++) {
      const departureTime = slots[rand(0, slots.length - 1)];
      const durationMins = rand(55, 110);
      const arrivalTime = addMinutes(departureTime, durationMins);
      const stops = rand(0, 10) < 8 ? 0 : 1;

      // business class is ~2.5x the economy base price
      const basePrice =
        cabinClass === "business"
          ? rand(160_000, 280_000)
          : rand(55_000, 150_000);

      results.push({
        id: `${airline.code}-${date}-${origin}-${destination}-${i}`,
        airline,
        flightNumber: `${airline.code}${rand(100, 999)}`,
        origin,
        destination,
        date,
        departureTime,
        arrivalTime,
        durationMins,
        stops,
        price: basePrice,
        cabinClass,
        seatsLeft: rand(2, 42),
        class: cabinClass === "business" ? "Business" : "Economy",
      });
    }
  });

  return results.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
}

// ─── SEAT GENERATOR ─────────────────────────────────────────
export const SEAT_COLS = ["A", "B", "C", "D", "E", "F"];
export const TOTAL_ROWS = 30;

export function getSeatType(row) {
  if (row <= 4) return "business";
  if (row <= 7) return "legroom";
  return "economy";
}

export function getSeatUpgradePrice(row, cabinClass = "economy") {
  if (cabinClass === "business") return 0;
  if (row <= 4) return 25000;
  if (row <= 7) return 10000;
  return 0;
}

export function generateSeats(flightId) {
  // use flightId as a seed so same flight always
  // produces the same occupied pattern
  let hash = 0;
  for (let i = 0; i < flightId.length; i++) {
    hash = (hash * 31 + flightId.charCodeAt(i)) & 0xffffffff;
  }

  const seats = {};
  for (let row = 1; row <= TOTAL_ROWS; row++) {
    for (const col of SEAT_COLS) {
      const key = `${row}${col}`;
      // pseudo-random but deterministic per flightId
      hash = (hash * 1664525 + 1013904223) & 0xffffffff;
      const occupied = Math.abs(hash) % 100 < 65; // ~65% occupied
      seats[key] = {
        id: key,
        row,
        col,
        type: getSeatType(row),
        upgrade: getSeatUpgradePrice(row),
        occupied,
      };
    }
  }
  return seats;
}
