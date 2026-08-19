"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import {
  type CSSProperties,
  type ChangeEvent,
  type KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSelector } from "react-redux";

import type { RootState } from "@/store/store";

export type OpportunityRepresentationType =
  | "owner_representation"
  | "renter_representation";

type OpportunityMessageHistory = {
  ownerRepresentation: string[];
  renterRepresentation: string[];
};

type OpportunityDetailsTextareaProps = {
  representationType: OpportunityRepresentationType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  ariaInvalid?: boolean;
  className?: string;
  style?: CSSProperties;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const EMPTY_HISTORY: OpportunityMessageHistory = {
  ownerRepresentation: [],
  renterRepresentation: [],
};

export default function OpportunityDetailsTextarea({
  representationType,
  value,
  onChange,
  placeholder,
  maxLength = 350,
  rows = 3,
  ariaInvalid = false,
  className = "",
  style,
}: OpportunityDetailsTextareaProps) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [history, setHistory] =
    useState<OpportunityMessageHistory>(EMPTY_HISTORY);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draftsRef = useRef<Record<OpportunityRepresentationType, string>>({
    owner_representation:
      representationType === "owner_representation" ? value : "",
    renter_representation:
      representationType === "renter_representation" ? value : "",
  });

  useEffect(() => {
    if (!accessToken || !API_BASE_URL) return;

    const controller = new AbortController();
    const loadHistory = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/agent/opportunity-message-history`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
            signal: controller.signal,
          },
        );
        const payload = await response
          .json()
          .catch(() => ({}) as { data?: OpportunityMessageHistory });

        if (!response.ok || !payload?.data) return;

        setHistory({
          ownerRepresentation: Array.isArray(
            payload.data.ownerRepresentation,
          )
            ? payload.data.ownerRepresentation.slice(-10)
            : [],
          renterRepresentation: Array.isArray(
            payload.data.renterRepresentation,
          )
            ? payload.data.renterRepresentation.slice(-10)
            : [],
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    };

    void loadHistory();
    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [value]);

  const messages = useMemo(
    () =>
      representationType === "owner_representation"
        ? history.ownerRepresentation
        : history.renterRepresentation,
    [history, representationType],
  );

  const showHistoryMessage = (index: number) => {
    const message = messages[index];
    if (message === undefined) return;
    setHistoryIndex(index);
    onChange(message.slice(0, maxLength));
  };

  const browseOlder = () => {
    if (messages.length === 0) return;

    if (historyIndex === null) {
      draftsRef.current[representationType] = value;
      showHistoryMessage(messages.length - 1);
      return;
    }

    showHistoryMessage(Math.max(0, historyIndex - 1));
  };

  const browseNewer = () => {
    if (historyIndex === null) return;

    if (historyIndex < messages.length - 1) {
      showHistoryMessage(historyIndex + 1);
      return;
    }

    setHistoryIndex(null);
    onChange(draftsRef.current[representationType]);
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = event.target.value.slice(0, maxLength);
    setHistoryIndex(null);
    draftsRef.current[representationType] = nextValue;
    onChange(nextValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || historyIndex === null) {
      return;
    }

    event.preventDefault();
    const selectedMessage = messages[historyIndex]?.slice(0, maxLength) ?? value;
    draftsRef.current[representationType] = selectedMessage;
    setHistoryIndex(null);
    onChange(selectedMessage);

    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      textarea.focus();
      textarea.setSelectionRange(selectedMessage.length, selectedMessage.length);
    });
  };

  const canBrowseOlder = messages.length > 0 && historyIndex !== 0;
  const canBrowseNewer = historyIndex !== null;

  return (
    <div className="flex w-full items-stretch gap-2">
      <div className="flex w-7 shrink-0 flex-col items-center justify-center gap-1">
        <button
          type="button"
          onClick={browseOlder}
          disabled={!canBrowseOlder}
          title="Previous saved message"
          aria-label="Previous saved opportunity message"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={browseNewer}
          disabled={!canBrowseNewer}
          title="Next saved message"
          aria-label="Next saved opportunity message"
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        rows={rows}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        style={style}
        className={`min-w-0 flex-1 ${className}`}
      />
    </div>
  );
}
