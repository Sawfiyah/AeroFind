import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.navbar}>
      <span className={styles.logo} onClick={() => navigate("/")}>
        ✈ AeroFind
      </span>

      {/* Desktop links */}
      <nav className={styles.navLinks}>
        <Link to="/">Home</Link>
        <Link to="/trips">My Trips</Link>
        <Link to="/help">Help</Link>
      </nav>

      {/* Hamburger button — mobile only */}
      <button
        className={styles.hamburger}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        <span
          className={`${styles.bar} ${menuOpen ? styles.barTopOpen : ""}`}
        />
        <span
          className={`${styles.bar} ${menuOpen ? styles.barMidOpen : ""}`}
        />
        <span
          className={`${styles.bar} ${menuOpen ? styles.barBotOpen : ""}`}
        />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className={styles.mobileMenu}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/trips" onClick={() => setMenuOpen(false)}>
            My Trips
          </Link>
          <Link to="/help" onClick={() => setMenuOpen(false)}>
            Help
          </Link>
        </div>
      )}
    </header>
  );
}
