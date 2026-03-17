'use client';

import Link from 'next/link';

export default function ManagementStudentIdCardsPage() {
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Student ID Cards</h1>
      <p className="text-sm text-muted-foreground">ID card generation UI will be added here.</p>
      <Link href="/management/students" className="text-sm font-medium text-primary hover:underline">
        Back to students
      </Link>
    </div>
  );
}

