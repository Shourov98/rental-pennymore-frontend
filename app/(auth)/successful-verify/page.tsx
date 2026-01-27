import { Suspense } from "react";
import SuccessfulVerifyClient from "./successful-verify-client";

export default function SuccessfulVerifyPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SuccessfulVerifyClient />
    </Suspense>
  );
}
