/**
 * Run with:
 *   npx ts-node scripts/extract-neighborhoods.ts
 * or
 *   pnpm ts-node scripts/extract-neighborhoods.ts
 */

import fs from "fs";
import path from "path";

type Feature = {
  properties?: {
    neighborhood?: string;
    borough?: string;
    ntaname?: string;
    boroname?: string;
    nta2020?: string;
  };
  geometry?: {
    type?: string;
    coordinates?: unknown;
  };
};

type FeatureCollection = {
  features: Feature[];
};

// ---- CONFIG ----
const INPUT_FILE = path.join(process.cwd(), "data/map.geojson");

const OUTPUT_JSON = path.join(
  process.cwd(),
  "data/neighborhoods.manhattan-brooklyn.json"
);

const OUTPUT_TS = path.join(
  process.cwd(),
  "data/neighborhoods.manhattan-brooklyn.ts"
);

const OUTPUT_EXACT_JSON = path.join(
  process.cwd(),
  "data/exact-neighborhoods.json"
);

const TARGET_BOROUGHS = ["Manhattan", "Brooklyn"];

// ---- SCRIPT ----
function extractNeighborhoods(
  geojson: FeatureCollection
): Record<string, Array<{ code: string | null; name: string }>> {
  return geojson.features.reduce((acc, feature) => {
    const borough =
      feature.properties?.boroname || feature.properties?.borough;
    const neighborhood =
      feature.properties?.ntaname || feature.properties?.neighborhood;
    const code = feature.properties?.nta2020 ?? null;

    if (!borough || !neighborhood) return acc;
    if (!TARGET_BOROUGHS.includes(borough)) return acc;

    if (!acc[borough]) acc[borough] = [];
    acc[borough].push({ code, name: neighborhood });

    // Ensure uniqueness
    const seen = new Set<string>();
    acc[borough] = acc[borough].filter((item) => {
      const key = `${item.code ?? ""}|${item.name}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return acc;
  }, {} as Record<string, Array<{ code: string | null; name: string }>>);
}

function extractExactNeighborhoods(geojson: FeatureCollection): Array<{
  ntaCode: string | null;
  ntaName: string;
  boroName: string;
  geometry: Feature["geometry"];
}> {
  return geojson.features.reduce((acc, feature) => {
    const boroName =
      feature.properties?.boroname || feature.properties?.borough;
    const ntaName =
      feature.properties?.ntaname || feature.properties?.neighborhood;
    const ntaCode = feature.properties?.nta2020 ?? null;

    if (!boroName || !ntaName) return acc;
    if (!TARGET_BOROUGHS.includes(boroName)) return acc;

    acc.push({
      ntaCode,
      ntaName,
      boroName,
      geometry: feature.geometry,
    });

    return acc;
  }, [] as Array<{
    ntaCode: string | null;
    ntaName: string;
    boroName: string;
    geometry: Feature["geometry"];
  }>);
}

// ---- RUN ----
const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const geojson: FeatureCollection = JSON.parse(raw);

const result = extractNeighborhoods(geojson);
const exactNeighborhoods = extractExactNeighborhoods(geojson);

// Write JSON
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), "utf-8");

// Write Exact JSON
fs.writeFileSync(
  OUTPUT_EXACT_JSON,
  JSON.stringify(exactNeighborhoods, null, 2),
  "utf-8"
);

// Write TS
const tsContent = `
// AUTO-GENERATED FILE – DO NOT EDIT
export const neighborhoods = ${JSON.stringify(result, null, 2)} as const;
`;

fs.writeFileSync(OUTPUT_TS, tsContent.trimStart(), "utf-8");

console.log("✅ Neighborhood files generated:");
console.log(" →", OUTPUT_JSON);
console.log(" →", OUTPUT_TS);
console.log(" →", OUTPUT_EXACT_JSON);
