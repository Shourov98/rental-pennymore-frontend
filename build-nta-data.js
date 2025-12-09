/**
 * build-nta-data.js
 *
 * Fetches NTA polygons from ArcGIS, filters for Manhattan & Brooklyn,
 * and outputs a combined JSON with:
 * - ntaCode (if exists), ntaName, boroName
 * - geometry (type + coordinates)
 * - manual mapping placeholder for custom neighborhood names
 */

import fs from "fs/promises";

const API_URL =
  "https://services5.arcgis.com/GfwWNkhOj9bNBqoJ/arcgis/rest/services/NYC_Neighborhood_Tabulation_Areas_2020/FeatureServer/0/query?where=1=1&outFields=*&outSR=4326&f=pgeojson";

async function build() {
  console.log("Fetching NTA data...");
  const resp = await fetch(API_URL);
  if (!resp.ok) {
    throw new Error("Failed to fetch data: " + resp.status);
  }
  const geojson = await resp.json();

  const filtered = geojson.features.filter(
    (f) =>
      f.properties.BoroName === "Manhattan" ||
      f.properties.BoroName === "Brooklyn"
  );

  const output = filtered.map((f) => ({
    ntaCode: f.properties.NTACode || null,
    ntaName: f.properties.NTAName,
    boroName: f.properties.BoroName,
    geometry: {
      type: f.geometry.type,
      coordinates: f.geometry.coordinates,
    },
    // ... rest of your code
  }));

  await fs.writeFile(
    "./nyc-nta-manhattan-brooklyn.json",
    JSON.stringify(output, null, 2),
    "utf-8"
  );
  console.log(
    `✅ Done — wrote ${output.length} NTA features to nyc-nta-manhattan-brooklyn.json`
  );
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
