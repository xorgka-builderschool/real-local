import { Navigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { curatorPhoto } from "../data/curatorPhotos";
import "./ProfilePage.css";

export function ProfilePage() {
  const { user, logout, savedMapIds, savedPlaceIds } = useApp();

  if (!user) return <Navigate to="/login" replace />;

  const photo = curatorPhoto(user.id);

  return (
    <div className="screen-padded profile-page">
      {photo ? (
        <img className="profile-page__avatar" src={photo} alt="" />
      ) : (
        <div className="profile-page__avatar profile-page__avatar--initial">{user.name.charAt(0)}</div>
      )}
      <h1>{user.name}</h1>
      <p className="profile-page__email">{user.email}</p>
      <span className="profile-page__role">{user.role === "curator" ? "Curator" : "Member"}</span>

      <div className="profile-page__stats">
        <div>
          <strong>{savedMapIds.length}</strong>
          <span>Saved Maps</span>
        </div>
        <div>
          <strong>{savedPlaceIds.length}</strong>
          <span>Saved Places</span>
        </div>
      </div>

      <button className="profile-page__logout" onClick={logout}>
        Log Out
      </button>
    </div>
  );
}
