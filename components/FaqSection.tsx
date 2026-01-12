"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Minus, CircleHelp } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

interface ApiFaqItem {
  question?: string;
  answer?: string;
  isActive?: boolean;
}

interface ApiFaqResponse {
  success?: boolean;
  message?: string;
  data?: ApiFaqItem[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const faqs: FaqItem[] = [
  {
    question: "FARE Act Compliance?",
    answer:
      "Yes. Our platform complies fully with the FARE Act by ensuring transparency and adherence to fair housing regulations when connecting renters with licensed agents.",
  },
  {
    question:
      "Why do agents ask to be hired before showing pre-market apartments?",
    answer:
      "Agents must have an exclusive agreement to ensure they can legally represent you and provide access to pre-market listings that aren’t publicly available yet.",
  },
  {
    question:
      "Do I only owe a fee if I rented a unit the agent introduced or showed?",
    answer:
      "Yes. You only pay the agent’s fee if you sign a lease for a property that the agent introduced, arranged a viewing for, or represented you in negotiations for.",
  },
  {
    question: "How do I know the apartment is truly pre-market?",
    answer:
      "All listings shared through our network are verified as pre-market by our licensed agents before they are published on any public listing platform.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqItems, setFaqItems] = useState<FaqItem[]>(faqs);

  useEffect(() => {
    const controller = new AbortController();

    const loadFaqs = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/faq`, {
          method: "GET",
          signal: controller.signal,
        });
        const data: ApiFaqResponse = await response
          .json()
          .catch(() => ({} as ApiFaqResponse));

        if (!response.ok || data?.success === false) {
          return;
        }

        const items =
          data.data
            ?.filter((item) => item?.isActive !== false)
            .map((item) => ({
              question: item?.question?.trim() || "Question",
              answer: item?.answer?.trim() || "Answer",
            })) || [];

        if (items.length > 0) {
          setFaqItems(items);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
      }
    };

    loadFaqs();

    return () => controller.abort();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="md:mx-3 md:mt-3 lg:mx-6 lg:mt-6">
      <div className="w-full bg-white py-10 px-4 rounded-2xl sm:px-8 md:px-12">
        {/* Title */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">FAQ</h2>
          <div className="flex justify-center mt-2">
            <Image
              src="/title_bottom.svg"
              alt="Underline"
              width={120}
              height={12}
              className="w-28 md:w-32"
            />
          </div>
        </div>

        {/* FAQ List */}
        <div className="w-full mx-auto space-y-3">
          {faqItems.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-300 rounded-lg overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center text-left px-5 py-4 text-gray-900 font-medium hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <CircleHelp className="w-5 h-5 text-gray-800" />
                  <span className="font-semibold">{faq.question}</span>
                </div>
                {openIndex === index ? (
                  <Minus className="text-gray-700 w-5 h-5" />
                ) : (
                  <Plus className="text-gray-700 w-5 h-5" />
                )}
              </button>

              {/* Animated answer section */}
              <div
                className={`px-5 pb-4 text-gray-700 text-sm md:text-base leading-relaxed transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-40 opacity-100"
                    : "max-h-0 opacity-0 overflow-hidden"
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
