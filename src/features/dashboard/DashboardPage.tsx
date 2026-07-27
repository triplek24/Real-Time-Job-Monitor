import { lazy, Suspense, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useJobMetrics } from '@/hooks/useJobMetrics';
import { useSSE } from '@/hooks/useSSE';
import { JobList } from '@/features/jobs/JobList';
import { MetricsCard } from './MetricsCard';
import styles from './DashboardPage.module.scss';

// Module-level — created once, not per render
const CreateJobForm = lazy(() =>
  import('@/features/jobs/CreateJobForm').then((module) => ({ default: module.CreateJobForm }))
);

export const DashboardPage = () => {
  const { user, canCreateJob } = useAuth();
  const metrics = useJobMetrics();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sseStatus, setSseStatus] = useState<'connected' | 'disconnected'>('disconnected');
 const statusTimeoutRef = useRef<number | undefined>(undefined);

  useSSE({
    enabled: true,
    onConnect: () => {
      clearTimeout(statusTimeoutRef.current);
      statusTimeoutRef.current = window.setTimeout(() => {
        setSseStatus('connected');
      }, 1000);
    },
    onDisconnect: () => {
      clearTimeout(statusTimeoutRef.current);
      setSseStatus('disconnected');
    },
    onError: () => {},
  });

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div>
          <h1>Job Processing Monitor</h1>
          <p className={styles.subtitle}>
            Welcome, {user?.email} ({user?.role})
          </p>
        </div>

        <div className={styles.headerActions}>
          <div className={`${styles.sseIndicator} ${styles[sseStatus]}`}>
            <span className={styles.dot}></span>
            {sseStatus === 'connected' ? 'Live' : 'Disconnected'}
          </div>

          {canCreateJob() && (
            <button onClick={() => setShowCreateForm((prev) => !prev)} className={styles.btnCreate}>
              {showCreateForm ? 'Cancel' : '+ Create Job'}
            </button>
          )}
        </div>
      </header>

      {showCreateForm && canCreateJob() && (
        <div className={styles.createFormContainer}>
          <Suspense fallback={<div>Loading form...</div>}>
            <CreateJobForm onSuccess={() => setShowCreateForm(false)} />
          </Suspense>
        </div>
      )}

      <div className={styles.metricsGrid}>
        <MetricsCard title="Total Jobs" value={metrics.total} color="blue" />
        <MetricsCard title="Queued" value={metrics.queued} color="gray" />
        <MetricsCard title="Processing" value={metrics.processing} color="blue" />
        <MetricsCard title="Completed" value={metrics.completed} color="green" />
        <MetricsCard title="Failed" value={metrics.failed} color="red" />
        <MetricsCard title="Success Rate" value={`${metrics.successRate}%`} color="purple" />
      </div>

      <JobList />
    </div>
  );
};