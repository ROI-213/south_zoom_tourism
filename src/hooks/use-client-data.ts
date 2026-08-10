import { useCallback, useEffect, useState } from "react";

/**
 * Runs a browser-only read after hydration so server HTML and the first client
 * paint match. Returns a `reload` callback for use after mutations.
 */
export function useClientData<T>(read: () => T, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    setData(read());
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  return { data, loading, reload };
}
