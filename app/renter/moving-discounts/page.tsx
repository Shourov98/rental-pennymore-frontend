"use client";

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { CenteredPageSpinner } from "@/components/ui/centered-page-spinner";
import { RootState } from "@/store/store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ApiItem {
  _id: string;
  companyName: string;
  discount: string;
  description: string;
  link: string;
  isActive: boolean;
  order: number;
}

interface ApiCategory {
  _id: string;
  title: string;
  slug: string;
  order: number;
  isActive: boolean;
  items?: ApiItem[];
}

interface ApiResponse {
  success?: boolean;
  message?: string;
  data?: {
    categories?: ApiCategory[];
  };
}

export default function RenterMovingDiscountsPage() {
  const accessToken = useSelector(
    (state: RootState) => state.auth.accessToken,
  );

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDiscounts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }

        const response = await fetch(
          `${API_BASE_URL}/moving-discounts`,
          {
            method: "GET",
            headers,
            signal: controller.signal,
          },
        );

        const data: ApiResponse = await response
          .json()
          .catch(() => ({} as ApiResponse));

        if (!response.ok || data?.success === false) {
          throw new Error(
            data?.message ||
              "We couldn't load the moving discounts right now. Please try again.",
          );
        }

        const list = Array.isArray(data?.data?.categories)
          ? data!.data!.categories!
          : [];
        setCategories(list);
      } catch (err) {
        if (controller.signal.aborted) return;
        const message =
          err instanceof Error
            ? err.message
            : "We couldn't load the moving discounts right now. Please try again.";
        setError(message);
        setCategories([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchDiscounts();

    return () => controller.abort();
  }, [accessToken]);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Moving Discounts
        </h1>
        <p className="text-gray-500 mt-2">
          Discount codes to save on your move, use them anytime
        </p>
      </div>

      {/* Loading */}
      {isLoading ? (
        <CenteredPageSpinner />
      ) : error ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-gray-500">
            No moving discounts available yet. Please check back later.
          </p>
        </div>
      ) : (
        categories.map((category) => {
          const items = Array.isArray(category.items)
            ? category.items
            : [];
          return (
            <section
              key={category._id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-sm md:text-base font-bold tracking-wide text-gray-800 uppercase">
                  {category.title}
                </h2>
              </div>

              {items.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500 text-sm">
                  No items in this category yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[920px] w-full text-sm">
                    <thead>
                      <tr className="bg-blue-50 text-gray-800">
                        <th className="py-3 px-5 text-left font-semibold">
                          Company name
                        </th>
                        <th className="py-3 px-5 text-left font-semibold">
                          Discount
                        </th>
                        <th className="py-3 px-5 text-left font-semibold">
                          Description
                        </th>
                        <th className="py-3 px-5 text-left font-semibold">
                          Link
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr
                          key={item._id}
                          className="border-t border-gray-100"
                        >
                          <td className="py-4 px-5 font-semibold text-gray-900 align-top">
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
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
