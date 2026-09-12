import {
  CalendarDays,
  BedDouble,
  Bath,
  Pencil,
  Trash2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface RequestPauseNotice {
  statusLabel?: string;
  tone?: "paused" | "closed";
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  actionDisabled?: boolean;
  actionLoading?: boolean;
  onAction?: () => void;
}

interface RequestCardProps {
  requestName: string;
  locationEntries?: { borough: string; neighborhoods: string }[];
  dateRange: string;
  priceRange: string;
  bedsLabel: string;
  bathsLabel: string;
  status: "active" | "deactive";
  disableActivate?: boolean;
  pauseNotice?: RequestPauseNotice | null;
  isMutating?: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

export default function RequestCard({
  requestName,
  locationEntries = [],
  dateRange,
  priceRange,
  bedsLabel,
  bathsLabel,
  status,
  pauseNotice = null,
  onEdit,
  onDelete,
}: RequestCardProps) {
  const isActive = status === "active";
  const statusLabel = isActive ? "Active" : "Deactive";
  const statusClasses = pauseNotice
    ? pauseNotice.tone === "closed"
      ? "bg-slate-200 text-slate-800"
      : "bg-amber-100 text-amber-800"
    : isActive
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";
  const noticeClasses =
    pauseNotice?.tone === "closed"
      ? "border-[#7A7A7A] bg-[#EEF1F5]"
      : "border-[#7E7048] bg-[#FFF4C7]";

  return (
    <div className="w-full max-w-[660px] rounded-xl border border-[#E6EBF2] bg-white px-4 py-5 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-[14px] font-semibold text-[#121A2C]">
              {requestName}
            </h3>

            {!pauseNotice ? (
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-medium ${statusClasses}`}
              >
                {statusLabel}
              </span>
            ) : null}
          </div>

          {locationEntries.length > 0 && (
            <div className="mt-1 flex flex-col gap-1.5">
              {locationEntries.map((loc, index) => (
                <div
                  key={`${loc.borough}-${index}`}
                  className="flex flex-col leading-snug"
                >
                  <span className="text-[13px] font-semibold text-[#1A2234]">
                    {loc.borough}
                  </span>
                  <span className="text-[11px] text-[#667085]">
                    {loc.neighborhoods}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-[#7B8598]">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>{dateRange}</span>
          </div>

          <div className="mt-4">
            <p className="text-[11px] text-[#7B8598]">Price Range</p>
            <p className="text-[24px] font-bold leading-none text-[#111B30]">
              {priceRange}
            </p>
          </div>

          <div className="mt-3 flex items-center gap-3 text-[11px] text-[#667085]">
            <div className="flex items-center gap-1">
              <BedDouble className="h-3.5 w-3.5 text-[#7B8598]" />
              <span>{bedsLabel}</span>
            </div>

            <span className="text-[#D0D5DD]">|</span>

            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5 text-[#7B8598]" />
              <span>{bathsLabel}</span>
            </div>
          </div>
        </div>

        {pauseNotice ? (
          <div
            className={`w-full shrink-0 rounded-[4px] border px-4 py-3 md:w-[372px] ${noticeClasses}`}
          >
            <p className="text-center text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-[#353535]">
              {pauseNotice.eyebrow}
            </p>
            <p className="mt-1 text-center text-[12px] font-bold leading-none text-[#232323]">
              {pauseNotice.title}
            </p>
            <p className="mt-3 text-[10px] leading-[1.25] text-[#4B5565]">
              {pauseNotice.description}
            </p>
            {pauseNotice.actionLabel && pauseNotice.actionHref ? (
              <a
                href={pauseNotice.actionHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#D7C685] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#1F2937] transition hover:bg-[#FFFCF0]"
              >
                <ArrowRight className="h-3 w-3 shrink-0" aria-hidden="true" />
                <span>{pauseNotice.actionLabel}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : pauseNotice.actionLabel && pauseNotice.onAction ? (
              <button
                type="button"
                onClick={pauseNotice.onAction}
                disabled={pauseNotice.actionDisabled || pauseNotice.actionLoading}
                className="mt-3 inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#D7C685] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#1F2937] transition hover:bg-[#FFFCF0] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pauseNotice.actionLoading ? (
                  "Please wait..."
                ) : (
                  <>
                    <ArrowRight
                      className="h-3 w-3 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{pauseNotice.actionLabel}</span>
                  </>
                )}
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={onEdit}
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#EEF5FF] text-[11px] font-medium text-[#5A84FF] transition hover:bg-[#DCE9FF]"
          >
            <Pencil size={12} /> Edit
          </button>

          <button
            onClick={onDelete}
            className="flex h-8 w-full cursor-pointer items-center justify-center gap-1.5 rounded-full bg-[#FFF1F0] text-[11px] font-medium text-[#F46F6F] transition hover:bg-[#FFE2E0]"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
