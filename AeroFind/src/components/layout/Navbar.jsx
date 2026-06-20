import { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import useAuth from "../../context/useAuth";
import styles from "./Navbar.module.css";
import { UserIcon } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

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
        {user ? (
          <div className={styles.userMenu}>
            <button
              className={styles.logoutBtn}
              onClick={() => {
                localStorage.removeItem("aerofind_recent_searches");
                logout();
              }}
            >
              Log out
            </button>
            <span className={styles.userName}>
              <UserIcon /> {user.first_name}
            </span>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <NavLink to="/login" className={styles.navLink}>
              Log in
            </NavLink>
            <NavLink to="/register" className={styles.loginBtn}>
              Sign up
            </NavLink>
          </div>
        )}
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
          {user ? (
            <div className={styles.userMenu}>
              <button
                className={styles.logoutBtn}
                onClick={() => {
                  localStorage.removeItem("aerofind_recent_searches");
                  logout();
                }}
              >
                Log out
              </button>
              <span className={styles.userName}>
                <UserIcon /> {user.first_name}
              </span>
            </div>
          ) : (
            <div className={styles.authLinks}>
              <NavLink to="/login" className={styles.navLink}>
                Log in
              </NavLink>
              <NavLink to="/register" className={styles.loginBtn}>
                Sign up
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
