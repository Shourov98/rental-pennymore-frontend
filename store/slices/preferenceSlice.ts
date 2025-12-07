import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface MovingDate {
  earliest: string;
  latest: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface LocationSelection {
  borough: string;
  neighborhoods: string[];
}

interface PreferencesState {
  movingDate: MovingDate;
  priceRange: PriceRange;
  locations: LocationSelection[];
  bedrooms: string[];
  bathrooms: string[];
  unitFeatures: string[];
  buildingFeatures: string[];
  petPolicy: string[];
  guarantor: string[];
  preferences: string[];
}

const initialState: PreferencesState = {
  movingDate: { earliest: "", latest: "" },
  priceRange: { min: 0, max: 0 },
  locations: [],
  bedrooms: [],
  bathrooms: [],
  unitFeatures: [],
  buildingFeatures: [],
  petPolicy: [],
  guarantor: [],
  preferences: [],
};

export const preferenceSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    // ---------------------------
    // LOCATION MANAGEMENT
    // ---------------------------

    setLocations: (state, action: PayloadAction<LocationSelection[]>) => {
      state.locations = action.payload;
    },

    addNeighborhood: (
      state,
      action: PayloadAction<{ borough: string; neighborhood: string }>
    ) => {
      const { borough, neighborhood } = action.payload;

      const entry = state.locations.find((loc) => loc.borough === borough);

      if (!entry) {
        // New borough added for the first time
        state.locations.push({
          borough,
          neighborhoods: [neighborhood],
        });
      } else {
        // Add neighborhood if not existing
        if (!entry.neighborhoods.includes(neighborhood)) {
          entry.neighborhoods.push(neighborhood);
        }
      }
    },

    removeNeighborhood: (
      state,
      action: PayloadAction<{ borough: string; neighborhood: string }>
    ) => {
      const { borough, neighborhood } = action.payload;

      const entry = state.locations.find((loc) => loc.borough === borough);
      if (!entry) return;

      // Remove the neighborhood
      entry.neighborhoods = entry.neighborhoods.filter(
        (n) => n !== neighborhood
      );

      // If no neighborhoods left → remove borough completely
      if (entry.neighborhoods.length === 0) {
        state.locations = state.locations.filter(
          (loc) => loc.borough !== borough
        );
      }
    },

    // ---------------------------
    // MOVING DATE
    // ---------------------------
    setMovingDate: (state, action: PayloadAction<MovingDate>) => {
      state.movingDate = action.payload;
    },

    // ---------------------------
    // PRICE RANGE
    // ---------------------------
    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
      state.priceRange = action.payload;
    },

    // ---------------------------
    // BEDROOMS
    // ---------------------------
    setBedrooms: (state, action: PayloadAction<string[]>) => {
      state.bedrooms = action.payload;
    },

    // ---------------------------
    // BATHROOMS
    // ---------------------------
    setBathrooms: (state, action: PayloadAction<string[]>) => {
      state.bathrooms = action.payload;
    },

    // ---------------------------
    // UNIT FEATURES
    // ---------------------------
    setUnitFeatures: (state, action: PayloadAction<string[]>) => {
      state.unitFeatures = action.payload;
    },

    // ---------------------------
    // BUILDING FEATURES
    // ---------------------------
    setBuildingFeatures: (state, action: PayloadAction<string[]>) => {
      state.buildingFeatures = action.payload;
    },

    // ---------------------------
    // PET POLICY
    // ---------------------------
    setPetPolicy: (state, action: PayloadAction<string[]>) => {
      state.petPolicy = action.payload;
    },

    // ---------------------------
    // GUARANTOR
    // ---------------------------
    setGuarantor: (state, action: PayloadAction<string[]>) => {
      state.guarantor = action.payload;
    },

    // ---------------------------
    // GENERAL PREFERENCES LIST
    // ---------------------------
    setPreferences: (state, action: PayloadAction<string[]>) => {
      state.preferences = action.payload;
    },

    // ---------------------------
    // RESET EVERYTHING
    // ---------------------------
    resetPreferences: () => initialState,
  },
});

export const {
  setLocations,
  addNeighborhood,
  removeNeighborhood,
  setMovingDate,
  setPriceRange,
  setBedrooms,
  setBathrooms,
  setUnitFeatures,
  setBuildingFeatures,
  setPetPolicy,
  setGuarantor,
  setPreferences,
  resetPreferences,
} = preferenceSlice.actions;

export default preferenceSlice.reducer;
