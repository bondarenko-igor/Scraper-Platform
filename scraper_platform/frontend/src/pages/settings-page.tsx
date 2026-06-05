import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { API_BASE_URL } from '@/services/api-client'

const ENV_SUMMARY = [
  { key: 'DATABASE_URL', value: '•••••••• (configured on server)', secret: true },
  { key: 'OPENAI_API_KEY', value: '•••••••• (not exposed)', secret: true },
  { key: 'AI_MODEL', value: import.meta.env.VITE_AI_MODEL ?? 'gpt-5.4-mini (default)' },
  { key: 'WORKER_CONCURRENCY', value: '2 (default)' },
  { key: 'WORKER_POLL_INTERVAL_SECONDS', value: '2.0 (default)' },
  { key: 'WORKER_LEASE_SECONDS', value: '600 (default)' },
  { key: 'BROWSER_HEADLESS', value: 'true (default)' },
  { key: 'ENVIRONMENT', value: import.meta.env.VITE_ENVIRONMENT ?? 'development' },
]

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Configuration overview · secrets never exposed in UI"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>API Settings</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Base URL" value={API_BASE_URL} />
            <Row label="App name" value={import.meta.env.VITE_APP_NAME ?? 'Scraper Platform'} />
            <p className="text-xs text-[var(--text-secondary)] pt-2">
              Endpoints: GET /health, /v1/jobs, /v1/proxies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Database (read-only)</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--text-secondary)]">
            PostgreSQL stores scrape jobs, proxy pool, and queue state. Connection string is
            server-side only per docs/deployment.md.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OpenAI configuration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Status" value="Configured on API server" />
            <Row label="Model" value={import.meta.env.VITE_AI_MODEL ?? 'See AI_MODEL env'} />
            <p className="text-xs text-[var(--text-secondary)]">
              Extraction layer described in docs/extraction.md
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Worker configuration</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Concurrency" value="WORKER_CONCURRENCY" />
            <Row label="Poll interval" value="WORKER_POLL_INTERVAL_SECONDS" />
            <Row label="Lease" value="WORKER_LEASE_SECONDS" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature flags</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="OLX source" value="Enabled" />
            <Row label="Custom output_schema" value="Enabled" />
            <Row label="WebSocket live updates" value="Disabled (not in API)" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Environment summary</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <tbody>
              {ENV_SUMMARY.map((row) => (
                <tr key={row.key} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 font-mono text-xs text-[var(--text-secondary)] w-1/3">{row.key}</td>
                  <td className="py-2 font-mono text-xs">{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  )
}
