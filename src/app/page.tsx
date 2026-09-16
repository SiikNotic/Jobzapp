"use client";

import { useEffect } from "react";

/**
 * Static export has no proxy/middleware, so the locale-detecting redirect
 * that used to run in src/proxy.ts happens here instead, client-side.
 * The relative (no leading slash) target keeps this correct regardless
 * of the basePath the site is served under.
 */
export default function RootPage() {
  useEffect(() => {
    const preferred = navigator.language?.slice(0, 2) === "en" ? "en" : "es";
    window.location.replace(`${preferred}/`);
  }, []);

  return null;
}
