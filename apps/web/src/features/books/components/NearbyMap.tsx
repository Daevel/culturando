"use client";

import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const mapStyleUrl = "https://tiles.openfreemap.org/styles/liberty";
const cinematicPitch = 62;
const cinematicZoom = 16.4;
const initialBearing = -28;
const nearbySourceId = "culturando-nearby-books";
const rotationSpeed = 140;

export type NearbyMapPoint = {
  id: string;
  title: string;
  subtitle: string;
  href?: string;
  latitude: number;
  longitude: number;
  variant: "origin" | "nearby";
};

type NearbyMapProps = {
  title: string;
  description: string;
  detailLabel: string;
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
  detailLabel,
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
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCompactViewport = window.matchMedia("(max-width: 767px)").matches;
    const shouldStartIn3d = !prefersReducedMotion && !isCompactViewport;
    const origin = points.find((point) => point.variant === "origin") ?? points[0];
    // Points are already privacy-safe: callers pass approximate public coordinates only.
    const nearbyPoints = points.filter((point) => point.variant === "nearby");
    originRef.current = origin;
    rotationEnabledRef.current = shouldStartIn3d;
    setIs3dMode(shouldStartIn3d);
    setIsRotationActive(shouldStartIn3d);

    const map = new maplibregl.Map({
      container,
      style: mapStyleUrl,
      center: [origin.longitude, origin.latitude],
      zoom: shouldStartIn3d ? cinematicZoom : 13,
      pitch: shouldStartIn3d ? cinematicPitch : 0,
      bearing: shouldStartIn3d ? initialBearing : 0,
      attributionControl: false,
    });

    if (isCompactViewport) {
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
    }

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

    const originMarkerElement = document.createElement("div");
    originMarkerElement.className =
      "h-7 w-7 rounded-full border-[3px] border-background bg-primary shadow-[0_0_0_8px_hsl(var(--primary)/0.22),0_12px_24px_hsl(0_0%_0%/0.28)]";

    new maplibregl.Marker({ element: originMarkerElement })
      .setLngLat([origin.longitude, origin.latitude])
      .setPopup(new maplibregl.Popup({ offset: 16 }).setHTML(getPopupHtml(origin, detailLabel)))
      .addTo(map);

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
      addNearbyClusterLayers(map, nearbyPoints, detailLabel);
      map.jumpTo({
        bearing: shouldStartIn3d ? initialBearing : 0,
        center: [origin.longitude, origin.latitude],
        pitch: shouldStartIn3d ? cinematicPitch : 0,
        zoom: shouldStartIn3d ? cinematicZoom : 13,
      });

      if (shouldStartIn3d) {
        animationFrameRef.current = requestAnimationFrame(rotateCamera);
      }
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
  }, [detailLabel, points]);

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
      <CardHeader className="px-4 sm:px-6">
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        {points.length > 0 ? (
          <div className="relative overflow-hidden rounded-lg border bg-muted">
            <div
              aria-label={title}
              className="h-[360px] touch-pan-x touch-pan-y sm:h-[420px] md:h-[520px]"
              ref={containerRef}
              role="img"
            />
            <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2 md:inset-x-auto md:bottom-auto md:left-3 md:top-3 md:max-w-[calc(100%-1.5rem)]">
              <Button
                className="flex-1 bg-background/90 shadow-sm backdrop-blur md:flex-none"
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
                className="flex-1 bg-background/90 shadow-sm backdrop-blur md:flex-none"
                onClick={resetCamera}
                size="sm"
                type="button"
                variant="secondary"
              >
                {resetCameraLabel}
              </Button>
              <Button
                className="flex-1 bg-background/90 shadow-sm backdrop-blur md:flex-none"
                onClick={toggleViewMode}
                size="sm"
                type="button"
                variant="secondary"
              >
                {is3dMode ? switchTo2dLabel : switchTo3dLabel}
              </Button>
            </div>
            <div className="absolute left-3 top-3 rounded-lg border bg-background/90 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur md:bottom-3 md:top-auto">
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

function addNearbyClusterLayers(
  map: maplibregl.Map,
  nearbyPoints: NearbyMapPoint[],
  detailLabel: string,
) {
  if (map.getSource(nearbySourceId)) {
    return;
  }

  map.addSource(nearbySourceId, {
    type: "geojson",
    data: toNearbyFeatureCollection(nearbyPoints),
    cluster: true,
    clusterMaxZoom: 13,
    clusterRadius: 48,
  });

  map.addLayer({
    id: "culturando-nearby-clusters",
    type: "circle",
    source: nearbySourceId,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": ["step", ["get", "point_count"], "#1f2937", 10, "#7c2d12", 25, "#581c87"],
      "circle-radius": ["step", ["get", "point_count"], 18, 10, 23, 25, 29],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
  });

  map.addLayer({
    id: "culturando-nearby-cluster-count",
    type: "symbol",
    source: nearbySourceId,
    filter: ["has", "point_count"],
    layout: {
      "text-field": ["get", "point_count_abbreviated"],
      "text-font": ["Noto Sans Regular"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "culturando-nearby-unclustered",
    type: "circle",
    source: nearbySourceId,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": "#111827",
      "circle-radius": 8,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 3,
    },
  });

  map.on("click", "culturando-nearby-clusters", async (event) => {
    const feature = map.queryRenderedFeatures(event.point, {
      layers: ["culturando-nearby-clusters"],
    })[0];
    const clusterId = feature?.properties?.cluster_id;
    const coordinates = getFeatureCoordinates(feature);
    const source = map.getSource(nearbySourceId);

    if (clusterId === undefined || !coordinates || !isGeoJsonSource(source)) {
      return;
    }

    try {
      const zoom = await source.getClusterExpansionZoom(Number(clusterId));
      map.easeTo({
        center: coordinates,
        duration: 700,
        zoom,
      });
    } catch {
      return;
    }
  });

  map.on("click", "culturando-nearby-unclustered", (event) => {
    const feature = event.features?.[0];
    const coordinates = getFeatureCoordinates(feature);
    const href = feature?.properties?.href;
    const title = feature?.properties?.title;
    const subtitle = feature?.properties?.subtitle;

    if (!coordinates || typeof title !== "string" || typeof subtitle !== "string") {
      return;
    }

    new maplibregl.Popup({ offset: 16 })
      .setLngLat(coordinates)
      .setHTML(
        getPopupHtml(
          {
            href: typeof href === "string" ? href : undefined,
            id: String(feature?.properties?.id ?? "nearby-book"),
            latitude: coordinates[1],
            longitude: coordinates[0],
            subtitle,
            title,
            variant: "nearby",
          },
          detailLabel,
        ),
      )
      .addTo(map);
  });

  for (const layerId of ["culturando-nearby-clusters", "culturando-nearby-unclustered"]) {
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  }
}

function toNearbyFeatureCollection(points: NearbyMapPoint[]) {
  return {
    type: "FeatureCollection" as const,
    features: points.map((point) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        href: point.href,
        id: point.id,
        title: point.title,
        subtitle: point.subtitle,
      },
    })),
  };
}

function getFeatureCoordinates(feature: maplibregl.MapGeoJSONFeature | undefined) {
  if (feature?.geometry.type !== "Point") {
    return null;
  }

  const [longitude, latitude] = feature.geometry.coordinates;

  if (typeof longitude !== "number" || typeof latitude !== "number") {
    return null;
  }

  return [longitude, latitude] as [number, number];
}

function isGeoJsonSource(
  source: maplibregl.Source | undefined,
): source is maplibregl.GeoJSONSource {
  return Boolean(source && "getClusterExpansionZoom" in source);
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

function getPopupHtml(point: NearbyMapPoint, detailLabel: string) {
  const detailLink = point.href
    ? `<a href="${escapeHtml(point.href)}" style="display:inline-flex;margin-top:8px;font-weight:600;color:#111827;text-decoration:underline;">${escapeHtml(detailLabel)}</a>`
    : "";

  return `<strong>${escapeHtml(point.title)}</strong><br /><span>${escapeHtml(point.subtitle)}</span>${detailLink}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
