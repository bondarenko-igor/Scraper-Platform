import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ErrorBoundary } from '@/components/error-boundary'
import { DashboardPage } from '@/pages/dashboard-page'
import { JobsPage } from '@/pages/jobs-page'
import { JobDetailPage } from '@/pages/job-detail-page'
import { ProxiesPage } from '@/pages/proxies-page'
import { WorkersPage } from '@/pages/workers-page'
import { WorkerDetailPage } from '@/pages/worker-detail-page'
import { ExtractionPage } from '@/pages/extraction-page'
import { QueuePage } from '@/pages/queue-page'
import { HealthPage } from '@/pages/health-page'
import { SettingsPage } from '@/pages/settings-page'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route
          index
          element={
            <ErrorBoundary>
              <DashboardPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="jobs"
          element={
            <ErrorBoundary>
              <JobsPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="jobs/:jobId"
          element={
            <ErrorBoundary>
              <JobDetailPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="queue"
          element={
            <ErrorBoundary>
              <QueuePage />
            </ErrorBoundary>
          }
        />
        <Route
          path="workers"
          element={
            <ErrorBoundary>
              <WorkersPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="workers/:workerId"
          element={
            <ErrorBoundary>
              <WorkerDetailPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="proxies"
          element={
            <ErrorBoundary>
              <ProxiesPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="health"
          element={
            <ErrorBoundary>
              <HealthPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="extraction"
          element={
            <ErrorBoundary>
              <ExtractionPage />
            </ErrorBoundary>
          }
        />
        <Route
          path="settings"
          element={
            <ErrorBoundary>
              <SettingsPage />
            </ErrorBoundary>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
