import { Spinner } from "@/components/ui/spinner";

export function CenteredPageSpinner() {
  return (
    <div className="flex min-h-[calc(100vh-11rem)] items-center justify-center">
      <Spinner className="size-10 text-blue-600" />
    </div>
  );
}
