export const DEFAULT_CENTER: [number, number] = [51.389, 35.6892];
export const DEFAULT_ZOOM = 15;

export const USER_MARKER_COLOR = "#2563eb";
export const SAMPLE_MARKER_COLOR = "#fb923c";
export const SAMPLE_ROUTE_COLOR = "#f97316";
export const SAMPLE_AREA_OUTLINE = "#ea580c";
export const SAMPLE_AREA_FILL = "#fed7aa";

/** Compute map style URL using MapTiler key when present. */
export function getMapStyle() {
  return (import.meta as any).env?.VITE_MAPTILER_KEY
    ? `https://api.maptiler.com/maps/streets/style.json?key=${(import.meta as any).env.VITE_MAPTILER_KEY}`
    : "https://demotiles.maplibre.org/style.json";
}

const RAW_SAMPLE_LOOP: Array<[number, number]> = [
  [51.3886, 35.6897],
  [51.3895, 35.6902],
  [51.3906, 35.6896],
  [51.3909, 35.6887],
  [51.3901, 35.6881],
  [51.3891, 35.6883],
  [51.3884, 35.6889],
];

export const SAMPLE_AREA_LOOP = closeLoop(RAW_SAMPLE_LOOP);

export const SAMPLE_AREA_FEATURE: GeoJSON.Feature<GeoJSON.Polygon> = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [SAMPLE_AREA_LOOP] },
  properties: { label: "sample-area" },
};

export const SAMPLE_ROUTE: Array<[number, number]> = buildSampleRoute(SAMPLE_AREA_LOOP, 5);

function closeLoop(coords: Array<[number, number]>) {
  if (!coords.length) return coords;
  const first = coords[0];
  const last = coords[coords.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return coords;
  return [...coords, first];
}

function buildSampleRoute(loop: Array<[number, number]>, stepsPerEdge = 6) {
  if (loop.length < 2) return loop;
  const dense: Array<[number, number]> = [];
  for (let i = 0; i < loop.length - 1; i++) {
    const start = loop[i];
    const end = loop[i + 1];
    dense.push(start);
    for (let step = 1; step < stepsPerEdge; step++) {
      const t = step / stepsPerEdge;
      dense.push([start[0] + (end[0] - start[0]) * t, start[1] + (end[1] - start[1]) * t]);
    }
  }
  dense.push(loop[loop.length - 1]);
  return dense;
}

