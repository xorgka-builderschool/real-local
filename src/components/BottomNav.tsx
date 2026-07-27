import { NavLink } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { BookmarkIcon, HomeIcon, PersonIcon, PlusIcon } from "./icons";
import "./BottomNav.css";

export function BottomNav() {
  const { user } = useApp();

  return (
    <>
      {user?.role === "curator" && (
        <NavLink to="/curator/new" className="bottom-nav__fab" aria-label="New Map">
          <PlusIcon />
        </NavLink>
      )}
      <nav className="bottom-nav">
        <NavLink to="/" end className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          {({ isActive }) => (
            <>
              <HomeIcon active={isActive} />
              {isActive && <span>Home</span>}
            </>
          )}
        </NavLink>
        <NavLink to="/saved" className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}>
          {({ isActive }) => (
            <>
              <BookmarkIcon active={isActive} />
              {isActive && <span>Saved</span>}
            </>
          )}
        </NavLink>
        <NavLink
          to={user ? "/profile" : "/login"}
          className={({ isActive }) => `bottom-nav__item ${isActive ? "is-active" : ""}`}
        >
          {({ isActive }) => (
            <>
              <PersonIcon active={isActive} />
              {isActive && <span>Profile</span>}
            </>
          )}
        </NavLink>
      </nav>
    </>
  );
}
