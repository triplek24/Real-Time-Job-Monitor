import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobsApi } from "@/api/jobs.api";
import { queryKeys } from "@/lib/queryClient";
import { Job } from "@/types";

interface JobFilters {
  page?: number;
  search?: string;
  position?: string;
  experienceRange?: string;
  status?: string;
}


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
    onSuccess: (newJob) => {
      queryClient.setQueryData(queryKeys.jobs.list(1), (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          jobs: [newJob, ...oldData.jobs],
          total: oldData.total + 1,
        };
      });
      queryClient.getQueriesData({ queryKey: queryKeys.jobs.lists() });
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
    onError: (error: any) => {
      console.error("Failed to retry job:", error);
    },
  });
};

const updateJobInCache = (queryClient: any, updatedJob: Job) => {
  const queries = queryClient.getQueriesData({
    queryKey: queryKeys.jobs.lists(),
  });

  queries.forEach(([queryKey, oldData]: [any, any]) => {
    if (!oldData?.jobs) return;

    queryClient.setQueryData(queryKey, {
      ...oldData,
      jobs: oldData.jobs.map((job: Job) =>
        job.id === updatedJob.id ? updatedJob : job,
      ),
    });
  });
};
