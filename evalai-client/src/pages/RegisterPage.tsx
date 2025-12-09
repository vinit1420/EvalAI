import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // 🔒 Password regex: ≥8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // ✅ Validate password strength
    if (!passwordRegex.test(form.password)) {
      setError(
        "Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    // ✅ Validate password match
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    try {
      await axiosClient.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="auth-logo">E</div>
        <span className="auth-title">EvalAI</span>
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <span>+</span>
        </div>
        <h2 className="auth-heading">Create your account</h2>
        <p className="auth-sub">Start comparing LLMs and saving your prompts.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          {/* Name */}
          <label className="auth-label">
            Name
            <div className="auth-input-wrap">
              <span className="auth-input-icon"></span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Your name"
                required
              />
            </div>
          </label>

          {/* Email */}
          <label className="auth-label">
            Email
            <div className="auth-input-wrap">
              <span className="auth-input-icon"></span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="you@example.com"
                required
              />
            </div>
          </label>

          {/* Password */}
          <label className="auth-label">
            Password
            <div className="auth-input-wrap">
              <span className="auth-input-icon"></span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="Create a strong password"
                required
              />
            </div>

            {/* Live feedback */}
            <small
              style={{
                color: passwordRegex.test(form.password) ? "green" : "#b91c1c",
                fontSize: "0.75rem",
              }}
            >
              {form.password
                ? passwordRegex.test(form.password)
                  ? "Strong password ✅"
                  : "Must be ≥8 chars with upper, lower and number"
                : "At least 8 chars with upper, lower and number"}
            </small>
          </label>

          {/* Confirm Password */}
          <label className="auth-label">
            Confirm Password
            <div className="auth-input-wrap">
              <span className="auth-input-icon"></span>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={onChange}
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Live feedback */}
            <small
              style={{
                color:
                  form.confirmPassword.length === 0
                    ? "#475569"
                    : form.password === form.confirmPassword
                    ? "green"
                    : "#b91c1c",
                fontSize: "0.75rem",
              }}
            >
              {form.confirmPassword.length === 0
                ? "Re-enter password to confirm"
                : form.password === form.confirmPassword
                ? "Passwords match ✅"
                : "Passwords do not match"}
            </small>
          </label>

          <button type="submit" className="auth-submit">
            Create Account
          </button>

          {error && <p className="auth-error">{error}</p>}

          <p className="auth-bottom-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
