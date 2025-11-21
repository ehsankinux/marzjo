export async function fetchOwnershipGeoJSON(): Promise<any> {
  const res = await fetch("/api/ownership"); // GET GeoJSON FeatureCollection
  if (!res.ok) throw new Error("Failed to fetch ownership");
  return res.json();
}

export async function uploadRunPolygon(geojson: any): Promise<any> {
  const res = await fetch("/api/submit-run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ polygon: geojson }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("submit failed: " + text);
  }
  return res.json(); // server responds with updated ownership GeoJSON
}
