import ntaData from "@/data/exact-neighborhoods.json";
import type {
  Feature,
  Polygon as GeoPolygon,
  MultiPolygon as GeoMultiPolygon,
} from "geojson";

export type LatLngTuple = [number, number];

export interface NeighborhoodFeature {
  name: string;
  boro: "Manhattan" | "Brooklyn";
  geometryType: "Polygon" | "MultiPolygon";
  coords: LatLngTuple[] | LatLngTuple[][];
}

export interface NeighborhoodCollection {
  Manhattan: NeighborhoodFeature[];
  Brooklyn: NeighborhoodFeature[];
}

/**
 * Convert [lng, lat] → [lat, lng]
 */
function convertPolygonCoords(geometry: GeoPolygon): LatLngTuple[] {
  return geometry.coordinates[0].map(
    (pair) => [pair[1], pair[0]] as LatLngTuple
  );
}

/**
 * Convert MultiPolygon → array of polygons
 */
function convertMultiPolygonCoords(geometry: GeoMultiPolygon): LatLngTuple[][] {
  return geometry.coordinates.map((polygon) =>
    polygon[0].map((pair) => [pair[1], pair[0]] as LatLngTuple)
  );
}

export const neighborhoods: NeighborhoodCollection = {
  Manhattan: [],
  Brooklyn: [],
};

// Type for the JSON object you imported
interface NTAJson {
  ntaName: string;
  boroName: string;
  geometry: GeoPolygon | GeoMultiPolygon;
}

// Build dataset
(ntaData as NTAJson[]).forEach((item) => {
  if (item.boroName !== "Manhattan" && item.boroName !== "Brooklyn") return;

  const geometry = item.geometry;

  if (geometry.type === "Polygon") {
    neighborhoods[item.boroName].push({
      name: item.ntaName,
      boro: item.boroName,
      geometryType: "Polygon",
      coords: convertPolygonCoords(geometry),
    });
  }

  if (geometry.type === "MultiPolygon") {
    neighborhoods[item.boroName].push({
      name: item.ntaName,
      boro: item.boroName,
      geometryType: "MultiPolygon",
      coords: convertMultiPolygonCoords(geometry),
    });
  }
});
