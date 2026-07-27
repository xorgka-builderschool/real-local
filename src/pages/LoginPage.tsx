import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";

export function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    login("user");
    navigate("/");
  };

  const handleGuest = () => navigate("/");

  const handleCuratorDemo = () => {
    login("curator");
    navigate("/");
  };

  return (
    <div className="login-page screen-padded">
      <h1 className="login-page__title">Real Local</h1>
      <p className="login-page__subtitle">Discover real local eats in Korea</p>

      <form onSubmit={handleLogin} className="login-page__form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-page__input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-page__input"
        />
        <button type="submit" className="login-page__button">
          Log In
        </button>
      </form>

      <button className="login-page__link" onClick={handleGuest}>
        Continue as Guest
      </button>

      <div className="login-page__divider">
        <span />
        <p>or</p>
        <span />
      </div>

      <button className="login-page__outline-button" onClick={handleLogin}>
        Continue with Google
      </button>

      <button className="login-page__curator-demo" onClick={handleCuratorDemo}>
        Continue as Curator (demo)
      </button>

      <p className="login-page__signup">Don't have an account? Sign Up</p>
    </div>
  );
}
