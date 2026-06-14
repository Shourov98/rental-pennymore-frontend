// store/slices/preferenceSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const defaultPreferencesList = [
  "Lots of Storage",
  "Gym in Building",
  "Open Views",
  "Open Kitchen",
  "If Walk-Up Below 3rd Floor",
  "Lots of Light",
  "Large Apartment",
  "New Renovation",
  "High Ceilings",
  "Not Ground Floor",
];

export interface LocationEntry {
  borough: "Manhattan" | "Brooklyn";
  neighborhoods: string[];
}

export interface PreferencesState {
  movingDate: {
    earliest: string;
    latest: string;
  };

  priceRange: {
    min: number;
    max: number;
  };

  locations: LocationEntry[];
  bedrooms: string[];
  bathrooms: string[];
  unitFeatures: string[];
  buildingFeatures: string[];
  petPolicy: string[];
  guarantor: string[];
  preferences: string[]; // Drag list
}

const createInitialState = (): PreferencesState => ({
  movingDate: {
    earliest: "",
    latest: "",
  },

  priceRange: {
    min: 0,
    max: 0,
  },

  locations: [],
  bedrooms: [],
  bathrooms: [],
  unitFeatures: [],
  buildingFeatures: [],
  petPolicy: [],
  guarantor: [],

  preferences: [...defaultPreferencesList],
});

const initialState: PreferencesState = createInitialState();

export const preferenceSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // ===============================
    // BASIC FIELDS
    // ===============================

    setMovingDate(
      state,
      action: PayloadAction<{ earliest: string; latest: string }>,
    ) {
      state.movingDate = action.payload;
    },

    setPriceRange(state, action: PayloadAction<{ min: number; max: number }>) {
      state.priceRange = action.payload;
    },

    // ===============================
    // LOCATION SELECTOR
    // ===============================
    setLocations(state, action: PayloadAction<LocationEntry[]>) {
      state.locations = action.payload;
    },

    addNeighborhood(
      state,
      action: PayloadAction<{ borough: string; neighborhood: string }>,
    ) {
      const { borough, neighborhood } = action.payload;

      const entry = state.locations.find((loc) => loc.borough === borough);

      if (!entry) {
        state.locations.push({
          borough: borough as "Manhattan" | "Brooklyn",
          neighborhoods: [neighborhood],
        });
      } else if (!entry.neighborhoods.includes(neighborhood)) {
        entry.neighborhoods.push(neighborhood);
      }
    },

    removeNeighborhood(
      state,
      action: PayloadAction<{ borough: string; neighborhood: string }>,
    ) {
      const { borough, neighborhood } = action.payload;

      const entry = state.locations.find((loc) => loc.borough === borough);
      if (!entry) return;

      entry.neighborhoods = entry.neighborhoods.filter(
        (n) => n !== neighborhood,
      );

      if (entry.neighborhoods.length === 0) {
        state.locations = state.locations.filter(
          (loc) => loc.borough !== borough,
        );
      }
    },

    // ===============================
    // BED / BATH / FEATURES
    // ===============================

    toggleBedroom(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.bedrooms.includes(value)) {
        state.bedrooms = state.bedrooms.filter((v) => v !== value);
      } else {
        state.bedrooms.push(value);
      }
    },

    toggleBathroom(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.bathrooms.includes(value)) {
        state.bathrooms = state.bathrooms.filter((v) => v !== value);
      } else {
        state.bathrooms.push(value);
      }
    },

    toggleUnitFeature(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.unitFeatures.includes(value)) {
        state.unitFeatures = state.unitFeatures.filter((v) => v !== value);
      } else {
        state.unitFeatures.push(value);
      }
    },

    toggleBuildingFeature(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.buildingFeatures.includes(value)) {
        state.buildingFeatures = state.buildingFeatures.filter(
          (v) => v !== value,
        );
      } else {
        state.buildingFeatures.push(value);
      }
    },

    togglePetPolicy(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.petPolicy.includes(value)) {
        state.petPolicy = state.petPolicy.filter((v) => v !== value);
      } else {
        state.petPolicy.push(value);
      }
    },

    toggleGuarantor(state, action: PayloadAction<string>) {
      const value = action.payload;
      if (state.guarantor.includes(value)) {
        state.guarantor = state.guarantor.filter((v) => v !== value);
      } else {
        state.guarantor.push(value);
      }
    },

    // ===============================
    // DRAG LIST
    // ===============================

    setPreferencesList(state, action: PayloadAction<string[]>) {
      state.preferences =
        action.payload.length > 0
          ? action.payload
          : createInitialState().preferences;
    },

    resetPreferences() {
      return createInitialState();
    },
  },
});

export const {
  setMovingDate,
  setPriceRange,
  setLocations,
  addNeighborhood,
  removeNeighborhood,
  toggleBedroom,
  toggleBathroom,
  toggleUnitFeature,
  toggleBuildingFeature,
  togglePetPolicy,
  toggleGuarantor,
  setPreferencesList,
  resetPreferences,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
