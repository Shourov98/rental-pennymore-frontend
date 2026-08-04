"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

export default function RenterMovingDiscountsPage() {
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [items, setItems] = useState<ApiItem[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    ALL_CATEGORIES_ID,
  );
  const [page, setPage] = useState(1);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isItemsLoading, setIsItemsLoading] = useState(true);
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

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* ===== Categories list ===== */}
        <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 self-start">
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
              <div className="overflow-x-auto">
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

              {showPagination ? (
                <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentPage <= 1}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    Prev
                  </button>
                  <p className="text-sm text-gray-600">
                    Page <span className="font-semibold">{currentPage}</span> of{" "}
                    <span className="font-semibold">{totalPages}</span>
                  </p>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentPage >= totalPages}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
