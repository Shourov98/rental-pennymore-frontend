import { Suspense } from "react";
import SignupForm from "../SignupForm";

export default function AgentSignupPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading...</div>}>
      <SignupForm role="agent" />
    </Suspense>
  );
}
