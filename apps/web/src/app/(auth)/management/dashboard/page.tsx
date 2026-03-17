'use client';

import {
  Users, GraduationCap, TrendingUp, AlertCircle,
  DollarSign, UserCheck, BarChart2, RefreshCw,
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useDashboardKpis, useAttendanceTrends, useFeeCollectionStats } from '@/hooks/use-api';
import { formatCurrency, formatDate } from '@/lib/utils';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS = ['#1E40AF','#0F766E','#D97706','#DC2626','#7C3AED','#0891B2'];

function KpiCard({
  label, value, sub, icon: Icon, color,
}: { label: string; value: string | number; sub?: string; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function ManagementDashboard() {
  const { data: kpis, isLoading: kpisLoading, refetch } = useDashboardKpis();
  const { data: trends } = useAttendanceTrends(undefined, 'MONTH');
  const { data: feeStats } = useFeeCollectionStats();

  const chartTrends = trends?.slice(-14).map((t) => ({
    date: formatDate(t.date, 'short').replace(/\d{4}/, '').trim(),
    present: t.present,
    absent: t.absent,
    late: t.late,
  })) ?? [];

  const feeChartData = feeStats?.map((m) => ({
    month: MONTH_NAMES[m.month - 1],
    amount: m.amount,
  })) ?? [];

  const pieData = kpis ? [
    { name: 'Students', value: kpis.totalStudents },
    { name: 'Faculty', value: kpis.totalFaculty },
    { name: 'Other Staff', value: Math.max(0, kpis.totalStaff - kpis.totalFaculty) },
  ] : [];

  if (kpisLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-7 w-48 rounded bg-muted animate-pulse" />
            <div className="mt-1 h-4 w-64 rounded bg-muted animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Executive Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(new Date(), 'long')} · Real-time overview
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <KpiCard label="Total Students" value={kpis?.totalStudents?.toLocaleString() ?? '—'}
          icon={Users} color="bg-blue-100 text-blue-600" />
        <KpiCard label="Faculty & Staff" value={kpis?.totalStaff?.toLocaleString() ?? '—'}
          icon={UserCheck} color="bg-teal-100 text-teal-600" />
        <KpiCard
          label="Today's Attendance"
          value={kpis?.todayAttendancePct != null ? `${kpis.todayAttendancePct}%` : '—'}
          sub={kpis?.todayAttendancePct != null && kpis.todayAttendancePct < 75 ? '⚠ Below threshold' : undefined}
          icon={GraduationCap} color="bg-green-100 text-green-600"
        />
        <KpiCard
          label="Monthly Revenue"
          value={kpis?.monthlyFeeCollection != null ? formatCurrency(kpis.monthlyFeeCollection) : '—'}
          icon={DollarSign} color="bg-amber-100 text-amber-600"
        />
        <KpiCard label="Pending Admissions" value={kpis?.pendingAdmissions ?? '—'}
          icon={TrendingUp} color="bg-purple-100 text-purple-600" />
        <KpiCard
          label="Open Grievances"
          value={kpis?.openGrievances ?? '—'}
          sub={kpis?.openGrievances && kpis.openGrievances > 0 ? 'Needs attention' : undefined}
          icon={AlertCircle} color="bg-red-100 text-red-600"
        />
        <KpiCard label="Total Faculty" value={kpis?.totalFaculty ?? '—'}
          icon={UserCheck} color="bg-indigo-100 text-indigo-600" />
        <KpiCard label="Active Modules" value="15+"
          icon={BarChart2} color="bg-slate-100 text-slate-600" />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Attendance trend */}
        <div className="col-span-2 rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Attendance — Last 14 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="present" stroke="#1E40AF" strokeWidth={2} dot={false} name="Present" />
              <Line type="monotone" dataKey="absent" stroke="#DC2626" strokeWidth={2} dot={false} name="Absent" />
              <Line type="monotone" dataKey="late" stroke="#D97706" strokeWidth={2} dot={false} name="Late" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* People distribution donut */}
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold">Institution Composition</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => v.toLocaleString()} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fee collection bar */}
      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold">Fee Collection — {new Date().getFullYear()}</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={feeChartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip formatter={(v: number) => formatCurrency(v)} />
            <Bar dataKey="amount" fill="#1E40AF" radius={[4, 4, 0, 0]} name="Collected" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
