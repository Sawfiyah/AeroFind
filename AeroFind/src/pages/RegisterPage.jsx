import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth";
import { login } from "../api/auth";
import useAuth from "../context/useAuth";
import { getMe } from "../api/auth";
import Navbar from "../components/layout/Navbar";
import styles from "./AuthPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    username: "",
    phone: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (form.password !== form.password2) {
      return setError("Passwords do not match.");
    }

    setLoading(true);
    try {
      await register(form);
      // auto login after register
      await login(form.username, form.password);
      const me = await getMe();
      setUser(me);
      localStorage.removeItem("aerofind_recent_searches");
      navigate("/");
    } catch (err) {
      const msg = Object.values(err)[0];
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.wrap}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.sub}>Join AeroFind and start booking flights</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>First name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={form.first_name}
                  onChange={(e) => update("first_name", e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Last name</label>
                <input
                  className={styles.input}
                  type="text"
                  value={form.last_name}
                  onChange={(e) => update("last_name", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Email address</label>
              <input
                className={styles.input}
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Username</label>
              <input
                className={styles.input}
                type="text"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Phone number</label>
              <input
                className={styles.input}
                type="tel"
                value={form.phone}
                placeholder="08012345678"
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm password</label>
                <input
                  className={styles.input}
                  type="password"
                  value={form.password2}
                  onChange={(e) => update("password2", e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <p className={styles.error}>⚠ {error}</p>}

            <button className={styles.submitBtn} disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{" "}
            <Link to="/login" className={styles.switchLink}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
