import { useEffect, useRef, useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '@/store/hooks';
import { queryKeys } from '@/lib/queryClient';
import { Job, Metrics } from '@/types';

const SSE_URL = (import.meta.env.VITE_SSE_URL as string) || 'http://localhost:5000/api/events';

interface UseSSEOptions {
  enabled?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useSSE = (options: UseSSEOptions = {}) => {
  const { enabled = true, onConnect, onDisconnect, onError } = options;
  const queryClient = useQueryClient();
  const token = useAppSelector((state) => state.auth.token);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  // Keep latest callbacks in refs so the connection effect doesn't
  // need them as dependencies (which caused reconnect-on-every-render).
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  }, [onConnect, onDisconnect, onError]);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 3000;

  const handleJobUpdate = useCallback(
    (job: Job) => {
      const queries = queryClient.getQueriesData({
        queryKey: queryKeys.jobs.lists(),
      });

      queries.forEach(([queryKey, oldData]: [any, any]) => {
        if (!oldData?.jobs) return;

        queryClient.setQueryData(queryKey, {
          ...oldData,
          jobs: oldData.jobs.map((existingJob: Job) =>
            existingJob.id === job.id ? job : existingJob
          ),
        });
      });

      console.log('[SSE] Job updated:', job.id, job.status, `${job.progress}%`);
    },
    [queryClient]
  );

  const handleMetricsUpdate = useCallback(
    (metrics: Metrics) => {
      queryClient.setQueryData(queryKeys.metrics.all, metrics);
      console.log('[SSE] Metrics updated:', metrics);
    },
    [queryClient]
  );

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      console.log('[SSE] Disconnected');
      onDisconnectRef.current?.();
    }
  }, []);

  useEffect(() => {
    if (!token || !enabled) return;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const url = `${SSE_URL}?token=${token}`;
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.addEventListener('connected', (event) => {
          console.log('[SSE] Connected:', JSON.parse(event.data));
          reconnectAttemptsRef.current = 0;
          setIsConnected(true);
          onConnectRef.current?.();
        });

        eventSource.addEventListener('job-update', (event) => {
          const job: Job = JSON.parse(event.data);
          handleJobUpdate(job);
        });

        eventSource.addEventListener('metrics-update', (event) => {
          const metrics: Metrics = JSON.parse(event.data);
          handleMetricsUpdate(metrics);
        });

        eventSource.onerror = (error) => {
          console.error('[SSE] Connection error:', error);
          eventSource.close();
          setIsConnected(false);
          onErrorRef.current?.(error);

          if (reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
            reconnectAttemptsRef.current++;
            const delay = RECONNECT_DELAY * reconnectAttemptsRef.current;

            console.log(
              `[SSE] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`
            );

            reconnectTimeoutRef.current = window.setTimeout(() => {
              connect();
            }, delay);
          } else {
            console.error('[SSE] Max reconnection attempts reached');
            onDisconnectRef.current?.();
          }
        };
      } catch (error) {
        console.error('[SSE] Failed to create EventSource:', error);
        setIsConnected(false);
      }
    };

    connect();

    return () => {
      disconnect();
    };
    // Only reconnect when token/enabled actually change — not on every
    // render caused by inline onConnect/onDisconnect/onError props.
  }, [enabled, token, handleJobUpdate, handleMetricsUpdate, disconnect]);

  return {
    isConnected,
    disconnect,
  };
};