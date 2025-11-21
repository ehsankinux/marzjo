import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Home from "./routs/Home";
import MapPage from "./routs/MapPage";
import Splash from "./components/Splash";
import Auth from "./routs/Auth";
import BottomNav from "./components/BottomNav";
import Stats from "./routs/Stats";
import Friends from "./routs/Friends";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return (
      <Splash
        onFinish={() => {
          try {
            window.history.replaceState({}, "", "/");
          } catch (e) {
            /* ignore */
          }
          setShowSplash(false);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { pathname } = useLocation();
  const showBottom = ["/home", "/stats", "/friends"].includes(pathname);

  return (
    <>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>

      {showBottom && <BottomNav />}
    </>
  );
}
