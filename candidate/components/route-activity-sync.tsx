"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { beginRouteTransition, endRouteTransition } from "@/lib/route-activity";

const isSameOriginNavigation = (anchor: HTMLAnchorElement) => {
  const href = anchor.getAttribute("href");
  if (!href) return false;
  if (href.startsWith("#")) return false;
  if (href.startsWith("mailto:") || href.startsWith("tel:")) return false;
  if (anchor.hasAttribute("download")) return false;
  if (anchor.target && anchor.target !== "_self") return false;

  try {
    const nextUrl = new URL(href, window.location.href);
    if (nextUrl.origin !== window.location.origin) return false;

    return nextUrl.pathname !== window.location.pathname;
  } catch {
    return false;
  }
};

export function RouteActivitySync() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    endRouteTransition();
  }, [pathname]);

  useEffect(() => {
    const onDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      if (event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as Element | null;
      const anchor = target?.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (!isSameOriginNavigation(anchor)) return;

      beginRouteTransition();
    };

    document.addEventListener("click", onDocumentClick, true);
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, []);

  useEffect(() => {
    const onPopState = () => {
      beginRouteTransition();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return null;
}
