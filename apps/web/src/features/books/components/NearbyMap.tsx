"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";
const cinematicPitch = 62;
const cinematicZoom = 16.4;
const initialBearing = -28;
const rotationSpeed = 140;

export type NearbyMapPoint = {
  id: string;
  title: string;
  subtitle: string;
  latitude: number;
  longitude: number;
  variant: "origin" | "nearby";
};

type NearbyMapProps = {
  title: string;
  description: string;
  emptyState: string;
  legendNearbyLabel: string;
  legendOriginLabel: string;
  pauseRotationLabel: string;
  points: NearbyMapPoint[];
  resetCameraLabel: string;
  resumeRotationLabel: string;
  switchTo2dLabel: string;
  switchTo3dLabel: string;
};

export function NearbyMap({
  title,
  description,
  emptyState,
  legendNearbyLabel,
  legendOriginLabel,
  pauseRotationLabel,
  points,
  resetCameraLabel,
  resumeRotationLabel,
  switchTo2dLabel,
  switchTo3dLabel,
}: NearbyMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const last3dCameraRef = useRef<maplibregl.CameraOptions | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const originRef = useRef<NearbyMapPoint | null>(null);
  const rotateCameraRef = useRef<FrameRequestCallback | null>(null);
  const rotationEnabledRef = useRef(false);
  const [is3dMode, setIs3dMode] = useState(true);
  const [isRotationActive, setIsRotationActive] = useState(true);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || points.length === 0) {
      return;
    }

    const container = containerRef.current;
    const origin = points.find((point) => point.variant === "origin") ?? points[0];
    originRef.current = origin;
    rotationEnabledRef.current = true;
    setIs3dMode(true);
    setIsRotationActive(true);

    const map = new maplibregl.Map({
      container,
      style: mapStyleUrl,
      center: [origin.longitude, origin.latitude],
      zoom: cinematicZoom,
      pitch: cinematicPitch,
      bearing: initialBearing,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    for (const point of points) {
      const markerElement = document.createElement("div");
      markerElement.className =
        point.variant === "origin"
          ? "h-7 w-7 rounded-full border-[3px] border-background bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/0.22),0_12px_24px_hsl(0_0%_0%/0.28)]"
          : "h-5 w-5 rounded-full border-[3px] border-background bg-foreground shadow-[0_0_0_6px_hsl(0_0%_0%/0.14),0_10px_20px_hsl(0_0%_0%/0.24)]";

      new maplibregl.Marker({ element: markerElement })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 16 }).setHTML(
            `<strong>${escapeHtml(point.title)}</strong><br /><span>${escapeHtml(point.subtitle)}</span>`,
          ),
        )
        .addTo(map);
    }

    const stopRotation = () => {
      rotationEnabledRef.current = false;
      setIsRotationActive(false);

      if (animationFrameRef.current !== undefined) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = undefined;
      }
    };

    const rotateCamera = (timestamp: number) => {
      if (!rotationEnabledRef.current) {
        return;
      }

      map.rotateTo((timestamp / rotationSpeed + initialBearing) % 360, { duration: 0 });
      animationFrameRef.current = requestAnimationFrame(rotateCamera);
    };

    rotateCameraRef.current = rotateCamera;

    map.once("load", () => {
      add3dBuildingsLayer(map);
      map.jumpTo({
        bearing: initialBearing,
        center: [origin.longitude, origin.latitude],
        pitch: cinematicPitch,
        zoom: cinematicZoom,
      });

      animationFrameRef.current = requestAnimationFrame(rotateCamera);
    });

    container.addEventListener("pointerdown", stopRotation);
    container.addEventListener("wheel", stopRotation, { passive: true });
    container.addEventListener("touchstart", stopRotation, { passive: true });

    mapRef.current = map;

    return () => {
      container.removeEventListener("pointerdown", stopRotation);
      container.removeEventListener("wheel", stopRotation);
      container.removeEventListener("touchstart", stopRotation);
      stopRotation();
      map.remove();
      mapRef.current = null;
      originRef.current = null;
      rotateCameraRef.current = null;
    };
  }, [points]);

  const pauseRotation = () => {
    rotationEnabledRef.current = false;
    setIsRotationActive(false);

    if (animationFrameRef.current !== undefined) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = undefined;
    }
  };

  const resumeRotation = () => {
    if (!rotateCameraRef.current || rotationEnabledRef.current) {
      return;
    }

    rotationEnabledRef.current = true;
    setIsRotationActive(true);
    animationFrameRef.current = requestAnimationFrame(rotateCameraRef.current);
  };

  const resetCamera = () => {
    const map = mapRef.current;
    const origin = originRef.current;

    if (!map || !origin) {
      return;
    }

    map.easeTo({
      bearing: is3dMode ? initialBearing : 0,
      center: [origin.longitude, origin.latitude],
      duration: 900,
      pitch: is3dMode ? cinematicPitch : 0,
      zoom: is3dMode ? cinematicZoom : 13,
    });
  };

  const toggleViewMode = () => {
    const map = mapRef.current;
    const origin = originRef.current;
    const nextIs3dMode = !is3dMode;

    setIs3dMode(nextIs3dMode);

    if (!map || !origin) {
      return;
    }

    if (!nextIs3dMode) {
      last3dCameraRef.current = {
        bearing: map.getBearing(),
        center: map.getCenter(),
        pitch: map.getPitch(),
        zoom: map.getZoom(),
      };
      pauseRotation();
    }

    const last3dCamera = last3dCameraRef.current;
    map.easeTo({
      bearing: nextIs3dMode ? (last3dCamera?.bearing ?? initialBearing) : 0,
      center: nextIs3dMode
        ? (last3dCamera?.center ?? [origin.longitude, origin.latitude])
        : [origin.longitude, origin.latitude],
      duration: 900,
      pitch: nextIs3dMode ? (last3dCamera?.pitch ?? cinematicPitch) : 0,
      zoom: nextIs3dMode ? (last3dCamera?.zoom ?? cinematicZoom) : 13,
    });

    if (nextIs3dMode) {
      map.once("moveend", resumeRotation);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        {points.length > 0 ? (
          <div className="relative overflow-hidden rounded-lg border bg-muted">
            <div
              aria-label={title}
              className="h-[420px] md:h-[520px]"
              ref={containerRef}
              role="img"
            />
            <div className="absolute left-3 top-3 flex max-w-[calc(100%-1.5rem)] flex-wrap gap-2">
              <Button
                className="bg-background/90 shadow-sm backdrop-blur"
                onClick={() => {
                  if (isRotationActive) {
                    pauseRotation();
                  } else {
                    resumeRotation();
                  }
                }}
                size="sm"
                type="button"
                variant="secondary"
              >
                {isRotationActive ? pauseRotationLabel : resumeRotationLabel}
              </Button>
              <Button
                className="bg-background/90 shadow-sm backdrop-blur"
                onClick={resetCamera}
                size="sm"
                type="button"
                variant="secondary"
              >
                {resetCameraLabel}
              </Button>
              <Button
                className="bg-background/90 shadow-sm backdrop-blur"
                onClick={toggleViewMode}
                size="sm"
                type="button"
                variant="secondary"
              >
                {is3dMode ? switchTo2dLabel : switchTo3dLabel}
              </Button>
            </div>
            <div className="absolute bottom-3 left-3 rounded-lg border bg-background/90 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-background bg-primary shadow-[0_0_0_4px_hsl(var(--primary)/0.22)]" />
                  <span>{legendOriginLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-background bg-foreground shadow-[0_0_0_4px_hsl(0_0%_0%/0.12)]" />
                  <span>{legendNearbyLabel}</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/40 px-4 py-10 text-center text-sm text-muted-foreground">
            {emptyState}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function add3dBuildingsLayer(map: maplibregl.Map) {
  const style = map.getStyle();
  const layers = style.layers ?? [];
  const buildingLayer = layers.find((layer) => layer.id.includes("building"));
  const source = buildingLayer && "source" in buildingLayer ? buildingLayer.source : undefined;
  const sourceLayer =
    buildingLayer && "source-layer" in buildingLayer ? buildingLayer["source-layer"] : undefined;

  if (
    !buildingLayer ||
    typeof source !== "string" ||
    !sourceLayer ||
    map.getLayer("culturando-3d-buildings")
  ) {
    return;
  }

  map.addLayer({
    id: "culturando-3d-buildings",
    source,
    "source-layer": sourceLayer,
    type: "fill-extrusion",
    minzoom: 14,
    paint: {
      "fill-extrusion-base": ["coalesce", ["get", "min_height"], 0],
      "fill-extrusion-color": "#d7c7a8",
      "fill-extrusion-height": ["coalesce", ["get", "height"], 18],
      "fill-extrusion-opacity": 0.62,
    },
  });
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
