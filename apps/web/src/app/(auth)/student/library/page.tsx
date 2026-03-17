'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useIssuedBooks, useMyStudentProfile } from '@/hooks/use-api';
import { cn, formatDate } from '@/lib/utils';

export default function StudentLibraryPage() {
  const { user } = useAuthStore();
  const { data: me } = useMyStudentProfile();
  const studentId = me?.id ?? '';
  const { data, isLoading, error, refetch } = useIssuedBooks(studentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Library</h1>
          <p className="text-sm text-muted-foreground">Issued books</p>
        </div>
        <button onClick={() => refetch()} className="rounded-lg border px-3 py-2 text-sm hover:bg-muted">
          Refresh
        </button>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}
      {error && <div className="text-sm text-destructive">Failed to load issued books.</div>}

      <div className="space-y-2">
        {(data ?? []).length ? (data as any[]).map((i: any) => {
          const overdue = i.dueDate && !i.returnedAt && new Date(i.dueDate) < new Date();
          return (
            <div key={i.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{i.book?.title ?? 'Book'}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Due {i.dueDate ? formatDate(i.dueDate, 'short') : '—'}
                  </p>
                </div>
                <span className={cn(
                  'shrink-0 rounded-md px-2 py-1 text-xs font-semibold',
                  i.returnedAt ? 'bg-green-100 text-green-700' : overdue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700',
                )}>
                  {i.returnedAt ? 'RETURNED' : overdue ? 'OVERDUE' : 'ISSUED'}
                </span>
              </div>
            </div>
          );
        }) : (
          !isLoading && <div className="text-sm text-muted-foreground">No issued books.</div>
        )}
      </div>

      <Link href="/student/dashboard" className="text-sm font-medium text-primary hover:underline">
        Back to dashboard
      </Link>
    </div>
  );
}

