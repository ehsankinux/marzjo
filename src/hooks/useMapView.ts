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

export default function useMapView() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geolocateControlRef = useRef<GeolocateControl | null>(null);

  const [status, setStatus] = useState<MapStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [userLocated, setUserLocated] = useState(false);

  // Store user location once geolocated
  const userLocationRef = useRef<[number, number] | null>(null);

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
      // Source for user location
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

      // Source for sample area (initially empty, will set later)
      map.addSource("sample-area", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
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

      // Source for sample route / runner
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

    const translateSampleGeometries = (userLngLat: [number, number]) => {
      const [userLng, userLat] = userLngLat;

      // --- Translate SAMPLE_AREA_FEATURE relative to user ---
      // Use Turf: shift coordinates so the SAMPLE_AREA centroid matches user position
      const areaFeature = SAMPLE_AREA_FEATURE;

      // Compute centroid of sample-area original
      const originalCentroid = turf.centroid(areaFeature).geometry.coordinates as [number, number];
      const dx = userLng - originalCentroid[0];
      const dy = userLat - originalCentroid[1];

      // Move all coordinates by (dx, dy)
      const movedArea = turf.transformTranslate(areaFeature, 0, 0, {
        mutate: false,
      }); // we will manually move

      const movedCoords = (areaFeature.geometry.coordinates as any).map((poly: any) =>
        poly.map((coord: number[]) => [coord[0] + dx, coord[1] + dy])
      );

      movedArea.geometry.coordinates = movedCoords;

      // --- Translate SAMPLE_ROUTE relative to user ---
      const movedRoute = SAMPLE_ROUTE.map((coord) => {
        const [origLng, origLat] = coord;
        return [origLng + dx, origLat + dy] as [number, number];
      });

      // Update map sources
      const areaSrc = map.getSource("sample-area") as maplibregl.GeoJSONSource;
      areaSrc.setData({
        type: "FeatureCollection",
        features: [movedArea],
      });

      const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;
      trailSrc.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: { type: "LineString", coordinates: movedRoute },
            properties: {},
          },
        ],
      });

      return movedRoute;
    };

    const startSampleRunner = (translatedRoute: [number, number][]) => {
      const updateRunner = () => {
        const next = (sampleIndexRef.current + 1) % translatedRoute.length;
        sampleIndexRef.current = next;
        const coords = translatedRoute[next];

        const runnerSrc = map.getSource("sample-runner") as maplibregl.GeoJSONSource;
        const trailSrc = map.getSource("sample-trail") as maplibregl.GeoJSONSource;

        runnerSrc.setData({
          type: "FeatureCollection",
          features: [{ type: "Feature", geometry: { type: "Point", coordinates: coords }, properties: {} }],
        });

        const traversed = translatedRoute.slice(0, next + 1);
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

      // First update immediately
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
      const userCoords: [number, number] = [longitude, latitude];
      userLocationRef.current = userCoords;

      // Update user-location source
      const src = map.getSource("user-location") as maplibregl.GeoJSONSource;
      src.setData({
        type: "FeatureCollection",
        features: [{ type: "Feature", geometry: { type: "Point", coordinates: userCoords }, properties: {} }],
      });

      setUserLocated(true);
      map.flyTo({ center: userCoords, zoom: 16, speed: 0.5 });

      // Translate sample geometries around user
      const translatedRoute = translateSampleGeometries(userCoords);

      // Start runner only after translation
      startSampleRunner(translatedRoute);
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
      if (sampleIntervalRef.current) window.clearInterval(sampleIntervalRef.current);
      map.remove();
    };
  }, []);

  return {
    mapContainer,
    status,
    errorMessage,
    userLocated,
    // expose trigger to MapView to programmatically geolocate
    triggerLocate: () => {
      geolocateControlRef.current?.trigger();
    },
  } as const;
}
