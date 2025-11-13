// Manhattan neighborhood data
import type { LatLngExpression } from "leaflet";

export interface Area {
  name: string;
  coords: LatLngExpression[];
}

export const manhattanAreas: Area[] = [
  {
    name: "Battery Park City",
    coords: [
      [40.7113, -74.017],
      [40.714, -74.017],
      [40.714, -74.014],
      [40.7113, -74.014],
    ],
  },
  {
    name: "Chelsea",
    coords: [
      [40.742, -74.007],
      [40.749, -74.007],
      [40.749, -73.992],
      [40.742, -73.992],
    ],
  },
  {
    name: "West Chelsea",
    coords: [
      [40.746, -74.009],
      [40.75, -74.007],
      [40.75, -74.002],
      [40.746, -74.002],
    ],
  },
  {
    name: "Chinatown",
    coords: [
      [40.713, -73.999],
      [40.717, -73.999],
      [40.717, -73.992],
      [40.713, -73.992],
    ],
  },
  {
    name: "Civic Center",
    coords: [
      [40.713, -74.004],
      [40.716, -74.004],
      [40.716, -73.999],
      [40.713, -73.999],
    ],
  },
  {
    name: "East Village",
    coords: [
      [40.724, -73.99],
      [40.73, -73.99],
      [40.73, -73.975],
      [40.724, -73.975],
    ],
  },
];
