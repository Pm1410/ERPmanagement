import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiClient, extractData } from '@/lib/api-client';
import type {
  Student, Faculty, AttendanceSummary, AcademicYear, Class, Section,
  Subject, TimetableSlot, Exam, Grade, FeeDue, FeePayment, Assignment,
  Book, BookIssue, Notice, DashboardKpis, AttendanceTrendPoint,
  FeeCollectionPoint, ResultSummary, HostelRoom, HostelAllocation,
} from '@/types';

// ── Query key factory ──────────────────────────────────────────
export const qk = {
  students: (params?: object)  => ['students', params],
  student:  (id: string)       => ['students', id],
  faculty:  (params?: object)  => ['faculty', params],
  facultyOne: (id: string)     => ['faculty', id],
  attendance: (params: object) => ['attendance', params],
  timetable:  (params: object) => ['timetable', params],
  exams:     (params?: object) => ['exams', params],
  results:   (studentId: string, examId?: string) => ['results', studentId, examId],
  fees:      (studentId: string) => ['fees', studentId],
  feeHistory:(studentId: string) => ['fee-history', studentId],
  assignments:(params?: object) => ['assignments', params],
  books:     (params?: object) => ['books', params],
  notices:   (params?: object) => ['notices', params],
  feeHeads:  ()                => ['fees', 'heads'],
  feeStructure: (params: { classId: string; academicYearId: string }) => ['fees', 'structure', params],
  defaulters: (params?: object) => ['fees', 'defaulters', params],
  kpis:      ()                => ['analytics', 'kpis'],
  attendanceTrends: (params: object) => ['analytics', 'attendance-trends', params],
  feeStats:  (year?: number)   => ['analytics', 'fee-collection', year],
  examPerf:  (params: object)  => ['analytics', 'exam-performance', params],
  classes:   (academicYearId?: string) => ['classes', academicYearId],
  sections:  (classId: string) => ['sections', classId],
  subjects:  (classId: string) => ['subjects', classId],
  academicYears: () => ['academic-years'],
  leaveRequests: (params?: object) => ['leaves', params],
  grievances: (params?: object) => ['grievances', params],
  notifications: () => ['notifications', 'in-app'],
  hostelRooms: () => ['hostel', 'rooms'],
  hostelAllocations: (status?: string) => ['hostel', 'allocations', status],
  admissionEnquiries: (params?: object) => ['admissions', 'enquiries', params],
  admissionApplications: (params?: object) => ['admissions', 'applications', params],
  transportVehicles: () => ['transport', 'vehicles'],
  transportRoutes: () => ['transport', 'routes'],
  transportAssignments: (status?: string) => ['transport', 'assignments', status],
};

// ── Generic mutation helper ────────────────────────────────────
function useMutate<TData, TVariables>(
  mutFn: (vars: TVariables) => Promise<TData>,
  options?: {
    onSuccess?: (data: TData) => void;
    invalidate?: unknown[][];
    successMsg?: string;
  },
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVariables>({
    mutationFn: mutFn,
    onSuccess: (data) => {
      if (options?.successMsg) toast.success(options.successMsg);
      options?.invalidate?.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      options?.onSuccess?.(data);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message ?? err.message ?? 'Something went wrong';
      toast.error(msg);
    },
  });
}

// ── Analytics ─────────────────────────────────────────────────
export function useDashboardKpis() {
  return useQuery<DashboardKpis>({
    queryKey: qk.kpis(),
    queryFn: () => apiClient.get('/analytics/dashboard-kpis').then(extractData),
    refetchInterval: 60_000, // refresh every minute
  });
}

export function useAttendanceTrends(classId?: string, range?: string) {
  return useQuery<AttendanceTrendPoint[]>({
    queryKey: qk.attendanceTrends({ classId, range }),
    queryFn: () => apiClient.get('/analytics/attendance-trends', { params: { classId, range } }).then(extractData),
  });
}

