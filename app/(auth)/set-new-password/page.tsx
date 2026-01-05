"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function SetNewPasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Password Updated:", form);
    // Perform password update logic here (API call, etc.)
    router.push("/signin");
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="w-full flex mb-5 justify-center">
        <Link href="/">
          <Image
            className="w-[120px] md:w-[150px] lg:w-[180px] h-auto"
            src="/Logo_1.svg"
            alt="Logo"
            width={180}
            height={150}
          />
        </Link>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Set new password
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        Set a new password and continue your journey
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          placeholder="Enter password"
          value={form.currentPassword}
          onChange={(v) => setForm((p) => ({ ...p, currentPassword: v }))}
          visible={showPassword.current}
          onToggle={() =>
            setShowPassword((p) => ({ ...p, current: !p.current }))
          }
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          placeholder="Enter password"
          value={form.newPassword}
          onChange={(v) => setForm((p) => ({ ...p, newPassword: v }))}
          visible={showPassword.new}
          onToggle={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm Password"
          placeholder="Retype password"
          value={form.confirmPassword}
          onChange={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
          visible={showPassword.confirm}
          onToggle={() =>
            setShowPassword((p) => ({ ...p, confirm: !p.confirm }))
          }
        />

        {/* Submit Button */}
        <button
          type="submit"
          className="
            w-full bg-action hover:bg-action-hover
            text-text-inverted font-semibold
            py-3 sm:py-3.5 rounded-lg transition
          "
        >
          Next
        </button>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 text-sm sm:text-base mt-1">
          <p className="text-text-tertiary">
            Don’t receive OTP?{" "}
            <button
              type="button"
              className="text-action hover:text-action-hover font-semibold"
            >
              Resend again
            </button>
          </p>

          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="flex items-center gap-2 text-text-tertiary hover:text-action transition"
          >
            <Image
              src="/icons/arrow-left-01.svg"
              alt="Back icon"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────────
   Reusable Password Input Field
─────────────────────────────── */
function PasswordInput({
  label,
  placeholder,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (val: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-text-tertiary mb-2">
        {label}
      </label>
      <div className="flex items-center bg-surface-secondary border border-border-secondary rounded-xl px-4 py-3 sm:py-3.5">
        <Image
          src="/icons/square-lock-01.svg"
          alt="lock"
          width={20}
          height={20}
          className="w-5 h-5 mr-2"
        />
        <input
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="flex-1 bg-transparent focus:outline-none text-text-secondary text-sm sm:text-base"
        />
        <Image
          src={visible ? "/icons/view-close.svg" : "/icons/view.svg"}
          alt="toggle visibility"
          width={20}
          height={20}
          onClick={onToggle}
          className="w-5 h-5 opacity-70 cursor-pointer ml-2 hover:opacity-100 transition"
        />
      </div>
    </div>
  );
}
