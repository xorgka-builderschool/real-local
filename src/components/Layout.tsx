import { Outlet, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";

export function Layout() {
  const location = useLocation();
  const hideNav = location.pathname === "/login";

  return (
    <div className="app-shell">
      <div className={hideNav ? "" : "screen"}>
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
