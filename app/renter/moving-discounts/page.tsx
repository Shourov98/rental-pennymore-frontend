"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { useSelector } from "react-redux";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { CenteredPageSpinner } from "@/components/ui/centered-page-spinner";
import { RootState } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiCategory {
  _id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
}

interface ApiItem {
  _id: string;
  categoryId: string;
  companyName: string;
  discount: string;
  description: string;
  link: string;
  isActive: boolean;
  order: number;
}

interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

interface CategoriesEnvelope {
  categories?: ApiCategory[];
}

interface ItemsEnvelope {
  items?: ApiItem[];
  pagination?: ApiPagination;
}

const ALL_CATEGORIES_ID = "__all__";
const DEFAULT_PAGE_SIZE = 10;

const DISCLAIMER_ALLOWED_TAGS = new Set([
  "b",
  "strong",
  "br",
  "p",
  "div",
]);

const sanitizeDisclaimerHtml = (raw: string): string => {
  if (!raw) return "";
  if (typeof window === "undefined") return raw;

  // Plain text (no HTML tags) — pass through as-is
  if (!/<[a-z][^>]*>/i.test(raw)) {
    return raw;
  }

  let body: HTMLElement | null = null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, "text/html");
    body = (doc.body as HTMLElement) ?? null;
    if (!body || !body.firstChild) {
      return (body?.textContent ?? raw).trim();
    }
  } catch {
    return raw;
  }
  if (!body) return raw;

  const sanitizeNode = (node: Node) => {
    if (node.nodeType === Node.COMMENT_NODE) {
      node.parentNode?.removeChild(node);
      return;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      // Skip the root body element — sanitize its children only
      if (tagName === "body") {
        [...element.childNodes].forEach(sanitizeNode);
        return;
      }

      if (!DISCLAIMER_ALLOWED_TAGS.has(tagName)) {
        const parent = element.parentNode;
        if (parent) {
          while (element.firstChild) {
            parent.insertBefore(element.firstChild, element);
          }
          parent.removeChild(element);
        } else {
          element.remove();
        }
        return;
      }

      [...element.attributes].forEach((attr) =>
        element.removeAttribute(attr.name),
      );
    }
    [...node.childNodes].forEach(sanitizeNode);
  };

  sanitizeNode(body);
  return (body.innerHTML ?? "").replace(/<p>\s*<\/p>/gi, "").replace(/<div>\s*<\/div>/gi, "");
};

interface CategoryChipsProps {
  categories: ApiCategory[];
  selectedCategoryId: string;
  onSelect: (id: string) => void;
}

