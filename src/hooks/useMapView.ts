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
  const sampleIndexRef = useRef(0);
  const sampleIntervalRef = useRef<number | null>(null);
  const permissionCheckedRef = useRef(false);

  // Check geolocation availability and permissions on mount
  useEffect(() => {
    const checkGeolocationSupport = async () => {
      // Check if geolocation is supported
      if (!("geolocation" in navigator)) {
        setErrorMessage("Geolocation is not supported by your browser");
        return;
      }

      // Check if running in secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        setErrorMessage(
          "🔒 Location access requires HTTPS. Please use: npm run dev:https and access via https://<YOUR_IP>:4173"
        );
        console.error("❌ Not in secure context. Current URL:", window.location.href);
        console.error("💡 Solution: Run 'npm run dev:https' and access via HTTPS");
        return;
      }

      // Check permission state if supported
      if ("permissions" in navigator) {
        try {
          const result = await navigator.permissions.query({ name: "geolocation" as PermissionName });
          
          if (result.state === "denied") {
            setErrorMessage("Location access denied. Please enable location permissions in your browser settings");
            console.warn("⚠️ Location permission denied");
          } else {
            console.log("✓ Location permission state:", result.state);
          }

          // Listen for permission changes
          result.addEventListener("change", () => {
            console.log("Permission changed to:", result.state);
            if (result.state === "granted") {
              setErrorMessage(null);
            } else if (result.state === "denied") {
              setErrorMessage("Location access denied. Please enable location permissions in your browser settings");
            }
          });
        } catch (err) {
          console.warn("Permission API query failed:", err);
        }
      }

      permissionCheckedRef.current = true;
    };

    checkGeolocationSupport();
  }, []);

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

      map.addSource("sample-runner", { type: "geojson", data: pointCollection(SAMPLE_ROUTE[0]) });
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

    const startSampleRunner = () => {
      const updateSamplePoint = () => {
        const nextIndex = (sampleIndexRef.current + 1) % SAMPLE_ROUTE.length;
        sampleIndexRef.current = nextIndex;

        const coords = SAMPLE_ROUTE[nextIndex];
        const runnerSource = map.getSource("sample-runner") as maplibregl.GeoJSONSource | undefined;
        if (runnerSource) {
          runnerSource.setData(pointCollection(coords));
        }

        const trailSource = map.getSource("sample-trail") as maplibregl.GeoJSONSource | undefined;
        if (trailSource) {
          const traversed = SAMPLE_ROUTE.slice(0, nextIndex + 1);
          trailSource.setData({
            type: "FeatureCollection",
            features: [
              {
                type: "Feature",
                geometry: { type: "LineString", coordinates: traversed.length ? traversed : [coords] },
                properties: {},
              },
            ],
          });
        }
      };

      updateSamplePoint();
      sampleIntervalRef.current = window.setInterval(updateSamplePoint, 600);
    };

    const beginUserLocationWatch = () => {
      // Don't attempt geolocation if not in secure context
      if (!window.isSecureContext) {
        console.error("❌ Cannot request geolocation in non-secure context");
        return;
      }

      if (!("geolocation" in navigator)) {
        setErrorMessage("Geolocation is not supported in this browser.");
        console.error("❌ Geolocation API not available");
        return;
      }

      console.log("📍 Requesting user location...");
      console.log("🌐 Current URL:", window.location.href);
      console.log("🔒 Secure context:", window.isSecureContext);

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          setErrorMessage(null);
          const { longitude, latitude, accuracy } = position.coords;
          const coords: [number, number] = [longitude, latitude];
          
          console.log("✅ Location updated:", {
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            accuracy: `${accuracy.toFixed(1)}m`,
            timestamp: new Date(position.timestamp).toLocaleTimeString()
          });

          const src = map.getSource("user-location") as maplibregl.GeoJSONSource | undefined;
          if (src) src.setData(pointCollection(coords));

          if (!hasCenteredUserRef.current) {
            hasCenteredUserRef.current = true;
            console.log("🎯 Centering map on user location");
            map.flyTo({ center: coords, zoom: 16, speed: 0.5 });
          }
        },
        (error) => {
          console.error("❌ Geolocation error:", {
            code: error.code,
            message: error.message,
            type: [
              "UNKNOWN_ERROR",
              "PERMISSION_DENIED",
              "POSITION_UNAVAILABLE",
              "TIMEOUT"
            ][error.code] || "UNKNOWN"
          });

          if (error.code === error.PERMISSION_DENIED) {
            setErrorMessage("Please allow location access to see your position on the map.");
            console.error("💡 User denied location permission or browser blocked it");
            console.error("💡 On mobile: Check Settings → Safari/Chrome → Location → Allow");
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            setErrorMessage("Location unavailable. Check your GPS or network signal.");
            console.error("💡 GPS signal may be weak. Try moving to an open area");
          } else if (error.code === error.TIMEOUT) {
            setErrorMessage("Location request timed out. Please try again.");
            console.error("💡 Location request took too long. Retrying...");
          } else {
            setErrorMessage("Unable to fetch your location right now.");
          }
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 1000, 
          timeout: 10000  // Increased timeout for better mobile experience
        }
      );

      console.log("👀 Watching position with ID:", watchIdRef.current);
    };

    map.on("load", () => {
      console.log("✅ Map loaded successfully");
      setStatus("ready");
      addSourcesAndLayers();
      startSampleRunner();
      beginUserLocationWatch();
    });

    map.on("error", (e) => {
      console.error("❌ Map error:", e?.error || e);
      setStatus("error");
      setErrorMessage("Map failed to load. Please refresh the page.");
    });

    return () => {
      if (sampleIntervalRef.current != null) {
        window.clearInterval(sampleIntervalRef.current);
      }
      if (watchIdRef.current != null) {
        console.log("🛑 Stopping location watch");
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return {
    mapContainer,
    status,
    errorMessage,
  } as const;
}

function emptyCollection(): GeoJSON.FeatureCollection {
  return { type: "FeatureCollection", features: [] };
}

function pointCollection(coords: [number, number]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
  };
}