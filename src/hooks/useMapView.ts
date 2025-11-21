import { useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl } from "maplibre-gl";
import * as turf from "@turf/turf";
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

const RUNNER_SPEED_M_S = 1.4; // ~1.4 m/s = ~5 km/h

export default function useMapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geolocateControlRef = useRef<GeolocateControl | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  const sampleIntervalRef = useRef<number | null>(null);
  const offsetRouteRef = useRef<Array<[number, number]>>([]);
  const loopCompletedRef = useRef(false); // track loop completion

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
      // User location
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

      // Sample area (empty at first)
      map.addSource("sample-area", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-area-fill",
        type: "fill",
        source: "sample-area",
        paint: {
          "fill-color": SAMPLE_AREA_FILL,
          "fill-opacity": 0.55,
        },
      });
      map.addLayer({
        id: "sample-area-outline",
        type: "line",
        source: "sample-area",
        paint: {
          "line-width": 2.5,
          "line-color": SAMPLE_AREA_OUTLINE,
        },
      });

      // Sample trail
      map.addSource("sample-trail", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-trail-line",
        type: "line",
        source: "sample-trail",
        paint: {
          "line-color": SAMPLE_ROUTE_COLOR,
          "line-width": 4,
          "line-opacity": 0.8,
        },
      });

      // Runner
      map.addSource("sample-runner", { type: "geojson", data: turf.featureCollection([]) });
      map.addLayer({
        id: "sample-runner-circle",
        type: "circle",
        source: "sample-runner",
        paint: {
          "circle-radius": 8,
          "circle-color": SAMPLE_MARKER_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#fff",
        },
      });
    };

    const computeOffsetRoute = (userCoords: [number, number]) => {
      const [userLng, userLat] = userCoords;
      const routeLine = turf.lineString(SAMPLE_ROUTE);
      const centroid = turf.centroid(routeLine).geometry.coordinates as [number, number];
      const dx = userLng - centroid[0];
      const dy = userLat - centroid[1];

      const movedRoute = SAMPLE_ROUTE.map(([lng, lat]) => [lng + dx, lat + dy] as [number, number]);
      offsetRouteRef.current = movedRoute;
      return movedRoute;
    };

    const startSampleRunner = () => {
      const routeCoords = offsetRouteRef.current;
      if (routeCoords.length < 2) return;

      const line = turf.lineString(routeCoords);
      const lineLength = turf.length(line, { units: "kilometers" }) * 1000; // meters
      const tickMs = 1000;
      const distancePerTick = RUNNER_SPEED_M_S * (tickMs / 1000);

      let traveled = 0;
      let lastTraveled = 0;

      const tick = () => {
        traveled += distancePerTick;
        if (traveled > lineLength) {
          traveled = 0; // loop again
          loopCompletedRef.current = true; // mark first loop finished
        }

        const pointOnLine = turf.along(line, traveled / 1000, { units: "kilometers" });
        const coords = pointOnLine.geometry.coordinates as [number, number];

        // Update runner
        const runnerSrc = map.getSource("sample-runner") as maplibregl.GeoJSONSource;
        runnerSrc.setData(turf.point(coords));

        // Update trail so far
        const sliced = turf.lineSlice(turf.point(routeCoords[0]), turf.point(coords), line);
        const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;
        trailSrc.setData(sliced as any);

        // Show captured area only after first full loop
        if (loopCompletedRef.current && lastTraveled < lineLength) {
          const areaSrc = map.getSource("sample-area") as maplibregl.GeoJSONSource;
          areaSrc.setData(turf.featureCollection([SAMPLE_AREA_FEATURE]));
        }

        lastTraveled = traveled;
      };

      tick();
      sampleIntervalRef.current = window.setInterval(tick, tickMs);
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

      const userSrc = map.getSource("user-location") as maplibregl.GeoJSONSource;
      userSrc.setData(turf.point(userCoords));

      setUserLocated(true);

      computeOffsetRoute(userCoords);
      startSampleRunner();

      map.flyTo({ center: userCoords, zoom: 16, speed: 0.5 });
    });

    geolocateControl.on("error", (err) => {
      console.error("GeolocateControl error:", err);
      setErrorMessage("Unable to get your location. Please allow location access.");
    });

    map.on("load", () => {
      setStatus("ready");
      addSourcesAndLayers();
    });

    return () => {
      if (sampleIntervalRef.current != null) window.clearInterval(sampleIntervalRef.current);
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
