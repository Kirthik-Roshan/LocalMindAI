"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { SystemStats } from "@/lib/types";

interface UseSystemStatsResult {
  stats: SystemStats | null;
  loading: boolean;
  error: string | null;
}

const POLL_INTERVAL = 5000;

/**
 * Polls the backend system stats endpoint every 5 seconds.
 */
export function useSystemStats(): UseSystemStatsResult {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    const controller = new AbortController();

    const fetchStats = async () => {
      try {
        const data = await api.getSystemStats(controller.signal);
        if (!mountedRef.current) return;
        setStats(data);
        setError(null);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }
        if (!mountedRef.current) return;
        const message =
          err instanceof ApiError
            ? err.message
            : "Failed to load system stats.";
        setError(message);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  return { stats, loading, error };
}
