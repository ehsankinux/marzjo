import * as turf from "@turf/turf";

export function lineToBufferedPolygon(coords: Array<[number, number]>, meters = 15) {
  const line = turf.lineString(coords);
  const buffer = turf.buffer(line, meters, { units: "meters" });
  if (!buffer) {
    throw new Error("Buffer operation failed, resulting in undefined.");
  }
  return turf.simplify(buffer, { tolerance: 0.0005, highQuality: true });
}
