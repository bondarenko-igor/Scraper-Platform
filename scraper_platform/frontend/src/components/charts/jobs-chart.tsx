import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface JobsOverTimeProps {
  data: { date: string; count: number }[]
}

export function JobsOverTimeChart({ data }: JobsOverTimeProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          name="Jobs"
          stroke="var(--primary)"
          fill="var(--primary)"
          fillOpacity={0.15}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

interface TrendProps {
  data: { date: string; succeeded: number; failed: number }[]
}

export function SuccessFailureChart({ data }: TrendProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
          tickFormatter={(v: string) => v.slice(5)}
        />
        <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Legend />
        <Bar dataKey="succeeded" name="Succeeded" fill="var(--success)" radius={[2, 2, 0, 0]} />
        <Bar dataKey="failed" name="Failed" fill="var(--error)" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface ProxyDistProps {
  data: { name: string; value: number; fill: string }[]
}

export function ProxyHealthChart({ data }: ProxyDistProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={80}
          tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" name="Proxies" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
