/**
 * Run with:
 *   npx ts-node scripts/extract-neighborhoods.ts
 * or
 *   pnpm ts-node scripts/extract-neighborhoods.ts
 */

import fs from "fs";
import path from "path";

type Feature = {
  properties?: Record<string, unknown>;
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

const OUTPUT_SECTIONED_TS = path.join(
  process.cwd(),
  "data/neighborhoods.manhattan-brooklyn.ts"
);

const OUTPUT_EXACT_JSON = path.join(
  process.cwd(),
  "data/exact-neighborhoods.json"
);

const TARGET_BOROUGHS = ["Manhattan", "Brooklyn"];

// ---- SCRIPT ----
function getStringProp(
  props: Record<string, unknown> | undefined,
  keys: string[]
): string | undefined {
  if (!props) return undefined;
  for (const key of keys) {
    const value = props[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function getGeometryCoordinatesLength(geometry?: Feature["geometry"]): number {
  const coords = geometry?.coordinates;
  if (!Array.isArray(coords)) return 0;
  return coords.length;
}

function extractNeighborhoods(
  geojson: FeatureCollection
): Record<string, Array<{ code: string | null; name: string }>> {
  const acc = {} as Record<string, Array<{ code: string | null; name: string }>>;
  const seenByBorough = new Map<string, Set<string>>();

  geojson.features.forEach((feature) => {
    const borough = getStringProp(feature.properties, [
      "Borough",
      "borough",
      "boroname",
      "boroName",
      "BoroName",
    ]);
    const neighborhood = getStringProp(feature.properties, [
      "Neighborhood",
      "neighborhood",
      "ntaname",
      "ntaName",
      "NTAName",
    ]);
    const code =
      (feature.properties?.["nta2020"] as string | undefined) ??
      (feature.properties?.["NTACode"] as string | undefined) ??
      null;

    if (!borough || !neighborhood) return;
    if (!TARGET_BOROUGHS.includes(borough)) return;

    if (!acc[borough]) acc[borough] = [];
    if (!seenByBorough.has(borough)) {
      seenByBorough.set(borough, new Set<string>());
    }

    const key = `${code ?? ""}|${neighborhood}`;
    const seen = seenByBorough.get(borough)!;
    if (seen.has(key)) return;
    seen.add(key);

    acc[borough].push({ code, name: neighborhood });
  });

  return acc;
}

function extractExactNeighborhoods(geojson: FeatureCollection): Array<{
  ntaCode: string | null;
  ntaName: string;
  boroName: string;
  geometry: Feature["geometry"];
}> {
  const acc: Array<{
    ntaCode: string | null;
    ntaName: string;
    boroName: string;
    geometry: Feature["geometry"];
  }> = [];
  const seen = new Set<string>();

  geojson.features.forEach((feature) => {
    const boroName = getStringProp(feature.properties, [
      "Borough",
      "borough",
      "boroname",
      "boroName",
      "BoroName",
    ]);
    const ntaName = getStringProp(feature.properties, [
      "Neighborhood",
      "neighborhood",
      "ntaname",
      "ntaName",
      "NTAName",
    ]);
    const ntaCode =
      (feature.properties?.["nta2020"] as string | undefined) ??
      (feature.properties?.["NTACode"] as string | undefined) ??
      null;

    if (!boroName || !ntaName) return;
    if (!TARGET_BOROUGHS.includes(boroName)) return;
    if (!feature.geometry) return;
    if (getGeometryCoordinatesLength(feature.geometry) === 0) return;

    const key = `${boroName}|${ntaName}`;
    if (seen.has(key)) return;
    seen.add(key);

    acc.push({
      ntaCode,
      ntaName,
      boroName,
      geometry: feature.geometry,
    });
  });

  return acc;
}

type NeighborhoodItem = {
  key: string;
  label: string;
};

type NeighborhoodSection = {
  title: string;
  items: NeighborhoodItem[];
};

type BoroughNeighborhood = {
  title: string;
  sections: NeighborhoodSection[];
};

type BoroughNeighborhoods = {
  Manhattan: BoroughNeighborhood;
  Brooklyn: BoroughNeighborhood;
};

function extractNeighborhoodSections(
  geojson: FeatureCollection
): BoroughNeighborhoods {
  const namesByBorough: Record<string, Set<string>> = {
    Manhattan: new Set<string>(),
    Brooklyn: new Set<string>(),
  };

  geojson.features.forEach((feature) => {
    const borough = getStringProp(feature.properties, [
      "Borough",
      "borough",
      "boroname",
      "boroName",
      "BoroName",
    ]);
    const neighborhood = getStringProp(feature.properties, [
      "Neighborhood",
      "neighborhood",
      "ntaname",
      "ntaName",
      "NTAName",
    ]);

    if (!borough || !neighborhood) return;
    if (!TARGET_BOROUGHS.includes(borough)) return;

    namesByBorough[borough].add(neighborhood);
  });

  const buildSection = (borough: "Manhattan" | "Brooklyn"): BoroughNeighborhood => {
    const items = Array.from(namesByBorough[borough])
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ key: name, label: name }));

    return {
      title: `Neighborhoods in ${borough}`,
      sections: [
        {
          title: "All Neighborhoods",
          items,
        },
      ],
    };
  };

  return {
    Manhattan: buildSection("Manhattan"),
    Brooklyn: buildSection("Brooklyn"),
  };
}

// ---- RUN ----
const raw = fs.readFileSync(INPUT_FILE, "utf-8");
const geojson: FeatureCollection = JSON.parse(raw);

const result = extractNeighborhoods(geojson);
const exactNeighborhoods = extractExactNeighborhoods(geojson);
const sectionedNeighborhoods = extractNeighborhoodSections(geojson);

// Write JSON
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 2), "utf-8");

// Write Exact JSON
fs.writeFileSync(
  OUTPUT_EXACT_JSON,
  JSON.stringify(exactNeighborhoods, null, 2),
  "utf-8"
);

// Write TS (sectioned)
const sectionedTsContent = `
/* =========================
   TYPES (same file)
========================= */

export type NeighborhoodItem = {
  key: string;
  label: string;
};

export type NeighborhoodSection = {
  title: string;
  items: NeighborhoodItem[];
};

export type BoroughNeighborhood = {
  title: string;
  sections: NeighborhoodSection[];
};

export type BoroughNeighborhoods = {
  Manhattan: BoroughNeighborhood;
  Brooklyn: BoroughNeighborhood;
};

/* =========================
    DATA (keys === labels)
========================= */

const boroughNeighborhoods: BoroughNeighborhoods = ${JSON.stringify(
  sectionedNeighborhoods,
  null,
  2
)} as const;

export default boroughNeighborhoods;
`;

fs.writeFileSync(OUTPUT_SECTIONED_TS, sectionedTsContent.trimStart(), "utf-8");

console.log("✅ Neighborhood files generated:");
console.log(" →", OUTPUT_JSON);
console.log(" →", OUTPUT_SECTIONED_TS);
console.log(" →", OUTPUT_EXACT_JSON);
