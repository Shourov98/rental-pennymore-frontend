"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Bell, CreditCard, Handshake, Home, Trash2 } from "lucide-react";
import type { RootState } from "@/store/store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "match"
  | "payment";

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  type?: NotificationType;
  actionUrl?: string;
  isRead?: boolean;
  createdAt?: string;
}

const extractQuotedName = (message: string) => {
  const match = message.match(/"([^"]+)"/);
  return match?.[1];
};

const extractBorough = (message: string) => {
  const match = message.match(/borough:\s*'([^']+)'/i);
  return match?.[1];
};

const formatWithBoldRequestName = (message: string, requestName?: string) => {
  if (!requestName) return message;
  const token = `"${requestName}"`;
  const parts = message.split(token);
  if (parts.length === 1) return message;
  return (
    <>
      {parts.map((part, index) => (
        <span key={`${requestName}-${index}`}>
          {part}
          {index < parts.length - 1 && (
            <span className="font-semibold text-gray-800">{token}</span>
          )}
        </span>
      ))}
    </>
  );
};

const formatNotificationMessage = (notification: NotificationItem) => {
  const message = notification.message || "";
  const requestName = extractQuotedName(message);
  const reasonMatch = message.match(/Reason:\s*(.+)$/i);
  const reason = reasonMatch?.[1]?.trim();
  const messageWithoutReason = reasonMatch
    ? message.replace(reasonMatch[0], "").trim()
    : message;

  if (message.toLowerCase().includes("account has been activated by admin")) {
    return {
      primary: (
        <>
          Your account has been activated by{" "}
          <span className="font-semibold text-gray-800">Admin</span>. You can
          now log in to the system.
        </>
      ),
    };
  }

  if (notification.title?.toLowerCase().includes("new pre-market listing")) {
    const borough = extractBorough(message);
    if (borough) {
      return {
        primary: (
          <>
            A new listing{" "}
            {requestName ? (
              <span className="font-semibold text-gray-800">
                &quot;{requestName}&quot;
              </span>
            ) : (
              "has been posted"
            )}{" "}
            was posted in{" "}
            <span className="font-semibold text-gray-800">{borough}</span>.
          </>
        ),
      };
    }
  }

  return {
    primary: formatWithBoldRequestName(messageWithoutReason, requestName),
    secondary: reason ? (
      <>
        <span className="font-medium text-gray-800">Reason:</span> {reason}
      </>
    ) : null,
  };
};

export default function NotificationsPage() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iconByType = useMemo(
    () => ({
      info: Bell,
      success: Handshake,
      warning: Home,
      error: CreditCard,
      match: Handshake,
      payment: CreditCard,
    }),
    []
  );

  const fetchUnreadCount = useCallback(async () => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      method: "GET",
      headers,
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.success === false) {
      throw new Error(
        data?.message || "We couldn't load your unread notifications."
      );
    }
    setUnreadCount(Number(data?.data?.unreadCount || 0));
  }, [accessToken]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/notifications/user`, {
        method: "GET",
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't load your notifications."
        );
      }
      setNotifications(data?.data?.notifications || []);
      await fetchUnreadCount();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "We couldn't load your notifications.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, fetchUnreadCount]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markNotificationRead = async (notification: NotificationItem) => {
    // if (notification.isRead) {
    //   if (notification.actionUrl) router.push(notification.actionUrl);
    //   return;
    // }

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notification._id}/read`,
        {
          method: "PATCH",
          headers,
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't update the notification."
        );
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id ? { ...item, isRead: true } : item
        )
      );
      setUnreadCount((prev) => Math.max(prev - 1, 0));
      // if (notification.actionUrl) router.push(notification.actionUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't update the notification."
      );
    }
  };

  const markAllRead = async () => {
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(`${API_BASE_URL}/notifications/read-all`, {
        method: "PATCH",
        headers,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't mark notifications as read."
        );
      }

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't mark notifications as read."
      );
    }
  };

  const deleteNotification = async (notification: NotificationItem) => {
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

      const response = await fetch(
        `${API_BASE_URL}/notifications/${notification._id}`,
        {
          method: "DELETE",
          headers,
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data?.success === false) {
        throw new Error(
          data?.message || "We couldn't delete the notification."
        );
      }

      setNotifications((prev) =>
        prev.filter((item) => item._id !== notification._id)
      );
      if (!notification.isRead) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't delete the notification."
      );
    }
  };

  return (
    <section className="w-full min-h-screen bg-[#F8F9FB] px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#0A093D]">
            Notifications
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}
          </p>
        </div>
        <button
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-70"
        >
          Mark all as read
        </button>
      </div>

      {/* Notifications List */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-100 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm divide-y">
        {isLoading ? (
          <div className="px-6 py-8 text-sm text-gray-500">
            Loading notifications...
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = iconByType[notification.type || "info"] || Bell;
            const isUnread = !notification.isRead;
            const timeLabel = notification.createdAt
              ? new Date(notification.createdAt).toLocaleString()
              : "";

            const { primary, secondary } =
              formatNotificationMessage(notification);

            return (
              <div
                key={notification._id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 gap-4 px-6 py-5 transition ${
                  isUnread ? "bg-blue-50/40" : "hover:bg-gray-50"
                }`}
              >
                <button
                  type="button"
                  onClick={() => markNotificationRead(notification)}
                  className="flex flex-1 items-start gap-4 text-left"
                >
                  <div
                    className={`p-3 rounded-full ${
                      isUnread ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isUnread ? "text-blue-600" : "text-gray-500"}
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A093D] mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {primary}
                    </p>
                    {secondary && (
                      <p className="mt-1 text-sm text-gray-600">{secondary}</p>
                    )}
                  </div>
                </button>

                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                  {timeLabel && (
                    <span className="text-xs text-gray-400">{timeLabel}</span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isUnread
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {isUnread ? "New" : "Read"}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteNotification(notification)}
                    className="text-gray-400 hover:text-red-500 transition"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Empty State (optional) */}
      {!isLoading && notifications.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-500">
          <Bell size={36} className="mx-auto mb-3 text-gray-400" />
          <p>No notifications yet.</p>
        </div>
      )}
    </section>
  );
}
