"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://pos-exterior-researchers-vegetarian.trycloudflare.com/api/v1";

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"renter" | "agent">("renter");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    licenseNumber: "",
    brokerageName: "",
    email: "",
    password: "",
  });

  const isAgent = activeTab === "agent";
  const isRenter = activeTab === "renter";
  const isAgentFormIncomplete =
    isAgent &&
    (!formData.fullName ||
      !formData.phoneNumber ||
      !formData.licenseNumber ||
      !formData.brokerageName ||
      !formData.email ||
      !formData.password);
  const isRenterFormIncomplete =
    isRenter &&
    (!formData.fullName ||
      !formData.phoneNumber ||
      !formData.email ||
      !formData.password);
  const isFormIncomplete = isAgent
    ? isAgentFormIncomplete
    : isRenterFormIncomplete;

  const handleTabChange = (tab: "renter" | "agent") => {
    setActiveTab(tab);
    setStatusMessage(null);
    setLoading(false);
  };

  const resendVerification = async (email: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message ||
          "Unable to resend verification. Please try again shortly."
      );
    }
    return data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      setStatusMessage({
        type: "error",
        message: "Please agree to the terms to continue.",
      });
      return;
    }

    const email = formData.email.trim();

    setLoading(true);
    setStatusMessage(null);

    try {
      if (isAgent) {
        const response = await fetch(`${API_BASE_URL}/agent/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fullName: formData.fullName.trim(),
            phoneNumber: formData.phoneNumber.trim(),
            licenseNumber: formData.licenseNumber.trim(),
            brokerageName: formData.brokerageName.trim(),
            email,
            password: formData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data?.success) {
          throw new Error(
            data?.message ||
              "Unable to sign up at the moment. Please try again."
          );
        }

        setStatusMessage({
          type: "success",
          message: data.message || "Agent registered successfully.",
        });
        router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
        return;
      }

      // renter flow
      const response = await fetch(`${API_BASE_URL}/renter/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: formData.password,
          fullName: formData.fullName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(
          data?.message ||
            "Unable to sign up at the moment. Please try again."
        );
      }

      setStatusMessage({
        type: "success",
        message: data.message || "Renter registered successfully.",
      });
      router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to sign up at the moment. Please try again.";

      const normalized = message.toLowerCase();
      const looksLikeExistingEmail =
        isAgent &&
        email &&
        (normalized.includes("already") ||
          normalized.includes("exist") ||
          normalized.includes("registered") ||
          normalized.includes("used") ||
          normalized.includes("taken"));

      if (looksLikeExistingEmail) {
        try {
          const data = await resendVerification(email);
          setStatusMessage({
            type: "success",
            message:
              data?.message ||
              "Verification code has been resent to your email.",
          });
          router.push(`/otp-verify?email=${encodeURIComponent(email)}`);
          return;
        } catch (resendError) {
          const resendMessage =
            resendError instanceof Error
              ? resendError.message
              : "Unable to resend verification. Please try again.";
          setStatusMessage({ type: "error", message: resendMessage });
          return;
        }
      }

      setStatusMessage({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Toggle Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#E6F0FF] p-1 rounded-full flex w-full max-w-[320px] shadow-sm">
          <button
            onClick={() => handleTabChange("renter")}
            className={`flex-1 py-2.5 text-sm sm:text-base font-medium rounded-full transition-all duration-200 ${
              activeTab === "renter"
                ? "bg-action text-white"
                : "bg-transparent text-gray-600"
            }`}
          >
            Renter
          </button>
          <button
            onClick={() => handleTabChange("agent")}
            className={`flex-1 py-2.5 text-sm sm:text-base font-medium rounded-full transition-all duration-200 ${
              activeTab === "agent"
                ? "bg-action text-white"
                : "bg-transparent text-gray-600"
            }`}
          >
            Agent
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Create an Account
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        One sign-up, seamless connection whether you’re a customer or an agent.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        {/* Full Name */}
        <InputField
          icon="/icons/user.svg"
          label="Full Name"
          placeholder="Name"
          value={formData.fullName}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, fullName: value }))
          }
        />

        {/* Phone */}
        <InputField
          icon="/icons/lucide/phone.svg"
          label="Phone no."
          placeholder="Phone no"
          value={formData.phoneNumber}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, phoneNumber: value }))
          }
        />

        {/* Agent-only Fields */}
        {activeTab === "agent" && (
          <>
            <InputField
              icon="/icons/text-number-sign.svg"
              label="License No."
              placeholder="Enter number"
              value={formData.licenseNumber}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, licenseNumber: value }))
              }
            />
            <InputField
              icon="/icons/user.svg"
              label="Brokerage Name"
              placeholder="Name"
              value={formData.brokerageName}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, brokerageName: value }))
              }
            />
          </>
        )}

        {/* Email */}
        <InputField
          icon="/icons/mail-01.svg"
          label="Email"
          type="email"
          placeholder="Enter email"
          value={formData.email}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, email: value }))
          }
        />

        {/* Password */}
        <InputField
          icon="/icons/square-lock-01.svg"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          rightIcon={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
          onRightIconClick={() => setShowPassword((prev) => !prev)}
          value={formData.password}
          onChange={(value) =>
            setFormData((prev) => ({ ...prev, password: value }))
          }
        />

        {/* Terms */}
        <div className="flex items-start gap-3 mt-2">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="w-5 h-5 accent-action cursor-pointer mt-[2px]"
          />
          <label className="text-sm sm:text-base text-text-secondary">
            I agree to the{" "}
            <a
              href="#"
              className="text-action hover:text-action-hover font-semibold"
            >
              terms and conditions
            </a>
          </label>
        </div>

        {statusMessage && (
          <div
            className={`text-sm sm:text-base ${
              statusMessage.type === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {statusMessage.message}
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={!agree || loading || isFormIncomplete}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            font-semibold py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-20
          "
        >
          {loading ? "Signing up..." : "Signup"}
        </button>

        {/* Footer */}
        <div className="text-center text-sm sm:text-base mt-2">
          <p className="text-text-tertiary">
            Already have an account?{" "}
            <a
              href="/signin"
              className="text-action hover:text-action-hover font-semibold"
            >
              Login
            </a>
          </p>
          <a
            href="/terms-conditions"
            className="text-action hover:text-action-hover text-sm mt-2 inline-block"
          >
            Terms & Conditions
          </a>
        </div>
      </form>
    </div>
  );
}

/* ─────────────── InputField ─────────────── */
function InputField({
  icon,
  rightIcon,
  label,
  placeholder,
  type = "text",
  onRightIconClick,
  value,
  onChange,
}: {
  icon: string;
  rightIcon?: string;
  label: string;
  placeholder: string;
  type?: string;
  onRightIconClick?: () => void;
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="flex items-center justify-between bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
        <div className="flex items-center flex-1">
          <Image
            src={icon}
            alt={`${label} icon`}
            width={20}
            height={20}
            className="w-5 h-5 text-action mr-2"
          />
          <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
          />
        </div>
        {rightIcon && (
          <Image
            src={rightIcon}
            alt="toggle visibility"
            width={20}
            height={20}
            onClick={onRightIconClick}
            className="w-5 h-5 opacity-70 cursor-pointer ml-2 hover:opacity-100 transition"
          />
        )}
      </div>
    </div>
  );
}
