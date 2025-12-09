import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import "./LoginPage.css";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axiosClient.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      {/* top-left logo */}
      <div className="auth-brand">
        <div className="auth-logo">E</div>
        <span className="auth-title">EvalAI</span>
      </div>

      <div className="auth-card">
        <div className="auth-icon">
          <span>➜</span>
        </div>
        <h2 className="auth-heading">Sign in with email</h2>
        <p className="auth-sub">
          Compare LLM responses, save prompts, and rank models.
        </p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-label">
            Email
            <div className="auth-input-wrap">
              <span className="auth-input-icon">📧</span>
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

          <label className="auth-label">
            Password
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="auth-eye"
                onClick={() => {
                  const el = document.querySelector(
                    'input[name="password"]'
                  ) as HTMLInputElement | null;
                  if (el) el.type = el.type === "password" ? "text" : "password";
                }}
              >
                👁
              </button>
            </div>
          </label>

          <div className="auth-row">
            <button type="submit" className="auth-submit">
              Get Started
            </button>
            <button
              type="button"
              className="auth-forgot"
              onClick={() => alert("Add forgot password flow")}
            >
              Forgot password?
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <p className="auth-bottom-text">
            Don’t have an account? <Link to="/register">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
