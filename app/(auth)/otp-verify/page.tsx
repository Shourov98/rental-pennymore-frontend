"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function OtpVerifyPage() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return; // only single digit numbers
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input automatically
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length === 4) {
      // verify code logic here
      console.log("OTP Submitted:", code);
      router.push("/reset-password"); // example next step
    }
  };

  const handleResend = () => {
    console.log("Resend OTP triggered");
    // resend logic here
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <h1 className="text-3xl font-semibold text-center text-black mb-4">
        Logo
      </h1>

      {/* Title */}
      <h2 className="text-2xl font-semibold text-center text-text-primary mb-1">
        Verify Code
      </h2>
      <p className="text-center text-text-secondary mb-6 text-sm sm:text-base">
        We sent an OTP code to your email <br />
        <span className="text-blue-700 font-medium">example@gmail.com</span>.
        Enter the code below to verify within 1 min.
      </p>

      {/* OTP Input Fields */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6"
      >
        <div className="flex justify-center gap-3 sm:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="
                w-12 sm:w-14 h-12 sm:h-14 text-center text-lg sm:text-xl font-semibold
                border border-border-secondary rounded-xl
                bg-surface-secondary focus:outline-none focus:border-blue-500
                text-gray-800
              "
            />
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          onClick={() => router.push("/successful-verify")}
          className="
            w-full bg-action hover:bg-action-hover
            text-text-inverted font-semibold
            py-3 sm:py-3.5 rounded-lg transition
          "
        >
          Next
        </button>

        {/* Resend and Back */}
        <div className="flex flex-col items-center gap-3 text-sm sm:text-base mt-1">
          <p className="text-text-tertiary">
            Don’t receive OTP?{" "}
            <button
              type="button"
              onClick={handleResend}
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
              className="w-4 h-4"
            />
            Back to Login
          </button>
        </div>
      </form>
    </div>
  );
}
