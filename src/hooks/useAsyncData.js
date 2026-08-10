import { useCallback, useEffect, useState } from 'react';

export function useAsyncData(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
      setStatus('succeeded');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Unable to load data');
      setStatus('failed');
    }
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, status, error, reload: load };
}
