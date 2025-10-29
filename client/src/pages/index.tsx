import React, { lazy } from "react";
import Footer from "@/components/layout/footer";

// Lazily load the heavy index content to reduce the initial route chunk size
const StoriesIndexContent = lazy(() => import("@/components/home/StoriesIndexContent"));

export default function IndexView() {
  return (
    <>
      <StoriesIndexContent />
      <Footer />
    </>
  );
}