import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth";
import { getMe } from "../api/auth";
import useAuth from "../context/useAuth";
import Navbar from "../components/layout/Navbar";
import styles from "./AuthPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      const me = await getMe();
      setUser(me);
      localStorage.removeItem("aerofind_recent_searches");
      navigate("/");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.sub}>Log in to your AeroFind account</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className={styles.error}>⚠ {error}</p>}

            <button className={styles.submitBtn} disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <p className={styles.switchText}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.switchLink}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
