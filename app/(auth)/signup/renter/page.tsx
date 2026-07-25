import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "../SignupForm";

export const metadata: Metadata = {
  title: "Sign up | BeforeListed",
  description: "",
  openGraph: {
    title: "BeforeListed",
    description: "",
  },
  twitter: {
    title: "BeforeListed",
    description: "",
  },
};

export default function RenterSignupPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SignupForm role="renter" />
    </Suspense>
  );
}
