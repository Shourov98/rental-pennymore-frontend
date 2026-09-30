"use client";

import dynamic from "next/dynamic";

const NeighborhoodModal = dynamic(() => import("./NeighborhoodModal"), {
  ssr: false,
});

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * The request form opens the full map selector directly. The former
 * search-and-list dialog added an unnecessary extra step before renters could
 * choose boroughs and neighborhoods on the map.
 */
export default function LocationModal({ isOpen, onClose }: LocationModalProps) {
  return (
    <NeighborhoodModal
      isOpen={isOpen}
      onClose={onClose}
      selectedBorough=""
    />
  );
}
