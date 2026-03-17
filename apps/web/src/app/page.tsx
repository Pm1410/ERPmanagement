import Link from 'next/link';
import { LandingHero3D } from '@/components/landing/landing-hero-3d';

export default function RootPage() {
  return (
    <main className="min-h-screen bg-[#070A12] text-white">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_60%_20%,rgba(59,130,246,0.35),rgba(0,0,0,0))]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_20%_80%,rgba(168,85,247,0.22),rgba(0,0,0,0))]" />

        <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <span className="text-sm font-black tracking-tight">ERP</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">School ERP</div>
              <div className="text-xs text-white/60">Management • Faculty • Student • Parent</div>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
            >
              Login
            </Link>
          </nav>
        </header>

        <section className="relative mx-auto grid max-w-6xl gap-10 px-6 pb-16 pt-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Production-grade school management portal
            </div>

            <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl">
              Run your school with clarity.
              <span className="block text-white/70">One ERP, four portals, real-time operations.</span>
            </h1>

            <p className="max-w-xl text-pretty text-sm leading-6 text-white/70 sm:text-base">
              Students, faculty, parents, and administrators stay connected across attendance, exams, fees, materials,
              library, transport, hostel, admissions, analytics, and notices — with RBAC security and health/readiness checks.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-white/90"
              >
                Open Login
              </Link>
              <Link
                href="/management/dashboard"
                className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/15"
              >
                Go to Management Portal
              </Link>
              <a
                href="mailto:sales@your-school-erp.com?subject=School%20ERP%20Demo%20Request"
                className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                Request a demo
              </a>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { k: '4', v: 'Portals' },
                { k: '20+', v: 'Modules' },
                { k: '/readyz', v: 'Readiness endpoint' },
              ].map((x) => (
                <div key={x.v} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-2xl font-extrabold">{x.k}</div>
                  <div className="text-xs text-white/60">{x.v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-3 rounded-[32px] bg-gradient-to-tr from-blue-500/25 via-purple-500/10 to-transparent blur-2xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
              <LandingHero3D />
            </div>
          </div>
        </section>
      </div>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: 'Secure by default',
              body: 'Role-based access with server-side enforcement so parents/students only see what they’re allowed to.',
            },
            {
              title: 'Operational visibility',
              body: 'Dashboards that show KPIs and usable tables — not raw JSON — across academics, finance, and operations.',
            },
            {
              title: 'Deployment-ready',
              body: 'Docker VM Compose runbook, CI build workflow, and non-zero seed data for a real demo experience.',
            },
          ].map((c) => (
            <div key={c.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-base font-bold">{c.title}</div>
              <div className="mt-2 text-sm leading-6 text-white/70">{c.body}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} School ERP</div>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-white">Login</Link>
            <Link href="/management/dashboard" className="hover:text-white">Management</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
