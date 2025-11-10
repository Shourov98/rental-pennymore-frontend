"use client";

import { X } from "lucide-react";

interface DeleteConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-[90%] sm:w-[400px] p-6 relative">
        {/* Close */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">
          Delete Account?
        </h2>
        <p className="text-center text-gray-600 text-sm mb-6">
          This action cannot be undone. Your account and all data will be
          permanently deleted.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
