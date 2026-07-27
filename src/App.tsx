import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { HomePage } from "./pages/HomePage";
import { MapDetailPage } from "./pages/MapDetailPage";
import { SavedPage } from "./pages/SavedPage";
import { CuratorNewMapPage } from "./pages/CuratorNewMapPage";
import { LoginPage } from "./pages/LoginPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PopularPage } from "./pages/PopularPage";
import { AllMapsPage } from "./pages/AllMapsPage";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/maps/:id" element={<MapDetailPage />} />
        <Route path="/all-maps" element={<AllMapsPage />} />
        <Route path="/popular" element={<PopularPage />} />
        <Route path="/saved" element={<SavedPage />} />
        <Route path="/curator/new" element={<CuratorNewMapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
