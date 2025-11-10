"use client";

import { useRouter } from "next/navigation";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SuccessModal({ isOpen, onClose }: SuccessModalProps) {
  const router = useRouter();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] sm:w-[420px] max-w-md p-8 text-center animate-fadeIn">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">We are on it</h2>
        <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-6">
          Thank you for submitting your search preferences. Our team is now
          reviewing your request and will connect with you through the email
          address you’ve provided. Keep an eye on your inbox — you’ll receive
          updates and matching listings as soon as they become available.
        </p>

        <button
          onClick={() => {
            onClose();
            router.push("/");
          }}
          className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 hover:bg-blue-700 transition"
        >
          Go to Homepage
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
