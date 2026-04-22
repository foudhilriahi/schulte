"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { beginRouteTransition } from "@/lib/route-activity";

const shouldTrackPathChange = (href: string) => {
  if (typeof window === "undefined") return true;

  try {
    const nextUrl = new URL(href, window.location.href);
    return (
      nextUrl.origin === window.location.origin &&
      nextUrl.pathname !== window.location.pathname
    );
  } catch {
    return true;
  }
};

export function useRouterWithLoader() {
  const router = useRouter();

  return useMemo(() => {
    const push = (...args: Parameters<typeof router.push>) => {
      if (shouldTrackPathChange(String(args[0]))) {
        beginRouteTransition();
      }
      router.push(...args);
    };

    const replace = (...args: Parameters<typeof router.replace>) => {
      if (shouldTrackPathChange(String(args[0]))) {
        beginRouteTransition();
      }
      router.replace(...args);
    };

    return {
      ...router,
      push,
      replace,
    };
  }, [router]);
}
