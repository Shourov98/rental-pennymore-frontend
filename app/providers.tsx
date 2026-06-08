"use client";

import { Provider } from "react-redux";
import { installApiFetchPatch } from "@/lib/apiClient";
import { store } from "@/store/store";
import AuthBootstrap from "@/components/AuthBootstrap";

installApiFetchPatch();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthBootstrap />
      {children}
    </Provider>
  );
}
