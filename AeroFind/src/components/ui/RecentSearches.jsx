import { formatDate } from "../../utils/formatters";
import { Clock } from "lucide-react";
import styles from "./RecentSearches.module.css";

export default function RecentSearches({
  searches,
  clearSearches,
  getAirportCity,
  onSelect,
}) {
  if (searches.length === 0) return null;

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.title}>Recent searches</span>
        <button className={styles.clearBtn} onClick={clearSearches}>
          Clear all
        </button>
      </div>

      <div className={styles.list}>
        {searches.map((s) => {
          const totalPax = s.adults + s.children + s.infants;
          return (
            <button
              key={s.id}
              className={styles.item}
              onClick={() => onSelect(s)}
            >
              <div className={styles.itemLeft}>
                <span className={styles.itemIcon}>
                  <Clock color="#798090" strokeWidth={1.5} />
                </span>
                <div>
                  <div className={styles.itemRoute}>
                    {getAirportCity(s.origin)} → {getAirportCity(s.destination)}
                  </div>
                  <div className={styles.itemMeta}>
                    {formatDate(s.date)}
                    {s.tripType === "round" && s.returnDate
                      ? ` · Return ${formatDate(s.returnDate)}`
                      : ""}
                    {` · ${totalPax} passenger${totalPax > 1 ? "s" : ""}`}
                    {` · ${s.cabinClass === "business" ? "Business" : "Economy"}`}
                  </div>
                </div>
              </div>

              <div className={styles.itemRight}>
                <span
                  className={`${styles.classBadge} ${s.cabinClass === "business" ? styles.classBusiness : styles.classEconomy}`}
                >
                  {s.cabinClass === "business" ? "Business" : "Economy"}
                </span>
                <span className={styles.itemArrow}>→</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