export function useFeeCollectionStats(year?: number) {
  return useQuery<FeeCollectionPoint[]>({
    queryKey: qk.feeStats(year),
    queryFn: () => apiClient.get('/analytics/fee-collection', { params: { year } }).then(extractData),
  });
}

export function useExamPerformance(classId?: string, examId?: string) {
  return useQuery({
    queryKey: qk.examPerf({ classId, examId }),
    queryFn: () => apiClient.get('/analytics/exam-performance', { params: { classId, examId } }).then(extractData),
    enabled: !!(classId || examId),
  });
}

export function useAcademicDashboard(academicYearId?: string) {
  return useQuery({
    queryKey: ['analytics', 'academic-dashboard', academicYearId],
    queryFn: () => apiClient.get('/analytics/dashboards/academic', { params: { academicYearId } }).then(extractData),
  });
}

export function useFinancialDashboard(year?: number) {
  return useQuery({
    queryKey: ['analytics', 'financial-dashboard', year],
    queryFn: () => apiClient.get('/analytics/dashboards/financial', { params: { year } }).then(extractData),
  });
}

export function useOperationalDashboard() {
  return useQuery({
    queryKey: ['analytics', 'operational-dashboard'],
    queryFn: () => apiClient.get('/analytics/dashboards/operational').then(extractData),
  });
}

// ── Students ──────────────────────────────────────────────────
export function useStudents(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.students(params),
    queryFn: () => apiClient.get('/students', { params }).then((r) => r.data),
  });
}

