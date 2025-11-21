import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  SAMPLE_AREA_FEATURE,
  SAMPLE_AREA_FILL,
  SAMPLE_AREA_OUTLINE,
  SAMPLE_MARKER_COLOR,
  SAMPLE_ROUTE,
  SAMPLE_ROUTE_COLOR,
  USER_MARKER_COLOR,
  getMapStyle,
} from "../lib/mapUtils";

type MapStatus = "loading" | "ready" | "error";

export default function useMapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const hasCenteredUserRef = useRef(false);
  const watchIdRef = useRef<number | null>(null);

  // New flag: did we get a “good enough” first user fix
  const [userLocated, setUserLocated] = useState(false);

  const sampleIndexRef = useRef(0);
  const sampleIntervalRef = useRef<number | null>(null);

  // … (permission check effect stays the same) …

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
      // Add user location source + layer first
      map.addSource("user-location", { type: "geojson", data: emptyCollection() });
      map.addLayer({
        id: "user-location-circle",
        type: "circle",
        source: "user-location",
        paint: {
          "circle-radius": 7,
          "circle-color": USER_MARKER_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });

      // Then sample area
      map.addSource("sample-area", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [SAMPLE_AREA_FEATURE],
        },
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

      // Prepare sample trail + runner, but *don't start updating runner yet*
      map.addSource("sample-trail", { type: "geojson", data: emptyCollection() });
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

      map.addSource("sample-runner", { type: "geojson", data: emptyCollection() });
      map.addLayer({
        id: "sample-runner-circle",
        type: "circle",
        source: "sample-runner",
        paint: {
          "circle-radius": 8,
          "circle-color": SAMPLE_MARKER_COLOR,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      });
    };

    const beginUserLocationWatch = () => {
      if (!window.isSecureContext || !("geolocation" in navigator)) {
        setErrorMessage("Cannot start geolocation: insecure context or geolocation unsupported");
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setErrorMessage(null);
          const { longitude, latitude, accuracy } = position.coords;
          const coords: [number, number] = [longitude, latitude];
          console.log("Location:", coords, "accuracy:", accuracy);

          const src = map.getSource("user-location") as maplibregl.GeoJSONSource | undefined;
          if (src) {
            src.setData({
              type: "FeatureCollection",
              features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
            });
          }

          // If first “good” fix, center
          const ACC_THRESHOLD = 100; // meters
          if (!hasCenteredUserRef.current && accuracy <= ACC_THRESHOLD) {
            hasCenteredUserRef.current = true;
            map.flyTo({ center: coords, zoom: 16, speed: 0.5 });
            setUserLocated(true); // we mark that location is “good enough”
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          // same error handling as before…
          if (error.code === error.PERMISSION_DENIED) {
            setErrorMessage("Please allow location access to see your position on the map.");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setErrorMessage("Location unavailable. Try moving to open area.");
          } else if (error.code === error.TIMEOUT) {
            setErrorMessage("Location request timed out. Trying again…");
          } else {
            setErrorMessage("Unable to fetch location.");
          }
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );
    };

    const startSampleRunner = () => {
      const update = () => {
        const next = (sampleIndexRef.current + 1) % SAMPLE_ROUTE.length;
        sampleIndexRef.current = next;
        const coords = SAMPLE_ROUTE[next];
        const runnerSrc = map.getSource("sample-runner") as maplibregl.GeoJSONSource | undefined;
        const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource | undefined;
        if (runnerSrc) {
          runnerSrc.setData({
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
          });
        }
        if (trailSrc) {
          const traversed = SAMPLE_ROUTE.slice(0, next + 1);
          trailSrc.setData({
            type: "FeatureCollection",
            features: [{ type: "Feature", geometry: { type: "LineString", coordinates: traversed }, properties: {} }],
          });
        }
      };

      update();
      sampleIntervalRef.current = window.setInterval(update, 600);
    };

    map.on("load", () => {
      setStatus("ready");
      addSourcesAndLayers();
      beginUserLocationWatch();
    });

    // Wait for userLocated = true, then start runner
    const runnerInterval = setInterval(() => {
      if (userLocated) {
        startSampleRunner();
        clearInterval(runnerInterval);
      }
    }, 500);

    map.on("error", (e) => {
      console.error("Map error:", (e as any).error || e);
      setStatus("error");
      setErrorMessage("Map failed to load. Please refresh.");
    });

    return () => {
      if (sampleIntervalRef.current != null) window.clearInterval(sampleIntervalRef.current);
      if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
      clearInterval(runnerInterval);
      map.remove();
      mapRef.current = null;
    };
  }, [userLocated]);

  return { mapContainer, status, errorMessage } as const;
}

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}
