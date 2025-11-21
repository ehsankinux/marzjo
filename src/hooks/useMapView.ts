import { useEffect, useRef, useState } from "react";
import maplibregl, { GeolocateControl } from "maplibre-gl";
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
  const geolocateControlRef = useRef<GeolocateControl | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  const sampleIndexRef = useRef(0);
  const sampleIntervalRef = useRef<number | null>(null);

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
      map.addSource("user-location", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
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

      map.addSource("sample-trail", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
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

      map.addSource("sample-runner", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
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
      const updateRunner = () => {
        const next = (sampleIndexRef.current + 1) % SAMPLE_ROUTE.length;
        sampleIndexRef.current = next;
        const coords = SAMPLE_ROUTE[next];

        const runnerSrc = map.getSource("sample-runner") as maplibregl.GeoJSONSource;
        const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;

        runnerSrc.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
        });

        const traversed = SAMPLE_ROUTE.slice(0, next + 1);
        trailSrc.setData({
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: { type: "LineString", coordinates: traversed },
              properties: {},
            },
          ],
        });
      };

      updateRunner();
      sampleIntervalRef.current = window.setInterval(updateRunner, 600);
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
      const coords: [number, number] = [longitude, latitude];
      const src = map.getSource("user-location") as maplibregl.GeoJSONSource;
      src.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
      });

      setUserLocated(true);
      map.flyTo({ center: coords, zoom: 16, speed: 0.5 });
    });

    geolocateControl.on("error", (err) => {
      console.error("GeolocateControl error:", err);
      setErrorMessage("Unable to get your location. Please allow location access.");
    });

    map.on("load", () => {
      setStatus("ready");
      addSourcesAndLayers();
    });

    // Wait until user has located to start runner
    const runnerWatcher = setInterval(() => {
      if (userLocated) {
        startSampleRunner();
        clearInterval(runnerWatcher);
      }
    }, 500);

    return () => {
      if (sampleIntervalRef.current) window.clearInterval(sampleIntervalRef.current);
      clearInterval(runnerWatcher);
      map.remove();
    };
  }, [userLocated]);

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

// function emptyCollection(): GeoJSON.FeatureCollection {
//   return { type: "FeatureCollection", features: [] };
// }
