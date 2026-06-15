import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
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
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? styles.navLinkActive : styles.navLink
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/trips"
          className={({ isActive }) =>
            isActive ? styles.navLinkActive : styles.navLink
          }
        >
          My Trips
        </NavLink>
        <NavLink
          to="/help"
          className={({ isActive }) =>
            isActive ? styles.navLinkActive : styles.navLink
          }
        >
          Help
        </NavLink>
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
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/trips" onClick={() => setMenuOpen(false)}>
            My Trips
          </NavLink>
          <NavLink to="/help" onClick={() => setMenuOpen(false)}>
            Help
          </NavLink>
        </div>
      )}
    </header>
  );
}
