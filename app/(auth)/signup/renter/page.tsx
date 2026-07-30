import type { Metadata } from "next";
import { Suspense } from "react";
import SignupForm from "../SignupForm";

export const metadata: Metadata = {
  title: "Sign up | BeforeListed",
  description: "Have your agent find upcoming rentals before they list",
  openGraph: {
    title: "BeforeListed",
    description: "Have your agent find upcoming rentals before they list",
  },
  twitter: {
    title: "BeforeListed",
    description: "Have your agent find upcoming rentals before they list",
  },
};

export default function RenterSignupPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SignupForm role="renter" />
    </Suspense>
  );
}
