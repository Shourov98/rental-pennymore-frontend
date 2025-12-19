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

const TARGET_BOROUGHS = ["Manhattan", "Brooklyn"];

// ---- SCRIPT ----
function extractNeighborhoods(
  geojson: FeatureCollection
): Record<string, string[]> {
  return geojson.features.reduce((acc, feature) => {
    const borough = feature.properties?.borough;
    const neighborhood = feature.properties?.neighborhood;

    if (!borough || !neighborhood) return acc;
    if (!TARGET_BOROUGHS.includes(borough)) return acc;

    if (!acc[borough]) acc[borough] = [];
    acc[borough].push(neighborhood);

    // Ensure uniqueness
    acc[borough] = Array.from(new Set(acc[borough]));

    return acc;
  }, {} as Record<string, string[]>);
}

// ---- RUN ----
const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const geojson: FeatureCollection = JSON.parse(raw);

const result = extractNeighborhoods(geojson);

// Write JSON
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), "utf-8");

// Write TS
const tsContent = `
// AUTO-GENERATED FILE – DO NOT EDIT
export const neighborhoods = ${JSON.stringify(result, null, 2)} as const;
`;

fs.writeFileSync(OUTPUT_TS, tsContent.trimStart(), "utf-8");

console.log("✅ Neighborhood files generated:");
console.log(" →", OUTPUT_JSON);
console.log(" →", OUTPUT_TS);
