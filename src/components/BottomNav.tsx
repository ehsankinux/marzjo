import { NavLink } from "react-router-dom";
import { Home, BarChart2, Users, MapPin, Plus } from "lucide-react";

export default function BottomNav() {
  const items: { to: string; label: string; icon: React.ReactNode }[] = [
    { to: "/home", label: "خانه", icon: <Home className="h-6 w-6" /> },
    { to: "/stats", label: "آمار", icon: <BarChart2 className="h-6 w-6" /> },
    { to: "/friends", label: "دوستان", icon: <Users className="h-6 w-6" /> },
    { to: "/map", label: "نقشه", icon: <MapPin className="h-6 w-6" /> },
  ];

  return (
    <nav className="fixed left-1/2 -translate-x-1/2 bottom-6 z-40">
      <div className="liquid-nav relative shadow-lg rounded-full px-6 py-2 flex gap-6 items-center">
        {/* Decorative animated blurred blobs behind the nav for the liquid-glass look */}
        <svg className="blob blob-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.9" />
            </linearGradient>
          </defs>
          <path
            fill="url(#g1)"
            d="M45.6,-60.7C59.1,-49.5,69.7,-35,73.8,-19.1C77.8,-3.1,74.2,14.3,64.7,29.8C55.1,45.3,39.6,58.9,22.9,67.3C6.1,75.7,-12,78.9,-28.1,73.8C-44.1,68.7,-58.4,55.2,-66.4,38.3C-74.4,21.4,-77.2,1.1,-72.9,-18.9C-68.6,-38.8,-57.2,-58.1,-39.8,-69.4C-22.4,-80.8,-11.2,-84.1,4.7,-90.2C20.7,-96.2,41.4,-105.9,45.6,-60.7Z"
            transform="translate(100 100)"
          />
        </svg>

        <svg className="blob blob-2" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="g2" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#34d399" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.85" />
            </linearGradient>
          </defs>
          <path
            fill="url(#g2)"
            d="M41.6,-65.8C56.4,-58.7,70.2,-49.3,74.9,-35.6C79.5,-21.9,75,-3.9,68.2,11.6C61.4,27.2,52.2,39.2,40.6,49.7C29,60.2,14.5,69.3,-0.3,69.8C-15.2,70.4,-30.5,62.3,-44.6,52.1C-58.8,41.9,-71.8,29.6,-73.8,15.6C-75.8,1.6,-66.9,-14.7,-56.7,-27.4C-46.5,-40.1,-35,-49.1,-21.5,-57.1C-8,-65.1,8.5,-72,23,-68.6C37.5,-65.3,50.8,-51.7,41.6,-65.8Z"
            transform="translate(100 100)"
          />
        </svg>

        {items
          .filter((it) => it.to !== "/map")
          .map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs text-slate-500 hover:text-sky-600 ${isActive ? "text-sky-600" : ""}`
              }
              aria-label={it.label}
            >
              <div className="h-6 w-6">{it.icon}</div>
              <span className="mt-1">{it.label}</span>
            </NavLink>
          ))}
      </div>

      {/* Center floating map (plus) button */}
      <NavLink to="/map" aria-label="Map" className="absolute -top-14 left-1/2 -translate-x-1/2 z-50">
        <div className="h-14 w-14 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-xl border-4 border-white hover:scale-105 transition-transform ring-4 ring-sky-300/20">
          <Plus className="h-7 w-7" />
        </div>
      </NavLink>
    </nav>
  );
}
