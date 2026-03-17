'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMyParentProfile } from '@/hooks/use-api';

export function useSelectedChildStudentId() {
  const { data: parent, isLoading, error, refetch } = useMyParentProfile();

  const links = (parent as any)?.students ?? [];
  const children = useMemo(
    () =>
      links
        .map((l: any) => l.student)
        .filter(Boolean),
    [links],
  );

  const [studentId, setStudentId] = useState<string>('');

  useEffect(() => {
    if (!children.length) return;
    const key = 'erp-parent-selected-student';
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    const exists = stored && children.some((c: any) => c.id === stored);
    const initial = exists ? stored! : children[0].id;
    setStudentId(initial);
    if (typeof window !== 'undefined') window.localStorage.setItem(key, initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children.length]);

  const setSelected = (id: string) => {
    setStudentId(id);
    if (typeof window !== 'undefined') window.localStorage.setItem('erp-parent-selected-student', id);
  };

  return { parent, children, studentId, setStudentId: setSelected, isLoading, error, refetch };
}