export function useStudent(id: string) {
  return useQuery<Student>({
    queryKey: qk.student(id),
    queryFn: () => apiClient.get(`/students/${id}`).then(extractData),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  return useMutate(
    (data: Partial<Student>) => apiClient.post('/students', data).then(extractData),
    { successMsg: 'Student created', invalidate: [qk.students()] },
  );
}

export function useUpdateStudent(id: string) {
  return useMutate(
    (data: Partial<Student>) => apiClient.put(`/students/${id}`, data).then(extractData),
    { successMsg: 'Student updated', invalidate: [qk.students(), qk.student(id)] },
  );
}

export function useStudentDocuments(studentId: string) {
  return useQuery({
    queryKey: ['students', studentId, 'documents'],
    queryFn: () => apiClient.get(`/students/${studentId}/documents`).then(extractData),
    enabled: !!studentId,
  });
}

export function useUploadStudentDocument(studentId: string) {
  return useMutate(
    (vars: { file: File; docType: string }) => {
      const fd = new FormData();
      fd.append('file', vars.file);
      fd.append('docType', vars.docType);
      return apiClient.post(`/students/${studentId}/documents`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(extractData);
    },
    { successMsg: 'Document uploaded', invalidate: [['students', studentId, 'documents']] },
  );
}

export function useDeactivateStudent(studentId: string) {
  return useMutate(
    () => apiClient.delete(`/students/${studentId}`).then(extractData),
    { successMsg: 'Student deactivated', invalidate: [qk.students(), qk.student(studentId)] },
  );
}

// ── Faculty (Staff) ────────────────────────────────────────────
export function useFaculty(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.faculty(params),
    queryFn: () => apiClient.get('/faculty', { params }).then(extractData),
  });
}

export function useFacultyOne(id: string) {
  return useQuery({
    queryKey: qk.facultyOne(id),
    queryFn: () => apiClient.get(`/faculty/${id}`).then(extractData),
    enabled: !!id,
  });
}

export function useCreateFaculty() {
  return useMutate(
    (data: Partial<Faculty>) => apiClient.post('/faculty', data).then(extractData),
    { successMsg: 'Staff created', invalidate: [qk.faculty()] },
  );
}

export function useUpdateFaculty(id: string) {
  return useMutate(
    (data: Partial<Faculty>) => apiClient.put(`/faculty/${id}`, data).then(extractData),
    { successMsg: 'Staff updated', invalidate: [qk.faculty(), qk.facultyOne(id)] },
  );
}

export function useDeactivateFaculty(id: string) {
  return useMutate(
    () => apiClient.delete(`/faculty/${id}`).then(extractData),
    { successMsg: 'Staff deactivated', invalidate: [qk.faculty(), qk.facultyOne(id)] },
  );
}

export function useAssignFacultySubjects(facultyId: string) {
  return useMutate(
    (data: { subjectIds: string[]; classId: string; sectionId: string; academicYearId: string }) =>
      apiClient.post(`/faculty/${facultyId}/assign-subjects`, data).then(extractData),
    { successMsg: 'Subjects assigned', invalidate: [qk.faculty(), qk.facultyOne(facultyId)] },
  );
}

export function useFacultyTimetable(facultyId: string) {
  return useQuery({
    queryKey: ['faculty', facultyId, 'timetable'],
    queryFn: () => apiClient.get(`/faculty/${facultyId}/timetable`).then(extractData),
    enabled: !!facultyId,
  });
}

export function useMyFacultyProfile() {
  return useQuery<Faculty>({
    queryKey: ['faculty', 'me'],
    queryFn: () => apiClient.get('/faculty/me').then(extractData),
  });
}

// ── Attendance ────────────────────────────────────────────────
export function useStudentAttendance(studentId: string, month?: string) {
  return useQuery<AttendanceSummary & { records: unknown[] }>({
    queryKey: qk.attendance({ studentId, month }),
    queryFn: () =>
      apiClient.get(`/attendance/student/${studentId}/summary`, { params: { month } }).then(extractData),
    enabled: !!studentId,
  });
}

// ── Student (current user) ─────────────────────────────────────
export function useMyStudentProfile() {
  return useQuery<Student>({
    queryKey: ['students', 'me'],
    queryFn: () => apiClient.get('/students/me').then(extractData),
  });
}

export function useMarkAttendance() {
  return useMutate(
    (data: unknown) => apiClient.post('/attendance/mark', data).then(extractData),
    { successMsg: 'Attendance saved', invalidate: [qk.attendance({})] },
  );
}

export function useApplyLeave() {
  return useMutate(
    (data: unknown) => apiClient.post('/attendance/leave', data).then(extractData),
    { successMsg: 'Leave request submitted', invalidate: [qk.leaveRequests()] },
  );
}

// ── Academic ──────────────────────────────────────────────────
export function useAcademicYears() {
  return useQuery<AcademicYear[]>({
    queryKey: qk.academicYears(),
    queryFn: () => apiClient.get('/academic/years').then(extractData),
  });
}

export function useClasses(academicYearId?: string) {
  return useQuery<Class[]>({
    queryKey: qk.classes(academicYearId),
    queryFn: () => apiClient.get('/academic/classes', { params: { academicYearId } }).then(extractData),
    enabled: !!academicYearId,
  });
}

export function useCreateAcademicYear() {
  return useMutate(
    (data: { name: string; startDate: string; endDate: string }) =>
      apiClient.post('/academic/years', data).then(extractData),
    { successMsg: 'Academic year created', invalidate: [qk.academicYears()] },
  );
}

export function useSetCurrentAcademicYear() {
  return useMutate(
    (id: string) => apiClient.put(`/academic/years/${id}/set-current`).then(extractData),
    { successMsg: 'Current academic year updated', invalidate: [qk.academicYears()] },
  );
}

export function useCreateClass() {
  return useMutate(
    (data: { name: string; orderIndex?: number; academicYearId: string }) =>
      apiClient.post('/academic/classes', data).then(extractData),
    { successMsg: 'Class created', invalidate: [qk.classes()] },
  );
}

export function useCreateSection() {
  return useMutate(
    (data: { name: string; classId: string; classTeacherId?: string; maxStrength?: number }) =>
      apiClient.post('/academic/sections', data).then(extractData),
    { successMsg: 'Section created' },
  );
}

export function useCreateSubject() {
  return useMutate(
    (data: { name: string; code?: string; type?: string; classId: string; weeklyPeriods?: number; maxMarks?: number; passMarks?: number }) =>
      apiClient.post('/academic/subjects', data).then(extractData),
    { successMsg: 'Subject created' },
  );
}

export function useSaveTimetable() {
  return useMutate(
    (data: { classId: string; sectionId: string; academicYearId: string; slots: Array<{ day: string; startTime: string; endTime: string; subjectId: string; facultyId: string; room?: string }> }) =>
      apiClient.post('/academic/timetable', data).then(extractData),
    { successMsg: 'Timetable saved' },
  );
}

export function useSections(classId: string) {
  return useQuery<Section[]>({
    queryKey: qk.sections(classId),
    queryFn: () => apiClient.get(`/academic/classes/${classId}/sections`).then(extractData),
    enabled: !!classId,
  });
}

export function useSubjects(classId: string) {
  return useQuery<Subject[]>({
    queryKey: qk.subjects(classId),
    queryFn: () => apiClient.get(`/academic/classes/${classId}/subjects`).then(extractData),
    enabled: !!classId,
  });
}

export function useTimetable(classId: string, sectionId: string, academicYearId?: string) {
  return useQuery<TimetableSlot[]>({
    queryKey: qk.timetable({ classId, sectionId, academicYearId }),
    queryFn: () =>
      apiClient.get('/academic/timetable', { params: { classId, sectionId, academicYearId } }).then(extractData),
    enabled: !!(classId && sectionId),
  });
}

// ── Exams ─────────────────────────────────────────────────────
export function useExams(academicYearId?: string) {
  return useQuery<Exam[]>({
    queryKey: qk.exams({ academicYearId }),
    queryFn: () => apiClient.get('/exams', { params: { academicYearId } }).then(extractData),
  });
}

export function useExamSchedules(examId: string, classId?: string) {
  return useQuery({
    queryKey: ['exams', examId, 'schedules', classId],
    queryFn: () => apiClient.get(`/exams/${examId}/schedules`, { params: { classId } }).then(extractData),
    enabled: !!examId,
  });
}

export function useStudentResults(studentId: string, examId?: string) {
  return useQuery<ResultSummary[]>({
    queryKey: qk.results(studentId, examId),
    queryFn: () =>
      apiClient.get(`/exams/results/student/${studentId}`, { params: { examId } }).then(extractData),
    enabled: !!studentId,
  });
}

export function useClassResults(examId?: string, classId?: string, sectionId?: string) {
  return useQuery({
    queryKey: ['exams', 'results', 'class', { examId, classId, sectionId }],
    queryFn: () => apiClient.get('/exams/results/class', { params: { examId, classId, sectionId } }).then(extractData),
    enabled: !!(examId && classId && sectionId),
  });
}

export function useBulkMarksEntry() {
  return useMutate(
    (data: unknown) => apiClient.post('/exams/marks', data).then(extractData),
    { successMsg: 'Marks saved successfully' },
  );
}

// ── Fees ──────────────────────────────────────────────────────
export function useFeeHeads() {
  return useQuery({
    queryKey: qk.feeHeads(),
    queryFn: () => apiClient.get('/fees/heads').then(extractData),
  });
}

export function useCreateFeeHead() {
  return useMutate(
    (data: unknown) => apiClient.post('/fees/heads', data).then(extractData),
    { successMsg: 'Fee head created', invalidate: [qk.feeHeads()] },
  );
}

export function useFeeStructure(classId: string, academicYearId: string) {
  return useQuery({
    queryKey: qk.feeStructure({ classId, academicYearId }),
    queryFn: () => apiClient.get('/fees/structure', { params: { classId, academicYearId } }).then(extractData),
    enabled: !!(classId && academicYearId),
  });
}

export function useCreateFeeStructure() {
  return useMutate(
    (data: unknown) => apiClient.post('/fees/structure', data).then(extractData),
    { successMsg: 'Fee structure saved' },
  );
}

export function useDefaulters(page = 1, limit = 20) {
  return useQuery({
    queryKey: qk.defaulters({ page, limit }),
    queryFn: () => apiClient.get('/fees/defaulters', { params: { page, limit } }).then(extractData),
  });
}

export function useStudentFees(studentId: string) {
  return useQuery<{ student: Student; dues: FeeDue[]; totalDue: number; totalPaid: number }>({
    queryKey: qk.fees(studentId),
    queryFn: () => apiClient.get(`/fees/student/${studentId}/dues`).then(extractData),
    enabled: !!studentId,
  });
}

export function useFeeHistory(studentId: string) {
  return useQuery<FeePayment[]>({
    queryKey: qk.feeHistory(studentId),
    queryFn: () => apiClient.get(`/fees/student/${studentId}/history`).then(extractData),
    enabled: !!studentId,
  });
}

export function useCollectFee() {
  return useMutate(
    (data: unknown) => apiClient.post('/fees/collect', data).then(extractData),
    { successMsg: 'Payment recorded' },
  );
}

export function useInitiateOnlinePayment() {
  return useMutate(
    (data: unknown) => apiClient.post('/fees/pay-online', data).then(extractData),
  );
}

// ── Assignments ───────────────────────────────────────────────
export function useAssignments(params?: Record<string, unknown>) {
  return useQuery<Assignment[]>({
    queryKey: qk.assignments(params),
    queryFn: () => apiClient.get('/assignments', { params }).then(extractData),
  });
}

export function useCreateAssignment() {
  return useMutate(
    (data: unknown) => apiClient.post('/assignments', data).then(extractData),
    { successMsg: 'Assignment created', invalidate: [qk.assignments()] },
  );
}

export function useSubmitAssignment(assignmentId: string) {
  return useMutate(
    (formData: FormData) =>
      apiClient.post(`/assignments/${assignmentId}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then(extractData),
    { successMsg: 'Assignment submitted!', invalidate: [qk.assignments()] },
  );
}

export function useAssignmentSubmissions(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId, 'submissions'],
    queryFn: () => apiClient.get(`/assignments/${assignmentId}/submissions`).then(extractData),
    enabled: !!assignmentId,
  });
}

export function useGradeSubmission() {
  return useMutate(
    ({ submissionId, ...data }: { submissionId: string; marksObtained: number; feedback?: string }) =>
      apiClient.put(`/assignments/submissions/${submissionId}/grade`, data).then(extractData),
    { successMsg: 'Graded successfully' },
  );
}

// ── Library ───────────────────────────────────────────────────
export function useBooks(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.books(params),
    queryFn: () => apiClient.get('/library/books', { params }).then((r) => r.data),
  });
}

export function useIssuedBooks(studentId: string) {
  return useQuery<BookIssue[]>({
    queryKey: ['library', 'issued', studentId],
    queryFn: () => apiClient.get(`/library/issued/${studentId}`).then(extractData),
    enabled: !!studentId,
  });
}

export function useIssueBook() {
  return useMutate(
    (data: unknown) => apiClient.post('/library/issue', data).then(extractData),
    { successMsg: 'Book issued', invalidate: [qk.books()] },
  );
}

export function useReturnBook() {
  return useMutate(
    (data: unknown) => apiClient.post('/library/return', data).then(extractData),
    { successMsg: 'Book returned', invalidate: [qk.books()] },
  );
}

export function useCreateBook() {
  return useMutate(
    (data: Partial<Book>) => apiClient.post('/library/books', data).then(extractData),
    { successMsg: 'Book added', invalidate: [qk.books()] },
  );
}

export function useUpdateBook(bookId: string) {
  return useMutate(
    (data: Partial<Book>) => apiClient.put(`/library/books/${bookId}`, data).then(extractData),
    { successMsg: 'Book updated', invalidate: [qk.books(), ['books', bookId]] },
  );
}

export function useDeleteBook(bookId: string) {
  return useMutate(
    () => apiClient.delete(`/library/books/${bookId}`).then(extractData),
    { successMsg: 'Book deleted', invalidate: [qk.books(), ['books', bookId]] },
  );
}

// ── Notices ───────────────────────────────────────────────────
export function useNotices(params?: Record<string, unknown>) {
  return useQuery<Notice[]>({
    queryKey: qk.notices(params),
    queryFn: () => apiClient.get('/notices', { params }).then(extractData),
  });
}

export function useCreateNotice() {
  return useMutate(
    (data: unknown) => apiClient.post('/notices', data).then(extractData),
    { successMsg: 'Notice published', invalidate: [qk.notices()] },
  );
}

// ── Grievances ────────────────────────────────────────────────
export function useGrievances(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.grievances(params),
    queryFn: () => apiClient.get('/grievances', { params }).then(extractData),
  });
}

export function useSubmitGrievance() {
  return useMutate(
    (data: unknown) => apiClient.post('/grievances', data).then(extractData),
    { successMsg: 'Grievance submitted. Ticket number sent to your email.' },
  );
}

// ── HR / Leaves ───────────────────────────────────────────────
export function useLeaveRequests(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.leaveRequests(params),
    queryFn: () => apiClient.get('/hr/leaves', { params }).then(extractData),
  });
}

export function useApplyStaffLeave() {
  return useMutate(
    (data: unknown) => apiClient.post('/hr/leaves', data).then(extractData),
    { successMsg: 'Leave request submitted', invalidate: [qk.leaveRequests()] },
  );
}

export function useApproveLeave() {
  return useMutate(
    ({ id, ...data }: { id: string; status: string; remarks?: string }) =>
      apiClient.put(`/hr/leaves/${id}/approve`, data).then(extractData),
    { successMsg: 'Leave updated', invalidate: [qk.leaveRequests()] },
  );
}

// ── Notifications ─────────────────────────────────────────────
export function useNotificationStats() {
  return useQuery({
    queryKey: ['notifications', 'stats'],
    queryFn: () => apiClient.get('/notifications/stats').then(extractData),
  });
}

export function useSendBulkNotification() {
  return useMutate(
    (data: unknown) => apiClient.post('/notifications/bulk', data).then(extractData),
    { successMsg: 'Notifications queued for delivery' },
  );
}

// ── Settings ───────────────────────────────────────────────────
export function useMySettings() {
  return useQuery({
    queryKey: ['settings', 'me'],
    queryFn: () => apiClient.get('/settings/me').then(extractData),
  });
}

export function useUpdateMySettings() {
  return useMutate(
    (data: { name?: string; phone?: string; avatar?: string; address?: string }) =>
      apiClient.put('/settings/me', data).then(extractData),
    { successMsg: 'Profile updated', invalidate: [['settings', 'me']] },
  );
}

export function useInstitutionSettings() {
  return useQuery({
    queryKey: ['settings', 'institution'],
    queryFn: () => apiClient.get('/settings/institution').then(extractData),
  });
}

export function useUpdateInstitutionSettings() {
  return useMutate(
    (data: any) => apiClient.put('/settings/institution', data).then(extractData),
    { successMsg: 'Institution updated', invalidate: [['settings', 'institution']] },
  );
}

export function useSecuritySettings() {
  return useQuery({
    queryKey: ['settings', 'security'],
    queryFn: () => apiClient.get('/settings/security').then(extractData),
  });
}

export function useNotificationStatus() {
  return useQuery({
    queryKey: ['settings', 'notifications', 'status'],
    queryFn: () => apiClient.get('/settings/notifications/status').then(extractData),
    refetchInterval: 30_000,
  });
}

export function useTestEmail() {
  return useMutate(
    (data: { to: string; subject?: string; message?: string }) =>
      apiClient.post('/settings/notifications/test-email', data).then(extractData),
    { successMsg: 'Test email queued' },
  );
}

export function useTestSms() {
  return useMutate(
    (data: { to: string; message?: string }) =>
      apiClient.post('/settings/notifications/test-sms', data).then(extractData),
    { successMsg: 'Test SMS queued' },
  );
}

// ── Parents ────────────────────────────────────────────────────
export function useMyParentProfile() {
  return useQuery({
    queryKey: ['parents', 'me'],
    queryFn: () => apiClient.get('/parents/me').then(extractData),
  });
}

export function useParents() {
  return useQuery({
    queryKey: ['parents'],
    queryFn: () => apiClient.get('/parents').then(extractData),
  });
}

export function useCreateParent() {
  return useMutate(
    (data: { name: string; email: string; phone?: string; studentIds?: string[] }) =>
      apiClient.post('/parents', data).then(extractData),
    { successMsg: 'Parent created', invalidate: [['parents']] },
  );
}

export function useLinkParentStudent(parentId: string) {
  return useMutate(
    (data: { studentId: string; relation?: string; isPrimary?: boolean }) =>
      apiClient.post(`/parents/${parentId}/link-student`, data).then(extractData),
    { successMsg: 'Linked', invalidate: [['parents'], ['parents', 'me']] },
  );
}

// ── Materials ──────────────────────────────────────────────────
export function useMaterials(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['materials', params],
    queryFn: () => apiClient.get('/materials', { params }).then(extractData),
  });
}

export function useUploadMaterial() {
  return useMutate(
    (vars: { title: string; description?: string; classId: string; sectionId?: string; subjectId?: string; file: File }) => {
      const fd = new FormData();
      fd.append('title', vars.title);
      if (vars.description) fd.append('description', vars.description);
      fd.append('classId', vars.classId);
      if (vars.sectionId) fd.append('sectionId', vars.sectionId);
      if (vars.subjectId) fd.append('subjectId', vars.subjectId);
      fd.append('file', vars.file);
      return apiClient.post('/materials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }).then(extractData);
    },
    { successMsg: 'Material uploaded', invalidate: [[ 'materials' ]] },
  );
}

export function useDeleteMaterial() {
  return useMutate(
    (id: string) => apiClient.delete(`/materials/${id}`).then(extractData),
    { successMsg: 'Material deleted', invalidate: [[ 'materials' ]] },
  );
}

// ── Hostel ─────────────────────────────────────────────────────
export function useHostelRooms() {
  return useQuery<HostelRoom[]>({
    queryKey: qk.hostelRooms(),
    queryFn: () => apiClient.get('/hostel/rooms').then(extractData),
  });
}

export function useCreateHostelRoom() {
  return useMutate(
    (data: Partial<HostelRoom>) => apiClient.post('/hostel/rooms', data).then(extractData),
    { successMsg: 'Room created', invalidate: [qk.hostelRooms()] },
  );
}

export function useHostelAllocations(status?: string) {
  return useQuery<HostelAllocation[]>({
    queryKey: qk.hostelAllocations(status),
    queryFn: () => apiClient.get('/hostel/allocations', { params: { status } }).then(extractData),
  });
}

export function useAllocateHostel() {
  return useMutate(
    (data: { studentId: string; roomId: string; bedNo?: string; notes?: string }) =>
      apiClient.post('/hostel/allocate', data).then(extractData),
    { successMsg: 'Allocated', invalidate: [qk.hostelRooms(), qk.hostelAllocations('ACTIVE')] },
  );
}

export function useVacateHostel() {
  return useMutate(
    (data: { allocationId: string; notes?: string }) =>
      apiClient.post('/hostel/vacate', data).then(extractData),
    { successMsg: 'Vacated', invalidate: [qk.hostelRooms(), qk.hostelAllocations('ACTIVE'), qk.hostelAllocations('VACATED')] },
  );
}

// ── Admissions ─────────────────────────────────────────────────
export function useAdmissionEnquiries(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.admissionEnquiries(params),
    queryFn: () => apiClient.get('/admissions/enquiries', { params }).then(extractData),
  });
}

export function useCreateAdmissionEnquiry() {
  return useMutate(
    (data: any) => apiClient.post('/admissions/enquiries', data).then(extractData),
    { successMsg: 'Enquiry created', invalidate: [qk.admissionEnquiries()] },
  );
}

export function useUpdateAdmissionEnquiry(id: string) {
  return useMutate(
    (data: any) => apiClient.put(`/admissions/enquiries/${id}`, data).then(extractData),
    { successMsg: 'Enquiry updated', invalidate: [qk.admissionEnquiries()] },
  );
}

export function useAdmissionApplications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: qk.admissionApplications(params),
    queryFn: () => apiClient.get('/admissions/applications', { params }).then(extractData),
  });
}

export function useCreateAdmissionApplication() {
  return useMutate(
    (data: any) => apiClient.post('/admissions/applications', data).then(extractData),
    { successMsg: 'Application created', invalidate: [qk.admissionApplications()] },
  );
}

export function useUpdateAdmissionApplication(id: string) {
  return useMutate(
    (data: any) => apiClient.put(`/admissions/applications/${id}`, data).then(extractData),
    { successMsg: 'Application updated', invalidate: [qk.admissionApplications()] },
  );
}

// ── Transport ──────────────────────────────────────────────────
export function useTransportVehicles() {
  return useQuery({
    queryKey: qk.transportVehicles(),
    queryFn: () => apiClient.get('/transport/vehicles').then(extractData),
  });
}

export function useCreateTransportVehicle() {
  return useMutate(
    (data: any) => apiClient.post('/transport/vehicles', data).then(extractData),
    { successMsg: 'Vehicle created', invalidate: [qk.transportVehicles()] },
  );
}

export function useTransportRoutes() {
  return useQuery({
    queryKey: qk.transportRoutes(),
    queryFn: () => apiClient.get('/transport/routes').then(extractData),
  });
}

export function useCreateTransportRoute() {
  return useMutate(
    (data: any) => apiClient.post('/transport/routes', data).then(extractData),
    { successMsg: 'Route created', invalidate: [qk.transportRoutes()] },
  );
}

export function useAddTransportStop() {
  return useMutate(
    (data: any) => apiClient.post('/transport/stops', data).then(extractData),
    { successMsg: 'Stop added', invalidate: [qk.transportRoutes()] },
  );
}

export function useTransportAssignments(status?: string) {
  return useQuery({
    queryKey: qk.transportAssignments(status),
    queryFn: () => apiClient.get('/transport/assignments', { params: { status } }).then(extractData),
  });
}

export function useStudentTransport(studentId?: string) {
  return useQuery({
    queryKey: ['transport', 'assignments', 'student', studentId],
    queryFn: () => apiClient.get('/transport/assignments', { params: { studentId } }).then(extractData),
    enabled: !!studentId,
  });
}

export function useAssignTransport() {
  return useMutate(
    (data: any) => apiClient.post('/transport/assign', data).then(extractData),
    { successMsg: 'Assigned', invalidate: [qk.transportAssignments('ACTIVE'), qk.transportRoutes()] },
  );
}

export function useUnassignTransport() {
  return useMutate(
    (data: any) => apiClient.post('/transport/unassign', data).then(extractData),
    { successMsg: 'Unassigned', invalidate: [qk.transportAssignments('ACTIVE'), qk.transportAssignments('INACTIVE'), qk.transportRoutes()] },
  );
}
