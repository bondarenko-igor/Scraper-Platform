import { Link } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle,
  Globe,
  Server,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MetricCard } from '@/components/ui/metric-card'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--text-secondary)]">
                <Sparkles className="h-4 w-4 text-[var(--primary)]" />
                Production-ready scraping infrastructure
              </div>

              <h1 className="mt-6 text-5xl font-bold tracking-tight text-[var(--text-primary)] lg:text-6xl">
                Run Large-Scale
                <span className="block text-[var(--primary)]">
                  Web Extraction
                </span>
                With Confidence
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
                Monitor jobs, manage proxy pools, and track extraction
                performance from one centralized platform. Built for teams
                running data pipelines at scale.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/dashboard">
                    <Button size="lg">
                    <Link to="/dashboard">
                        Get Started
                    </Link>
                    </Button>
                </Link>

                <Button size="lg" variant="outline">
                <Link to="https://github.com/bondarenko-igor/Scraper-Platform/tree/master/docs">
                    View Documentation
                </Link>
                </Button>
              </div>

              <div className="mt-10 flex flex-wrap gap-8">
                <div>
                  <p className="text-3xl font-bold">10M+</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    URLs processed
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">99.9%</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Platform uptime
                  </p>
                </div>

                <div>
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm text-[var(--text-secondary)]">
                    Monitoring
                  </p>
                </div>
              </div>
            </div>

            {/* Dashboard Preview */}
            <Card className="border-[var(--border)] bg-[var(--surface-elevated)] shadow-sm">
              <CardHeader>
                <CardTitle>Live System Overview</CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <MetricCard
                    label="Jobs Processed"
                    value="2.4M"
                    icon={Briefcase}
                  />

                  <MetricCard
                    label="Success Rate"
                    value="98.7%"
                    icon={CheckCircle}
                  />

                  <MetricCard
                    label="Healthy Proxies"
                    value="1,248"
                    icon={Globe}
                  />

                  <MetricCard
                    label="Active Workers"
                    value="42"
                    icon={Server}
                  />
                </div>

                <div className="rounded-lg border border-[var(--border)] p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Recent Activity
                    </span>

                    <span className="rounded-full bg-[var(--success)]/10 px-2 py-1 text-xs text-[var(--success)]">
                      Healthy
                    </span>
                  </div>

                  <div className="space-y-3">
                    {[
                      '/d/uk/obyavlenie/prodazh-3-km-kvartri-v-tsentr-ternopolya-ID10uSaJ.html',
                      '/d/uk/obyavlenie/iphone-14-pro-max-128-ID10C7jt.html',
                      '/d/uk/obyavlenie/lada-vesta-1-6-2021-ID10gmwE.html',
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="truncate text-[var(--primary)]">
                          {item}
                        </span>

                        <span className="text-[var(--success)]">
                          Completed
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  )
}
