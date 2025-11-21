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

// Adjust these values to control offset and pace:
// const SAMPLE_OFFSET_DISTANCE_METERS = 30; // e.g. 30 m from user
// const SAMPLE_OFFSET_BEARING_DEGREES = 45; // e.g. northeast
const RUNNER_SPEED_M_S = 1.4; // ~1.4 m/s = ~5 km/h

export default function useMapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geolocateControlRef = useRef<GeolocateControl | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  // const sampleIndexRef = useRef(0);
  const sampleIntervalRef = useRef<number | null>(null);
  const offsetRouteRef = useRef<Array<[number, number]>>([]);

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
      // User location source / layer
      map.addSource("user-location", {
        type: "geojson",
        data: turf.featureCollection([]),
      });
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

      // Sample area / polygon
      map.addSource("sample-area", {
        type: "geojson",
        data: turf.featureCollection([]),
      });
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
      map.addSource("sample-trail", {
        type: "geojson",
        data: turf.featureCollection([]),
      });
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
      map.addSource("sample-runner", {
        type: "geojson",
        data: turf.featureCollection([]),
      });
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

    const computeOffsetGeometry = (userCoords: [number, number]) => {
      const [userLng, userLat] = userCoords;

      // Translate SAMPLE_AREA_FEATURE to be offset from user location
      const areaCentroid = turf.centroid(SAMPLE_AREA_FEATURE).geometry.coordinates as [number, number];
      const dx = userLng - areaCentroid[0];
      const dy = userLat - areaCentroid[1];

      // Move area coordinates relative to user
      const movedArea = turf.clone(SAMPLE_AREA_FEATURE);
      movedArea.geometry.coordinates = (SAMPLE_AREA_FEATURE.geometry.coordinates as any).map((poly: any) =>
        poly.map((coord: number[]) => [coord[0] + dx, coord[1] + dy])
      );

      // Move route relative to user
      const movedRoute = SAMPLE_ROUTE.map(([lng, lat]) => [lng + dx, lat + dy] as [number, number]);
      offsetRouteRef.current = movedRoute;

      // Update map sources
      const areaSrc = map.getSource("sample-area") as maplibregl.GeoJSONSource;
      areaSrc.setData(turf.featureCollection([movedArea]));

      const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;
      trailSrc.setData(turf.lineString(movedRoute));

      return movedRoute;
    };

    const startSampleRunner = () => {
      const routeCoords = offsetRouteRef.current;
      if (routeCoords.length < 2) {
        console.warn("Offset route too small for runner");
        return;
      }

      // Calculate total length of the line
      const line = turf.lineString(routeCoords);
      const length = turf.length(line, { units: "kilometers" }) * 1000; // in meters

      // How often to update: compute distance to move per tick
      const tickMs = 1000; // every second
      const distancePerTick = RUNNER_SPEED_M_S * (tickMs / 1000); // meters per tick

      let traveled = 0;

      const tick = () => {
        traveled += distancePerTick;
        if (traveled > length) {
          traveled = 0; // loop
        }
        const pointOnLine = turf.along(line, traveled / 1000, { units: "kilometers" });
        const coords = pointOnLine.geometry.coordinates as [number, number];

        const runnerSrc = map.getSource("sample-runner") as maplibregl.GeoJSONSource;
        runnerSrc.setData(turf.point(coords));

        // Optional: update trail so far
        const sliced = turf.lineSlice(turf.point(routeCoords[0]), turf.point(coords), line);
        const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;
        trailSrc.setData(sliced as any);
      };

      // Run first tick immediately
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

      // Update user location source
      const userSrc = map.getSource("user-location") as maplibregl.GeoJSONSource;
      userSrc.setData(turf.point(userCoords));

      setUserLocated(true);

      // Place area + route near user
      computeOffsetGeometry(userCoords);

      // Start sample runner
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
      if (sampleIntervalRef.current != null) {
        window.clearInterval(sampleIntervalRef.current);
      }
      map.remove();
    };
  }, []);

  return {
    mapContainer,
    status,
    errorMessage,
    userLocated,
    triggerLocate: () => {
      geolocateControlRef.current?.trigger();
    },
  } as const;
}
