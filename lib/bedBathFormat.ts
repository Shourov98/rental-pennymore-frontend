type RoomValue = {
  value: number;
  raw: string;
};

const parseRoomValue = (value: string): RoomValue | null => {
  const raw = value.trim();
  if (!raw) return null;

  if (/studio/i.test(raw)) {
    return { value: 0, raw };
  }

  const match = raw.match(/\d+(?:\.\d+)?/);
  if (!match) return null;

  return { value: Number(match[0]), raw };
};

const formatNumber = (value: number) =>
  Number.isInteger(value) ? String(value) : String(value).replace(/\.0$/, "");

const getMinMax = (values?: string[]) => {
  const parsed = (values ?? [])
    .map(parseRoomValue)
    .filter((item): item is RoomValue => Boolean(item));

  if (!parsed.length) return null;

  const sorted = Array.from(new Set(parsed.map((item) => item.value))).sort(
    (a, b) => a - b,
  );

  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
};

export const formatBedroomRange = (bedrooms?: string[]) => {
  const range = getMinMax(bedrooms);
  if (!range) return "Not specified";

  if (range.min === range.max) {
    return range.min === 0 ? "Studio" : `${formatNumber(range.min)}BR`;
  }

  if (range.min === 0) {
    return `Studio-${formatNumber(range.max)}BR`;
  }

  return `${formatNumber(range.min)}-${formatNumber(range.max)}BR`;
};

export const formatBathroomRange = (bathrooms?: string[]) => {
  const range = getMinMax(bathrooms);
  if (!range) return "Not specified";

  if (range.min === range.max) {
    return `${formatNumber(range.min)}BA`;
  }

  return `${formatNumber(range.min)}-${formatNumber(range.max)}BA`;
};

export const formatBedsBathsRange = (
  bedrooms?: string[],
  bathrooms?: string[],
) => `${formatBedroomRange(bedrooms)} / ${formatBathroomRange(bathrooms)}`;
