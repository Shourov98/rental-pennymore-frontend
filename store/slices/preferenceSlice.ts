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

const preferenceSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    setMovingDate: (state, action: PayloadAction<MovingDate>) => {
      state.movingDate = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<PriceRange>) => {
      state.priceRange = action.payload;
    },
    setLocations: (state, action: PayloadAction<LocationSelection[]>) => {
      state.locations = action.payload;
    },
    setBedrooms: (state, action: PayloadAction<string[]>) => {
      state.bedrooms = action.payload;
    },
    setBathrooms: (state, action: PayloadAction<string[]>) => {
      state.bathrooms = action.payload;
    },
    setUnitFeatures: (state, action: PayloadAction<string[]>) => {
      state.unitFeatures = action.payload;
    },
    setBuildingFeatures: (state, action: PayloadAction<string[]>) => {
      state.buildingFeatures = action.payload;
    },
    setPetPolicy: (state, action: PayloadAction<string[]>) => {
      state.petPolicy = action.payload;
    },
    setGuarantor: (state, action: PayloadAction<string[]>) => {
      state.guarantor = action.payload;
    },
    setPreferences: (state, action: PayloadAction<string[]>) => {
      state.preferences = action.payload;
    },

    // reset to initial
    resetPreferences: () => initialState,
  },
});

export const {
  setMovingDate,
  setPriceRange,
  setLocations,
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