function CategoryChips({
  categories,
  selectedCategoryId,
  onSelect,
}: CategoryChipsProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollState();
    emblaApi.on("select", updateScrollState);
    emblaApi.on("reInit", updateScrollState);
    emblaApi.on("scroll", updateScrollState);
  }, [emblaApi, updateScrollState]);

  useEffect(() => {
    if (!emblaApi) return;
    // Scroll selected chip into view after data loads
    const selectedIndex = [
      { _id: ALL_CATEGORIES_ID },
      ...categories,
    ].findIndex((c) => c._id === selectedCategoryId);
    if (selectedIndex >= 0) {
      emblaApi.scrollTo(selectedIndex, true);
    }
  }, [emblaApi, selectedCategoryId, categories]);

  const chips: { id: string; label: string }[] = useMemo(
    () => [
      { id: ALL_CATEGORIES_ID, label: "All categories" },
      ...categories.map((c) => ({ id: c._id, label: c.title })),
    ],
    [categories],
  );

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-2 px-1 py-1">
          {chips.map((chip) => {
            const isSelected = selectedCategoryId === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelect(chip.id)}
                className={`flex-[0_0_auto] whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {canScrollPrev ? (
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          aria-label="Scroll categories left"
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-100"
        >
          <ChevronLeft size={16} />
        </button>
      ) : null}

      {canScrollNext ? (
        <button
          type="button"
          onClick={() => emblaApi?.scrollNext()}
          aria-label="Scroll categories right"
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-8 w-8 items-center justify-center rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-100"
        >
          <ChevronRight size={16} />
        </button>
      ) : null}
    </div>
  );
}

export default function RenterMovingDiscountsPage() {
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [items, setItems] = useState<ApiItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [disclaimer, setDisclaimer] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    ALL_CATEGORIES_ID,
  );
  const [page, setPage] = useState(1);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
  const [isDisclaimerLoading, setIsDisclaimerLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedCategory = useMemo(
    () => categories.find((c) => c._id === selectedCategoryId) ?? null,
    [categories, selectedCategoryId],
  );

  const buildHeaders = useCallback((): Record<string, string> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }
    return headers;
  }, [accessToken]);

  // ───────── Load categories on mount ─────────

  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      setIsCategoriesLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${API_BASE_URL}/moving-discounts/categories`,
          {
            method: "GET",
            headers: buildHeaders(),
            signal: controller.signal,
          },
        );

        const data: ApiResponse<CategoriesEnvelope> = await response
          .json()
          .catch(() => ({} as ApiResponse<CategoriesEnvelope>));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load the moving discount categories right now.",
          );
        }

        const list = Array.isArray(data?.data?.categories)
          ? data!.data!.categories!
          : [];
        const activeOnly = list.filter((c) => c.isActive !== false);
        setCategories(activeOnly);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load the moving discount categories right now.";
        setError(message);
        setCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsCategoriesLoading(false);
        }
      }
    };

    loadCategories();
    return () => controller.abort();
  }, [buildHeaders]);

  // ───────── Load disclaimer on mount ─────────

  useEffect(() => {
    const controller = new AbortController();

    const loadDisclaimer = async () => {
      try {
        const url = `${API_BASE_URL}/moving-discounts/settings`;
        const response = await fetch(url, {
          method: "GET",
          headers: buildHeaders(),
          signal: controller.signal,
        });

        if (!response.ok) {
          // Settings are optional; ignore if not yet created
          if (!controller.signal.aborted) {
            setIsDisclaimerLoading(false);
          }
          return;
        }

        const data: ApiResponse<{ disclaimer?: string }> = await response
          .json()
          .catch(() => ({} as ApiResponse<{ disclaimer?: string }>));

        if (!controller.signal.aborted) {
          const value = data?.data?.disclaimer ?? "";
          setDisclaimer(value);
          setIsDisclaimerLoading(false);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        // Surface in console so we can debug, but don't break the page
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.warn("Failed to load moving-discounts disclaimer", err);
        }
        if (!controller.signal.aborted) {
          setIsDisclaimerLoading(false);
        }
      }
    };

    loadDisclaimer();
    return () => controller.abort();
  }, [buildHeaders]);

  // ───────── Load items whenever category or page changes ─────────

  useEffect(() => {
    const controller = new AbortController();

    const loadItems = async () => {
      setIsItemsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(DEFAULT_PAGE_SIZE));
      if (selectedCategoryId !== ALL_CATEGORIES_ID) {
        params.set("categoryId", selectedCategoryId);
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/moving-discounts/items?${params.toString()}`,
          {
            method: "GET",
            headers: buildHeaders(),
            signal: controller.signal,
          },
        );

        const data: ApiResponse<ItemsEnvelope> = await response
          .json()
          .catch(() => ({} as ApiResponse<ItemsEnvelope>));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load the moving discount items right now.",
          );
        }

        const list = Array.isArray(data?.data?.items)
          ? data!.data!.items!
          : [];
        setItems(list);
        setPagination(data?.data?.pagination ?? null);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load the moving discount items right now.";
        setError(message);
        setItems([]);
        setPagination(null);
      } finally {
        if (!controller.signal.aborted) {
          setIsItemsLoading(false);
        }
      }
    };

    loadItems();
    return () => controller.abort();
  }, [buildHeaders, page, selectedCategoryId]);

  const handleCategoryClick = (id: string) => {
    setSelectedCategoryId(id);
    setPage(1);
  };

  const handlePrev = () => {
    if (!pagination) return;
    if (pagination.page > 1) setPage(pagination.page - 1);
  };

  const handleNext = () => {
    if (!pagination) return;
    if (pagination.page < pagination.totalPages) setPage(pagination.page + 1);
  };

  // ───────── render ─────────

  const sanitizedDisclaimer = useMemo(
    () => sanitizeDisclaimerHtml(disclaimer),
    [disclaimer],
  );
  const hasDisclaimer =
    !isDisclaimerLoading && sanitizedDisclaimer.trim().length > 0;

  const totalPages = pagination?.totalPages ?? 0;
  const currentPage = pagination?.page ?? page;
  const showPagination =
    !!pagination && (pagination.totalPages > 1 || pagination.total > 0);

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Moving Discounts
        </h1>
        <p className="text-gray-500 mt-2">
          Discount codes to save on your move, use them anytime
        </p>
      </div>

      {/* Error */}
      {error ? (
        <div className="bg-white rounded-2xl border border-red-200 p-4 text-center">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      ) : null}

      {/* ===== Mobile & tablet categories carousel ===== */}
      <div className="lg:hidden bg-white rounded-2xl border border-gray-200 shadow-sm p-3">
        {isCategoriesLoading ? (
          <p className="text-sm text-gray-500 px-2 py-2">
            Loading categories...
          </p>
        ) : categories.length === 0 ? (
          <p className="text-sm text-gray-500 px-2 py-2">
            No categories available.
          </p>
        ) : (
          <CategoryChips
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelect={handleCategoryClick}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* ===== Desktop categories sidebar ===== */}
        <aside className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm p-4 self-start">
          <h2 className="text-xs font-bold tracking-wider text-gray-500 uppercase mb-3">
            Categories
          </h2>

          {isCategoriesLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : categories.length === 0 ? (
            <p className="text-sm text-gray-500">No categories available.</p>
          ) : (
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => handleCategoryClick(ALL_CATEGORIES_ID)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    selectedCategoryId === ALL_CATEGORIES_ID
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All categories
                </button>
              </li>
              {categories.map((category) => {
                const isSelected = selectedCategoryId === category._id;
                return (
                  <li key={category._id}>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(category._id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {category.title}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* ===== Items table + footer area (table card sits tight against disclaimer/pagination) ===== */}
        <div>
          {/* ===== Items table ===== */}
          <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h2 className="text-sm md:text-base font-bold tracking-wide text-gray-800 uppercase">
                {selectedCategory
                  ? selectedCategory.title
                  : "All categories"}
              </h2>
              {pagination ? (
                <p className="text-xs text-gray-500 mt-1">
                  {pagination.total}{" "}
                  {pagination.total === 1 ? "result" : "results"}
                </p>
              ) : null}
            </div>

            {isItemsLoading ? (
              <div className="px-6 py-12">
                <CenteredPageSpinner />
              </div>
            ) : items.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500 text-sm">
                No items in this category yet.
              </div>
            ) : (
              <>
                {/* Mobile / tablet: card layout */}
                <ul className="lg:hidden divide-y divide-gray-100">
                  {items.map((item) => (
                    <li key={item._id} className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-bold text-gray-900 text-lg">
                          {item.companyName}
                        </h3>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                        >
                          Get Deal
                        </a>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          Discount
                        </p>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {item.discount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                          Description
                        </p>
                        <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* Desktop: table layout */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="min-w-[760px] w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50 text-gray-800">
                        <th className="py-3 px-5 text-left font-semibold whitespace-nowrap">
                          Company name
                        </th>
                        <th className="py-3 px-5 text-left font-semibold">
                          Discount
                        </th>
                        <th className="py-3 px-5 text-left font-semibold">
                          Description
                        </th>
                        <th className="py-3 px-5 text-left font-semibold whitespace-nowrap">
                          Link
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id} className="border-t border-gray-100">
                          <td className="py-4 px-5 font-semibold text-gray-900 align-top whitespace-nowrap">
                            {item.companyName}
                          </td>
                          <td className="py-4 px-5 text-gray-700 align-top">
                            {item.discount}
                          </td>
                          <td className="py-4 px-5 text-gray-600 align-top">
                            {item.description}
                          </td>
                          <td className="py-4 px-5 align-top">
                            <a
                              href={item.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 hover:underline font-semibold"
                            >
                              Get Deal
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          {/* ===== Footer under the table: pagination info + disclaimer (tight, no big gap) ===== */}
          {showPagination || hasDisclaimer ? (
            <div className="mt-3 space-y-2">
              {showPagination ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {items.length}
                    </span>{" "}
                    {items.length === 1 ? "item" : "items"} · Total items{" "}
                    <span className="font-semibold text-gray-700">
                      {pagination!.total}
                    </span>{" "}
                    · Page{" "}
                    <span className="font-semibold text-gray-700">
                      {currentPage}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {totalPages}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentPage <= 1}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={currentPage >= totalPages}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ) : null}

              {hasDisclaimer ? (
                <div className="flex items-start gap-3 px-1">
                  <p className="shrink-0 text-[10px] uppercase tracking-wider text-gray-400 font-semibold pt-0.5">
                    Disclaimer
                  </p>
                  <div
                    className="text-xs text-gray-600 leading-relaxed [&_strong]:font-bold [&_p]:my-0.5"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeDisclaimerHtml(disclaimer),
                    }}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
