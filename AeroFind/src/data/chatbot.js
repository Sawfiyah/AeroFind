// ─── RULES ──────────────────────────────────────────────────
// Each rule has a set of keywords and a response.
// The matcher checks if ANY keyword appears in the user's message.

const RULES = [
  // ── GREETINGS ──
  {
    keywords: [
      "hello",
      "hi",
      "hey",
      "good morning",
      "good afternoon",
      "good evening",
      "howdy",
    ],
    response: `Hi there! 👋 I'm AeroBot, your AeroFind assistant. I can help you with bookings, flights, seats, passengers and more. What would you like to know?`,
  },

  // ── THANKS ──
  {
    keywords: ["thank", "thanks", "thank you", "cheers", "appreciate"],
    response: `You're welcome! 😊 Is there anything else I can help you with?`,
  },

  // ── BOOKING ──
  {
    keywords: [
      "book",
      "booking",
      "how do i book",
      "reserve",
      "purchase",
      "buy ticket",
      "buy a ticket",
    ],
    response: `To book a flight on AeroFind:\n\n1. Enter your origin and destination on the homepage\n2. Select your travel date, passengers and cabin class\n3. Choose a flight from the results\n4. Pick your seat (or skip)\n5. Fill in passenger details and confirm\n\nYour booking reference will be shown on the confirmation screen.`,
  },

  // ── CANCEL / MODIFY ──
  {
    keywords: [
      "cancel",
      "cancellation",
      "modify",
      "change booking",
      "refund",
      "reschedule",
    ],
    response: `At the moment, AeroFind does not support online cancellations or modifications. Please contact the airline directly with your booking reference to request changes or a refund.`,
  },

  // ── MY TRIPS ──
  {
    keywords: [
      "my trips",
      "my booking",
      "find my booking",
      "booking history",
      "past booking",
      "where is my booking",
    ],
    response: `All your bookings are saved under **My Trips** in the navigation bar. Note that bookings are stored on your device, so you'll need to use the same browser you booked with to see them.`,
  },

  // ── PASSENGERS ──
  {
    keywords: [
      "passenger",
      "adult",
      "child",
      "infant",
      "baby",
      "children",
      "how many passengers",
    ],
    response: `AeroFind supports three passenger types:\n\n👤 **Adult** — 12 years and above (full fare)\n🧒 **Child** — 2 to 11 years (75% of adult fare)\n👶 **Infant** — Under 2 years (10% of adult fare, lap seat)\n\nA maximum of 9 passengers can be added per booking. Infants cannot exceed the number of adults.`,
  },

  // ── FARES / PRICING ──
  {
    keywords: [
      "fare",
      "price",
      "cost",
      "how much",
      "pricing",
      "cheap",
      "expensive",
      "discount",
    ],
    response: `Flight fares on AeroFind vary by route, airline, date and cabin class. Use the **Cheapest** sort button on the search results page to find the lowest available fare. Prices are shown in Nigerian Naira (₦).`,
  },

  // ── CABIN CLASS ──
  {
    keywords: [
      "business",
      "economy",
      "class",
      "cabin",
      "upgrade",
      "business class",
      "economy class",
    ],
    response: `AeroFind offers two cabin classes:\n\n✦ **Business Class** — Rows 1-4, premium experience, higher fare\n💺 **Economy Class** — Rows 8-30, standard fare\n⬆ **Extra Legroom** — Rows 5-7, available to economy passengers for a small upgrade fee\n\nSelect your preferred class on the homepage before searching.`,
  },

  // ── SEATS ──
  {
    keywords: [
      "seat",
      "seat selection",
      "choose seat",
      "pick seat",
      "seat map",
      "window",
      "aisle",
    ],
    response: `After selecting a flight, you'll be taken to the seat selection page. You'll see a Boeing 737 cabin map (30 rows, 6 seats per row).\n\n- Grey seats are occupied\n- Yellow seats are Business class\n- Green seats are Extra Legroom\n- Blue seats are your selections\n\nYou can also skip seat selection and have a seat assigned at check-in.`,
  },

  // ── BAGGAGE ──
  {
    keywords: [
      "baggage",
      "luggage",
      "bag",
      "bags",
      "allowance",
      "carry on",
      "check in bag",
    ],
    response: `Baggage allowances vary by airline. As a general guide for domestic Nigerian flights:\n\n🧳 **Economy** — 23kg checked bag + 7kg carry-on\n🧳 **Business** — 32kg checked bag + 10kg carry-on\n\nPlease confirm with your specific airline before travelling.`,
  },

  // ── CHECK-IN ──
  {
    keywords: [
      "check in",
      "check-in",
      "checkin",
      "when to arrive",
      "airport",
      "gate",
      "boarding",
    ],
    response: `For domestic Nigerian flights we recommend:\n\n⏰ Arrive at the airport **at least 90 minutes** before departure\n✅ Check-in closes **45 minutes** before departure\n🚪 Boarding gates close **20 minutes** before departure\n\nOnline check-in availability depends on your airline.`,
  },

  // ── ROUTES ──
  {
    keywords: [
      "route",
      "routes",
      "cities",
      "destination",
      "where",
      "fly to",
      "airports",
      "which city",
      "cover",
    ],
    response: `AeroFind covers all major domestic Nigerian routes:\n\n✈ Lagos (LOS)\n✈ Abuja (ABV)\n✈ Kano (KAN)\n✈ Port Harcourt (PHC)\n✈ Enugu (ENU)\n✈ Calabar (CBQ)\n✈ Ilorin (ILR)\n✈ Sokoto (SKO)\n✈ Benin City (BNI)`,
  },

  // ── AIRLINES ──
  {
    keywords: [
      "airline",
      "airlines",
      "carrier",
      "air peace",
      "ibom",
      "arik",
      "united nigeria",
      "dana",
    ],
    response: `AeroFind aggregates flights from Nigeria's seven major domestic carriers:\n\n✈ Air Peace\n✈ Ibom Air\n✈ Arik Air\n✈ United Nigeria Airlines\n✈ Dana Air\n✈ Aero Contractors\n✈ Rano Air`,
  },

  // ── PAYMENT ──
  {
    keywords: [
      "pay",
      "payment",
      "card",
      "transfer",
      "paystack",
      "flutterwave",
      "how to pay",
    ],
    response: `AeroFind currently processes bookings as a demonstration platform — no real payment is charged. In a live version, payment would be handled via Paystack or Flutterwave, supporting cards, bank transfer and USSD.`,
  },

  // ── FILTERS ──
  {
    keywords: [
      "filter",
      "sort",
      "cheapest",
      "earliest",
      "fastest",
      "direct",
      "non-stop",
      "stops",
    ],
    response: `On the search results page you can:\n\n🔽 **Filter** by airline, stops (direct/1 stop), price range and departure time\n📊 **Sort** by cheapest fare, earliest departure or fastest flight\n\nFilters and sorting can be combined for precise results.`,
  },

  // ── RECENT SEARCHES ──
  {
    keywords: [
      "recent",
      "recent search",
      "search history",
      "previous search",
      "saved search",
    ],
    response: `AeroFind saves your last 5 searches on the homepage for quick access. Click any recent search to instantly pre-fill the search form. You can clear your search history using the "Clear all" button.`,
  },

  // ── HELP ──
  {
    keywords: [
      "help",
      "support",
      "contact",
      "question",
      "faq",
      "problem",
      "issue",
    ],
    response: `You can find detailed answers in our **Help Centre** — click "Help" in the navigation bar. It covers booking, passengers, routes, fares and more.\n\nFor urgent issues, contact us at support@aerofind.com or call +234 900 000 0000 (7am-10pm WAT).`,
  },

  // ── GOODBYE ──
  {
    keywords: ["bye", "goodbye", "see you", "later", "exit", "close"],
    response: `Safe travels! ✈ Feel free to come back anytime if you have more questions. Goodbye! 👋`,
  },
];

// ─── FALLBACK ────────────────────────────────────────────────
const FALLBACK = `I'm not sure I understand that. Try asking me about:\n\n• Booking a flight\n• Passenger types & fares\n• Seat selection\n• Baggage allowance\n• Routes & airlines\n• Check-in times\n• My Trips`;

// ─── MATCHER ─────────────────────────────────────────────────
export function getResponse(message) {
  const lower = message.toLowerCase().trim();

  // empty message guard
  if (!lower) return `Please type a message and I'll do my best to help! 😊`;

  for (const rule of RULES) {
    const matched = rule.keywords.some((kw) => lower.includes(kw));
    if (matched) return rule.response;
  }

  return FALLBACK;
}

// ─── SUGGESTED QUESTIONS (shown when chat opens) ─────────────
export const SUGGESTIONS = [
  "How do I book a flight?",
  "Which cities do you fly to?",
  "How much do children pay?",
  "How do I find my booking?",
  "What is business class?",
];
