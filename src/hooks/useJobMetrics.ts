import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { Metrics } from '@/types';

export const useJobMetrics = () => {
  const { data: jobsData } = useQuery({
    queryKey: queryKeys.jobs.list(1),
  });

  const { data: sseMetrics } = useQuery<Metrics>({
    queryKey: queryKeys.metrics.all,
    enabled: false,
  });

  const computedMetrics = useMemo(() => {
    if (!jobsData?.jobs) {
      return {
        total: 0,
        queued: 0,
        processing: 0,
        completed: 0,
        failed: 0,
        successRate: 0,
      };
    }

    const jobs = jobsData.jobs;
    const total = jobs.length;
    const queued = jobs.filter((j) => j.status === 'QUEUED').length;
    const processing = jobs.filter((j) => j.status === 'PROCESSING').length;
    const completed = jobs.filter((j) => j.status === 'COMPLETED').length;
    const failed = jobs.filter((j) => j.status === 'FAILED').length;

    const finishedJobs = completed + failed;
    const successRate = finishedJobs > 0 
      ? parseFloat(((completed / finishedJobs) * 100).toFixed(1))
      : 0;

    return {
      total,
      queued,
      processing,
      completed,
      failed,
      successRate,
    };
  }, [jobsData]);

  return sseMetrics || computedMetrics;
};