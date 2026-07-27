// jobQueries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { queryKeys } from "@/lib/queryClient";
import { Job, JobFilters } from "@/types"; // shared type, not redeclared locally

export const useJobsQuery = (filters: JobFilters = {}) => {
  return useQuery({
    queryKey: queryKeys.jobs.list(filters),
    queryFn: () => jobsApi.getJobs(filters),
    staleTime: 0,
  });
};

export const useCreateJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      position: string;
      experience: string;
      description: string;
    }) => jobsApi.createJob(data),
    onSuccess: () => {
      // Simpler and correct — refetch whatever filtered view is currently active,
      // rather than guessing which cached list entry to manually splice into.
      queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
    },
    onError: (error: unknown) => {
      const message =
        error instanceof Error ? error.message : "Failed to create job";
      console.error("Failed to create job:", message);
    },
  });
};

export const useCancelJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobsApi.cancelJob(jobId),
    onSuccess: (updatedJob) => {
      updateJobInCache(queryClient, updatedJob);
    },
    onError: (error: unknown) => {
      console.error("Failed to cancel job:", error);
    },
  });
};

export const useRetryJobMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => jobsApi.retryJob(jobId),
    onSuccess: (updatedJob) => {
      updateJobInCache(queryClient, updatedJob);
    },
    onError: (error: unknown) => {
      console.error("Failed to retry job:", error);
    },
  });
};

const updateJobInCache = (queryClient: ReturnType<typeof useQueryClient>, updatedJob: Job) => {
  const queries = queryClient.getQueriesData<{ jobs: Job[]; total: number }>({
    queryKey: queryKeys.jobs.lists(),
  });

  queries.forEach(([queryKey, oldData]) => {
    if (!oldData?.jobs) return;

    queryClient.setQueryData(queryKey, {
      ...oldData,
      jobs: oldData.jobs.map((job) =>
        job.id === updatedJob.id ? updatedJob : job,
      ),
    });
  });
};