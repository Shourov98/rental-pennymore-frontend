"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { API_BASE_URL, apiFetch } from "@/lib/apiClient";

type ApiErrorDetail = {
  field?: string;
  message?: string;
};

type ApiResponsePayload = {
  success?: boolean;
  message?: string;
  errors?: ApiErrorDetail[];
};

const isApiResponsePayload = (value: unknown): value is ApiResponsePayload =>
  typeof value === "object" && value !== null;

const getFieldLabel = (field?: string) => {
  const label = field?.split(".").filter(Boolean).pop() || "Field";

  return label
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^./, (char) => char.toUpperCase());
};

const parseJsonResponse = async (response: Response): Promise<unknown> => {
  const text = await response.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

const getApiMessage = (data: unknown, fallback: string) => {
  if (!isApiResponsePayload(data)) return fallback;

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const validationMessages = data.errors
      .map((error) => {
        const message = error.message?.trim();
        if (!message) return null;

        return `${getFieldLabel(error.field)}: ${message}`;
      })
      .filter((message): message is string => Boolean(message));

    if (validationMessages.length > 0) {
      return validationMessages.join(" ");
    }
  }

  return data.message?.trim() || fallback;
};

export default function ContactSection() {
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatusMessage(null);

    if (!email.trim() || !subject.trim() || !message.trim()) {
      setStatusMessage({
        type: "error",
        message: "Email, subject, and message are required.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await apiFetch(`${API_BASE_URL}/support/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !isApiResponsePayload(data) || !data.success) {
        throw new Error(
          getApiMessage(data, "Message not sent. Please try again."),
        );
      }

      setStatusMessage({
        type: "success",
        message: getApiMessage(data, "Message sent successfully."),
      });
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Message not sent. Please try again.";
      setStatusMessage({ type: "error", message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="md:mx-3 md:my-3 lg:mx-6 lg:my-6">
      <div className="w-full bg-gray-50 rounded-2xl">
        <div className="w-full mx-auto bg-white shadow-sm rounded-2xl p-6 sm:p-10 md:p-12">
          {/* Section Title */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Contact
            </h2>
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

          {/* Layout */}
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
            {/* Left Side — Brand Info */}
            <div className="w-full md:w-1/3 text-center flex flex-col items-center gap-3 justify-center md:text-left">
              {/* Logo */}
              <Link href="/">
                <Image src="/Logo_1.svg" alt="Logo" width={250} height={200} />
              </Link>
            </div>

            {/* Right Side — Form */}
            <form
              className="w-full md:w-2/3 flex flex-col gap-4"
              onSubmit={handleSubmit}
            >
              <input
                type="email"
                placeholder="Enter email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <input
                type="text"
                placeholder="Subject"
                required
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <textarea
                placeholder="Message"
                rows={5}
                required
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-gray-100 border border-gray-200 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              ></textarea>

              {statusMessage && (
                <p
                  className={`text-sm ${
                    statusMessage.type === "error"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {statusMessage.message}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`mt-2 w-fit self-center rounded-lg bg-blue-500 px-6 py-3 font-semibold text-white transition-all duration-200 ease-out md:self-start ${
                  isSubmitting
                    ? "cursor-not-allowed opacity-70"
                    : "cursor-pointer hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
