"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type RoutePrefetcherProps = { routes: string[] };

export default function RoutePrefetcher({ routes }: RoutePrefetcherProps) {
  const router = useRouter();

  const routeKey = routes.join("|");

  useEffect(() => {
    const routeList = routeKey ? routeKey.split("|") : [];
    let index = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    const prefetchNext = () => {
      if (cancelled || index >= routeList.length) return;
      const route = routeList[index++];
      router.prefetch(route);
      timer = setTimeout(prefetchNext, 120);
    };

    // Warm the route cache in small steps after the dashboard appears.
    timer = setTimeout(prefetchNext, 250);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [router, routeKey]);

  return null;
}
