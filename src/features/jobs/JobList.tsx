import { memo, useCallback } from "react";
import {
  useJobsQuery,
  useCancelJobMutation,
  useRetryJobMutation,
} from "./jobQueries";
import { useAuth } from "@/hooks/useAuth";
import { Job } from "@/types";
import styles from "./JobList.module.scss";
import { JobFilters } from "./jobFliter";
import { useSearchParams } from "react-router-dom";

export const JobList = () => {
  const [searchParams] = useSearchParams();

  const filters = {
    search: searchParams.get("search") || undefined,
    position: searchParams.get("position") || undefined,
    experienceRange: searchParams.get("experienceRange") || undefined,
    status: searchParams.get("status") || undefined,
  };

  const { data, isLoading, isError, error } = useJobsQuery(filters);
  const { canManageJobs } = useAuth();
  const cancelMutation = useCancelJobMutation();
  const retryMutation = useRetryJobMutation();

  const handleCancel = useCallback(
    async (jobId: string) => {
      if (confirm("Are you sure you want to cancel this job?")) {
        await cancelMutation.mutateAsync(jobId);
      }
    },
    [cancelMutation]
  );

  const handleRetry = useCallback(
    async (jobId: string) => {
      await retryMutation.mutateAsync(jobId);
    },
    [retryMutation]
  );

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading jobs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h3>Failed to load jobs</h3>
          <p>{(error as any)?.message || "Something went wrong"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Jobs ({data?.total || 0})</h2>
      </div>

      <JobFilters />

      {!data?.jobs || data?.jobs?.length === 0 ? (
        <div className={styles.emptyState}>
          <h3>No jobs found</h3>
          <p>Try adjusting your filters</p>
        </div>
      ) : (
        <div className={styles.jobGrid}>
          {data.jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              canManage={canManageJobs()}
              onCancel={handleCancel}
              onRetry={handleRetry}
              isCanceling={cancelMutation.isPending}
              isRetrying={retryMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface JobCardProps {
  job: Job;
  canManage: boolean;
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  isCanceling: boolean;
  isRetrying: boolean;
}

// memo() prevents re-render when this specific job's data hasn't changed
const JobCard = memo(function JobCard({
  job,
  canManage,
  onCancel,
  onRetry,
  isCanceling,
  isRetrying,
}: JobCardProps) {
  const getStatusClass = (status: string) => {
    return styles[`status${status.charAt(0) + status.slice(1).toLowerCase()}`];
  };

  const canCancel =
    canManage && (job.status === "QUEUED" || job.status === "PROCESSING");
  const canRetry = canManage && job.status === "FAILED";

  return (
    <div className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <h3 className={styles.jobTitle}>{job.title}</h3>
        <span className={`${styles.statusBadge} ${getStatusClass(job.status)}`}>
          {job.status}
        </span>
      </div>

      <div className={styles.jobInfo}>
        <span><strong>Position:</strong> {job?.position}</span>
        <span><strong>Experience:</strong> {job?.experience}</span>
      </div>

      <p className={styles.jobDescription}>{job?.description}</p>

      {job.status === "PROCESSING" && (
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${job.progress}%` }} />
          </div>
          <span className={styles.progressText}>{job.progress}%</span>
        </div>
      )}

      <div className={styles.jobMeta}>
        <span>By: {job.creator?.email || "Unknown"}</span>
        <span>{new Date(job.createdAt).toLocaleString()}</span>
      </div>

      {canManage && (
        <div className={styles.jobActions}>
          {canCancel && (
            <button onClick={() => onCancel(job.id)} disabled={isCanceling} className={styles.btnCancel}>
              Cancel
            </button>
          )}
          {canRetry && (
            <button onClick={() => onRetry(job.id)} disabled={isRetrying} className={styles.btnRetry}>
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
});