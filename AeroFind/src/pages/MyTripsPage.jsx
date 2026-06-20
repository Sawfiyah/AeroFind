import { useNavigate } from "react-router-dom";
// import { useBookings } from "../hooks/useBookings";
import { AIRPORTS } from "../data/nigeria";
import { formatPrice, formatDate } from "../utils/formatters";
import { useEffect, useState } from "react";
import { fetchBookings } from "../api/bookings";
import useAuth from "../context/useAuth";
import Navbar from "../components/layout/Navbar";
import styles from "./MyTripsPage.module.css";

export default function MyTripsPage() {
  const navigate = useNavigate();
  // const { bookings, clearBookings } = useBookings();
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    async function load() {
      setLoading(true);
      try {
        const data = await fetchBookings();
        // normalise Django shape to match our card component
        setBookings(
          data.map((b) => ({
            ref: b.booking_ref,
            origin: b.flight.origin.code,
            destination: b.flight.destination.code,
            date: b.flight.date,
            returnDate: "",
            tripType: "oneway",
            cabinClass: b.cabin_class,
            adults: b.adults,
            children: b.children,
            infants: b.infants,
            totalPrice: Number(b.total_price),
            contact: user.email,
            bookedAt: b.created_at,
          })),
        );
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  function getCity(code) {
    return AIRPORTS.find((a) => a.code === code)?.city ?? code;
  }

  function isUpcoming(dateStr) {
    return (
      new Date(dateStr + "T00:00:00") >= new Date(new Date().toDateString())
    );
  }

  function clearBookings() {
    setBookings([]);
  }

  const upcoming = bookings.filter((b) => isUpcoming(b.date));
  const past = bookings.filter((b) => !isUpcoming(b.date));

  // show a not-logged-in state if no user
  if (!user && !loading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✈</div>
            <h2 className={styles.emptyTitle}>Log in to see your trips</h2>
            <p className={styles.emptyText}>
              Your bookings are saved to your account.
            </p>
            <button
              className={styles.searchBtn}
              onClick={() => navigate("/login")}
            >
              Log in
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />

      <main className={styles.main}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>My Trips</h1>
          {bookings.length > 0 && (
            <button className={styles.clearBtn} onClick={clearBookings}>
              Clear all
            </button>
          )}
        </div>

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>✈</div>
            <h2 className={styles.emptyTitle}>No trips yet</h2>
            <p className={styles.emptyText}>
              Your booked flights will appear here.
            </p>
            <button className={styles.searchBtn} onClick={() => navigate("/")}>
              Search flights
            </button>
          </div>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Upcoming</h2>
            <div className={styles.list}>
              {upcoming.map((b) => (
                <BookingCard
                  key={b.ref}
                  booking={b}
                  getCity={getCity}
                  upcoming
                />
              ))}
            </div>
          </section>
        )}

        {/* Past */}
        {past.length > 0 && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Past</h2>
            <div className={styles.list}>
              {past.map((b) => (
                <BookingCard key={b.ref} booking={b} getCity={getCity} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

// ─── BOOKING CARD ──────────────────────────────────────────
function BookingCard({ booking: b, getCity, upcoming }) {
  const totalPax = b.adults + b.children + b.infants;

  return (
    <div
      className={`${styles.card} ${upcoming ? styles.cardUpcoming : styles.cardPast}`}
    >
      {/* Top row */}
      <div className={styles.cardTop}>
        <div className={styles.cardRoute}>
          <span className={styles.cardCity}>{getCity(b.origin)}</span>
          <span className={styles.cardArrow}>——✈——</span>
          <span className={styles.cardCity}>{getCity(b.destination)}</span>
        </div>
        <span
          className={`${styles.statusBadge} ${upcoming ? styles.statusUpcoming : styles.statusPast}`}
        >
          {upcoming ? "Upcoming" : "Completed"}
        </span>
      </div>

      {/* Details row */}
      <div className={styles.cardDetails}>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Date</span>
          <span className={styles.detailValue}>{formatDate(b.date)}</span>
        </div>
        {b.tripType === "round" && b.returnDate && (
          <div className={styles.detail}>
            <span className={styles.detailLabel}>Return</span>
            <span className={styles.detailValue}>
              {formatDate(b.returnDate)}
            </span>
          </div>
        )}
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Passengers</span>
          <span className={styles.detailValue}>
            {totalPax} passenger{totalPax > 1 ? "s" : ""}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Class</span>
          <span className={styles.detailValue}>
            {b.cabinClass === "business" ? "Business" : "Economy"}
          </span>
        </div>
        <div className={styles.detail}>
          <span className={styles.detailLabel}>Total paid</span>
          <span className={styles.detailValue}>
            {formatPrice(b.totalPrice)}
          </span>
        </div>
      </div>

      {/* Footer row */}
      <div className={styles.cardFooter}>
        <span className={styles.cardRef}>Ref: {b.ref}</span>
        <span className={styles.cardContact}>{b.contact}</span>
      </div>
    </div>
  );
}
