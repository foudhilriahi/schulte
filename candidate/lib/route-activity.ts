import { useNetworkActivityStore } from "@/store/network-activity";

const ROUTE_ACTIVITY_TIMEOUT_MS = 12000;

let pendingRouteTransitions = 0;
let fallbackTimer: number | null = null;

const clearFallbackTimer = () => {
  if (fallbackTimer !== null && typeof window !== "undefined") {
    window.clearTimeout(fallbackTimer);
    fallbackTimer = null;
  }
};

const scheduleFallbackReset = () => {
  if (typeof window === "undefined") return;
  clearFallbackTimer();

  fallbackTimer = window.setTimeout(() => {
    if (pendingRouteTransitions <= 0) return;
    const transitionsToClear = pendingRouteTransitions;
    pendingRouteTransitions = 0;

    const { end } = useNetworkActivityStore.getState();
    for (let i = 0; i < transitionsToClear; i += 1) {
      end();
    }
  }, ROUTE_ACTIVITY_TIMEOUT_MS);
};

export const beginRouteTransition = () => {
  pendingRouteTransitions += 1;
  useNetworkActivityStore.getState().begin();
  scheduleFallbackReset();
};

export const endRouteTransition = () => {
  if (pendingRouteTransitions <= 0) return;

  pendingRouteTransitions -= 1;
  useNetworkActivityStore.getState().end();

  if (pendingRouteTransitions === 0) {
    clearFallbackTimer();
    return;
  }

  scheduleFallbackReset();
};

export const resetRouteTransitions = () => {
  if (pendingRouteTransitions <= 0) return;

  const transitionsToClear = pendingRouteTransitions;
  pendingRouteTransitions = 0;
  clearFallbackTimer();

  const { end } = useNetworkActivityStore.getState();
  for (let i = 0; i < transitionsToClear; i += 1) {
    end();
  }
};
