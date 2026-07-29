import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";

type Mode = "login" | "signup";

function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Incorrect email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email before logging in — check your inbox.";
  if (m.includes("user already registered")) return "An account with this email already exists — try logging in instead.";
  if (m.includes("email logins are disabled")) return "Email login isn't available right now — try Google sign-in instead.";
  if (m.includes("password") && m.includes("least")) return "Password is too short — use at least 6 characters.";
  return message;
}

export function LoginPage() {
  const { signIn, signUp, signInWithGoogle } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const message = await signIn(email, password);
        if (message) {
          setError(friendlyAuthError(message));
          return;
        }
        navigate(from, { replace: true });
      } else {
        const message = await signUp(email, password, name.trim() || email.split("@")[0]);
        if (message) {
          setError(friendlyAuthError(message));
          return;
        }
        setInfo("Account created — check your email to confirm, then log in.");
        setMode("login");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = () => navigate(from, { replace: true });

  const handleGoogle = async () => {
    setError("");
    const message = await signInWithGoogle(from);
    if (message) setError(friendlyAuthError(message));
  };

  return (
    <div className="login-page screen-padded">
      <button className="login-page__back" onClick={() => navigate(-1)} aria-label="Go back">
        ←
      </button>
      <h1 className="login-page__title">Real Local</h1>
      <p className="login-page__subtitle">Discover real local eats in Korea</p>

      <form onSubmit={handleSubmit} className="login-page__form">
        {mode === "signup" && (
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="login-page__input"
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-page__input"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-page__input"
          required
          minLength={6}
        />
        {error && <p className="login-page__error">{error}</p>}
        {info && <p className="login-page__info">{info}</p>}
        <button type="submit" className="login-page__button" disabled={submitting}>
          {submitting ? "Please wait…" : mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>

      <button
        className="login-page__link"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setError("");
          setInfo("");
        }}
      >
        {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
      </button>

      <div className="login-page__divider">
        <span />
        <p>or</p>
        <span />
      </div>

      <button className="login-page__google-button" onClick={handleGoogle}>
        Continue with Google
      </button>

      <button className="login-page__link" onClick={handleGuest}>
        Continue as Guest
      </button>

      <p className="login-page__note">
        Curator access is granted manually by the team after signup — see PRD §3 (curator approval isn't
        self-serve).
      </p>
    </div>
  );
}
