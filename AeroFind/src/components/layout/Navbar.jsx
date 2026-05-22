import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
        <a href="/">Home</a>
        <a href="#">My Trips</a>
        <a href="#">Help</a>
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
          <a href="/" onClick={() => setMenuOpen(false)}>
            Home
          </a>
          <a href="#" onClick={() => setMenuOpen(false)}>
            My Trips
          </a>
          <a href="#" onClick={() => setMenuOpen(false)}>
            Help
          </a>
        </div>
      )}
    </header>
  );
}
