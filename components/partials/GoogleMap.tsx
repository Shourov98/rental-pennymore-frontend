"use client";

import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

interface GoogleMapProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  className?: string;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 40.7128, // Default to New York City
  lng: -74.006,
};

export default function MapComponent({
  center = defaultCenter,
  zoom = 12,
  className = "",
}: GoogleMapProps) {
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    console.error(
      "Google Maps API key is not set. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables."
    );
    return (
      <div className="bg-gray-100 w-full h-full flex items-center justify-center">
        <p className="text-gray-500">Map cannot be loaded - API key missing</p>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <LoadScript
        googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={zoom}
        >
          <Marker position={center} />
        </GoogleMap>
      </LoadScript>
    </div>
  );
}
