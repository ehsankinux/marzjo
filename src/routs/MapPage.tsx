import MapView from "../components/MapView";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <main className="relative flex h-screen w-full flex-col bg-gray-50 dark:bg-neutral-900">
      <button
        aria-label="Go back"
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 z-50 rounded-full border border-white/40 bg-white/90 p-2 text-slate-800 shadow-md transition hover:scale-105 dark:border-white/10 dark:bg-neutral-800 dark:text-slate-100"
      >
        <ArrowLeft className="h-6 w-6" />
      </button>

      <div className="relative flex-1">
        <MapView />
      </div>
    </main>
  );
}
