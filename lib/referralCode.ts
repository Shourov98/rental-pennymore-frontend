const REFERRAL_CODE_STORAGE_KEY = "saved_referral_code";

const normalizeReferralCode = (value: string | null | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const saveReferralCode = (value: string | null | undefined) => {
  if (typeof window === "undefined") return null;
  const normalized = normalizeReferralCode(value);
  if (!normalized) return null;
  window.localStorage.setItem(REFERRAL_CODE_STORAGE_KEY, normalized);
  return normalized;
};

export const getSavedReferralCode = () => {
  if (typeof window === "undefined") return null;
  return normalizeReferralCode(
    window.localStorage.getItem(REFERRAL_CODE_STORAGE_KEY)
  );
};
