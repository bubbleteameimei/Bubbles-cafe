import React from "react";
import { Spinner } from "./spinner";

export default function RouteLoader({
  label = "Loading",
  minHeight = "50vh",
}: {
  label?: string;
  minHeight?: string;
}) {
  return (
    <div
      className="flex w-full items-center justify-center"
      style={{ minHeight }}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
    >
      <Spinner size="lg" />
    </div>
  );
}