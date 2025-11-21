import { useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl } from "maplibre-gl";
import * as turf from "@turf/turf";
import type { Feature, Polygon, MultiPolygon } from "geojson";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  SAMPLE_AREA_FEATURE,
  SAMPLE_ROUTE,
  SAMPLE_ROUTE_COLOR,
  SAMPLE_MARKER_COLOR,
  SAMPLE_AREA_FILL,
  SAMPLE_AREA_OUTLINE,
  USER_MARKER_COLOR,
  getMapStyle,
} from "../lib/mapUtils";

type MapStatus = "loading" | "ready" | "error";

const RUNNER1 = { offsetMeters: 30, bearing: 45, speedMs: 4 };
const RUNNER2 = { offsetMeters: 55, bearing: 110, speedMs: 5 };
const BUFFER_METERS = 12;
const TICK_MS = 1000;

export default function useMapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geolocateControlRef = useRef<GeolocateControl | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  const offsetRoute1Ref = useRef<Array<[number, number]>>([]);
  const offsetRoute2Ref = useRef<Array<[number, number]>>([]);

  const interval1Ref = useRef<number | null>(null);
  const interval2Ref = useRef<number | null>(null);
  const loopDone1Ref = useRef(false);
  const loopDone2Ref = useRef(false);
  const areaShown1Ref = useRef(false);
  const areaShown2Ref = useRef(false);

  const capturedArea1Ref = useRef<Feature<Polygon | MultiPolygon> | null>(null);
  const capturedArea2Ref = useRef<Feature<Polygon | MultiPolygon> | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyle(),
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
    });
    mapRef.current = map;

    const addSourcesAndLayers = () => {
      map.addSource("user-location", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "user-location-circle",
        type: "circle",
        source: "user-location",
        paint: {
          "circle-radius": 7,
          "circle-color": USER_MARKER_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });

      // Runner 1
      map.addSource("sample-trail-1", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-trail-line-1",
        type: "line",
        source: "sample-trail-1",
        paint: { "line-color": SAMPLE_ROUTE_COLOR, "line-width": 4, "line-opacity": 0.85 },
      });
      map.addSource("sample-runner-1", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-runner-circle-1",
        type: "circle",
        source: "sample-runner-1",
        paint: {
          "circle-radius": 8,
          "circle-color": SAMPLE_MARKER_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
      map.addSource("sample-area-1", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-area-fill-1",
        type: "fill",
        source: "sample-area-1",
        paint: { "fill-color": SAMPLE_AREA_FILL, "fill-opacity": 0.55 },
      });
      map.addLayer({
        id: "sample-area-outline-1",
        type: "line",
        source: "sample-area-1",
        paint: { "line-width": 2.5, "line-color": SAMPLE_AREA_OUTLINE },
      });

      // Runner 2
      map.addSource("sample-trail-2", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-trail-line-2",
        type: "line",
        source: "sample-trail-2",
        paint: { "line-color": "#f97316", "line-width": 3.5, "line-opacity": 0.9 },
      });
      map.addSource("sample-runner-2", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-runner-circle-2",
        type: "circle",
        source: "sample-runner-2",
        paint: {
          "circle-radius": 7,
          "circle-color": "#fb923c",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
      map.addSource("sample-area-2", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-area-fill-2",
        type: "fill",
        source: "sample-area-2",
        paint: { "fill-color": "#fed7aa", "fill-opacity": 0.55 },
      });
      map.addLayer({
        id: "sample-area-outline-2",
        type: "line",
        source: "sample-area-2",
        paint: { "line-width": 2.5, "line-color": "#ea580c" },
      });
    };

    const computeOffsetRoute = (userCoords: [number, number], offsetMeters: number, bearingDeg: number) => {
      const [userLng, userLat] = userCoords;
      const routeLine = turf.lineString(SAMPLE_ROUTE);
      const centroid = turf.centroid(routeLine).geometry.coordinates as [number, number];
      const dest = turf.destination(turf.point([userLng, userLat]), offsetMeters / 1000, bearingDeg, {
        units: "kilometers",
      }).geometry.coordinates as [number, number];
      const dx = dest[0] - centroid[0];
      const dy = dest[1] - centroid[1];
      const movedRoute = SAMPLE_ROUTE.map(([lng, lat]) => [lng + dx, lat + dy] as [number, number]);
      const clonedArea = JSON.parse(JSON.stringify(SAMPLE_AREA_FEATURE)) as Feature<Polygon>;
      clonedArea.geometry.coordinates = (SAMPLE_AREA_FEATURE.geometry.coordinates as any).map((poly: any) =>
        poly.map((coord: number[]) => [coord[0] + dx, coord[1] + dy])
      );
      return { movedRoute, movedArea: clonedArea };
    };

    const startRunner = (runnerIndex: 1 | 2) => {
      const routeCoords = runnerIndex === 1 ? offsetRoute1Ref.current : offsetRoute2Ref.current;
      if (routeCoords.length < 2) return;

      const line = turf.lineString(routeCoords);
      const lineLength = turf.length(line, { units: "kilometers" }) * 1000;
      const speed = runnerIndex === 1 ? RUNNER1.speedMs : RUNNER2.speedMs;
      const distancePerTick = speed * (TICK_MS / 1000);

      let traveled = 0;
      const loopDoneRef = runnerIndex === 1 ? loopDone1Ref : loopDone2Ref;
      const areaShownRef = runnerIndex === 1 ? areaShown1Ref : areaShown2Ref;
      const intervalRef = runnerIndex === 1 ? interval1Ref : interval2Ref;

      const tick = () => {
        traveled += distancePerTick;
        if (traveled > lineLength) {
          traveled = 0;
          loopDoneRef.current = true;
        }

        const pointOnLine = turf.along(line, traveled / 1000, { units: "kilometers" });
        const coords = pointOnLine.geometry.coordinates as [number, number];

        (map.getSource(`sample-runner-${runnerIndex}`) as maplibregl.GeoJSONSource).setData(turf.point(coords));
        const sliced = turf.lineSlice(turf.point(routeCoords[0]), turf.point(coords), line);
        (map.getSource(`sample-trail-${runnerIndex}`) as maplibregl.GeoJSONSource).setData(sliced as any);

        if (loopDoneRef.current && !areaShownRef.current) {
          const fullBuffer = turf.buffer(line, BUFFER_METERS, { units: "meters" }) as Feature<Polygon | MultiPolygon>;

          if (runnerIndex === 1) {
            capturedArea1Ref.current = fullBuffer;
            (map.getSource("sample-area-1") as maplibregl.GeoJSONSource).setData(turf.featureCollection([fullBuffer]));
            areaShown1Ref.current = true;
          } else {
            const area1 = capturedArea1Ref.current;
            const area2 = capturedArea2Ref.current;

            if (area1) {
              const intersection = turf.intersect(fullBuffer as any, area1 as any) as Feature<
                Polygon | MultiPolygon
              > | null;
              if (intersection) {
                try {
                  const fc = turf.featureCollection([area1, intersection]);
                  const newArea1 = turf.difference(fc) as Feature<Polygon | MultiPolygon> | null;
                  if (newArea1) capturedArea1Ref.current = newArea1;
                } catch {}
                capturedArea2Ref.current = area2
                  ? (turf.union(area2 as any, fullBuffer as any) as Feature<Polygon | MultiPolygon>)
                  : fullBuffer;
              } else {
                capturedArea2Ref.current = area2
                  ? (turf.union(area2 as any, fullBuffer as any) as Feature<Polygon | MultiPolygon>)
                  : fullBuffer;
              }
            } else {
              capturedArea2Ref.current = fullBuffer;
            }

            (map.getSource("sample-area-2") as maplibregl.GeoJSONSource).setData(
              capturedArea2Ref.current ? turf.featureCollection([capturedArea2Ref.current]) : turf.featureCollection([])
            );
            (map.getSource("sample-area-1") as maplibregl.GeoJSONSource).setData(
              capturedArea1Ref.current ? turf.featureCollection([capturedArea1Ref.current]) : turf.featureCollection([])
            );

            areaShown2Ref.current = true;
          }

          areaShownRef.current = true;
        }
      };

      tick();
      intervalRef.current = window.setInterval(tick, TICK_MS);
    };

    const geolocateControl = new GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: false,
      showUserLocation: true,
      fitBoundsOptions: { maxZoom: 16 },
    });
    geolocateControlRef.current = geolocateControl;
    map.addControl(geolocateControl, "top-right");

    geolocateControl.on("geolocate", (evt) => {
      const { longitude, latitude } = evt.coords;
      const userCoords: [number, number] = [longitude, latitude];

      (map.getSource("user-location") as maplibregl.GeoJSONSource).setData(turf.point(userCoords));
      setUserLocated(true);

      const { movedRoute: r1 } = computeOffsetRoute(userCoords, RUNNER1.offsetMeters, RUNNER1.bearing);
      const { movedRoute: r2 } = computeOffsetRoute(userCoords, RUNNER2.offsetMeters, RUNNER2.bearing);
      offsetRoute1Ref.current = r1;
      offsetRoute2Ref.current = r2;

      (map.getSource("sample-trail-1") as maplibregl.GeoJSONSource).setData(turf.lineString(r1));
      (map.getSource("sample-trail-2") as maplibregl.GeoJSONSource).setData(turf.lineString(r2));

      startRunner(1);
      setTimeout(() => startRunner(2), 800);
      map.flyTo({ center: userCoords, zoom: 16, speed: 0.6 });
    });

    geolocateControl.on("error", () => {
      setErrorMessage("Unable to get your location. Please allow location access.");
    });

    map.on("load", () => {
      setStatus("ready");
      addSourcesAndLayers();
    });

    return () => {
      if (interval1Ref.current != null) window.clearInterval(interval1Ref.current);
      if (interval2Ref.current != null) window.clearInterval(interval2Ref.current);
      map.remove();
    };
  }, []);

  return {
    mapContainer,
    status,
    errorMessage,
    userLocated,
    triggerLocate: () => geolocateControlRef.current?.trigger(),
  } as const;
}
