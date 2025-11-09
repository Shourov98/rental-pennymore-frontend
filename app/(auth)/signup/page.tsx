"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"renter" | "agent">("renter");
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // form submit logic
  };

  return (
    <div className="w-full">
      {/* Toggle Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-[#E6F0FF] p-1 rounded-full flex w-full max-w-[320px] shadow-sm">
          <button
            onClick={() => setActiveTab("renter")}
            className={`flex-1 py-2.5 text-sm sm:text-base font-medium rounded-full transition-all duration-200 ${
              activeTab === "renter"
                ? "bg-action text-white"
                : "bg-transparent text-gray-600"
            }`}
          >
            Renter
          </button>
          <button
            onClick={() => setActiveTab("agent")}
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
        />

        {/* Phone */}
        <InputField
          icon="/icons/lucide/phone.svg"
          label="Phone no."
          placeholder="Phone no"
        />

        {/* Agent-only Fields */}
        {activeTab === "agent" && (
          <>
            <InputField
              icon="/icons/text-number-sign.svg"
              label="License No."
              placeholder="Enter number"
            />
            <InputField
              icon="/icons/user.svg"
              label="Brokerage Name"
              placeholder="Name"
            />
          </>
        )}

        {/* Email */}
        <InputField
          icon="/icons/mail-01.svg"
          label="Email"
          type="email"
          placeholder="Enter email"
        />

        {/* Password */}
        <InputField
          icon="/icons/square-lock-01.svg"
          label="Password"
          type={showPassword ? "text" : "password"}
          placeholder="Enter password"
          rightIcon={showPassword ? "/icons/eye-off.svg" : "/icons/eye.svg"}
          onRightIconClick={() => setShowPassword((prev) => !prev)}
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

        {/* Button */}
        <button
          type="submit"
          disabled={!agree}
          className="
            w-full bg-action hover:bg-action-hover text-text-inverted
            font-semibold py-3 sm:py-3.5 rounded-lg transition
            disabled:opacity-70
          "
        >
          Signup
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
            href="#"
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
}: {
  icon: string;
  rightIcon?: string;
  label: string;
  placeholder: string;
  type?: string;
  onRightIconClick?: () => void;
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
