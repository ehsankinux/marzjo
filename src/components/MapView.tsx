import MapCanvas from "./MapCanvas";
import useMapView from "../hooks/useMapView";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapView() {
  const { mapContainer, status, errorMessage, userLocated, triggerLocate } = useMapView();

  return (
    <div className="relative w-full h-full">
      <MapCanvas ref={mapContainer} className="w-full h-full rounded-none" />

      {/* Custom locate button (if you want) */}
      {!userLocated && status === "ready" && (
        <button onClick={() => triggerLocate()} className="absolute top-4 right-4 z-30 bg-white p-2 rounded shadow">
          📍 Locate me
        </button>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="absolute top-4 left-4 z-30 max-w-xs rounded-2xl border border-red-200 bg-white/95 p-4 text-sm text-red-600 shadow-lg dark:border-red-500/40 dark:bg-neutral-900/95 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      {/* Legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-20 flex flex-col gap-2 rounded-2xl bg-white/90 p-4 text-sm font-medium text-slate-700 shadow-xl dark:bg-neutral-900/90 dark:text-slate-100">
        <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Legend</span>
        <LegendRow colorClass="bg-blue-500" label="You" />
        <LegendRow colorClass="bg-orange-400" label="Sample runner" />
        <LegendRow colorClass="bg-amber-300" label="Captured area" isSquare />
      </div>
    </div>
  );
}

function LegendRow({ colorClass, label, isSquare = false }: { colorClass: string; label: string; isSquare?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`${colorClass} ${
          isSquare ? "h-3 w-3 rounded-sm" : "h-3 w-3 rounded-full"
        } border border-white/60 shadow`}
      />
      <span>{label}</span>
    </div>
  );
}
