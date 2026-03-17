// ─── Common ───────────────────────────────────────────────────
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

// ─── Auth ──────────────────────────────────────────────────────
export type UserRole =
  | 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'PRINCIPAL' | 'HOD'
  | 'FACULTY' | 'STUDENT' | 'PARENT' | 'ACCOUNTANT'
  | 'LIBRARIAN' | 'HOSTEL_WARDEN' | 'TRANSPORT_MANAGER'
  | 'HR_MANAGER' | 'RECEPTIONIST';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string | null;
  institutionId: string;
}

// ─── Student ──────────────────────────────────────────────────
export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  rollNumber?: string;
  admissionNumber?: string;
  gender: string;
  dateOfBirth: string;
  bloodGroup?: string;
  fatherName?: string;
  fatherPhone?: string;
  parentEmail?: string;
  classId: string;
  sectionId: string;
  isActive: boolean;
  avatar?: string;
  class?: { name: string };
  section?: { name: string };
  createdAt: string;
}

// ─── Faculty ──────────────────────────────────────────────────
export interface Faculty {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  designation?: string;
  employmentType: string;
  experience?: number;
  qualification?: string;
  joiningDate?: string;
  isActive: boolean;
  avatar?: string;
}

// ─── Attendance ───────────────────────────────────────────────
export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' | 'HOLIDAY';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks?: string;
  student?: Pick<Student, 'name' | 'rollNumber'>;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  leave: number;
  percentage: number;
}

// ─── Academic ─────────────────────────────────────────────────
export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface Class {
  id: string;
  name: string;
  orderIndex: number;
  sections?: Section[];
}

export interface Section {
  id: string;
  name: string;
  classId: string;
  maxStrength: number;
  classTeacher?: Pick<Faculty, 'name'>;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  type: string;
  maxMarks: number;
  passMarks: number;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string;
  subject: Pick<Subject, 'name'>;
  faculty: Pick<Faculty, 'name'>;
}

// ─── Exam ─────────────────────────────────────────────────────
export interface Exam {
  id: string;
  name: string;
  examType: string;
  startDate?: string;
  endDate?: string;
}

export interface Grade {
  id: string;
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
  grade?: string;
  isPassed: boolean;
  subject?: Pick<Subject, 'name'>;
  exam?: Pick<Exam, 'name'>;
}

export interface ResultSummary {
  examId: string;
  examName: string;
  subjects: Grade[];
  totalMax: number;
  totalObtained: number;
  percentage: number;
  overallGrade: string;
  isPassed: boolean;
}

// ─── Fee ──────────────────────────────────────────────────────
export interface FeeHead {
  id: string;
  name: string;
  description?: string;
}

export interface FeeDue {
  feeHeadId: string;
  feeHeadName: string;
  totalAmount: number;
  paid: number;
  due: number;
}

export interface FeePayment {
  id: string;
  amount: number;
  paymentMode: string;
  receiptNumber: string;
  status: string;
  paidAt?: string;
  feeHead?: Pick<FeeHead, 'name'>;
}

// ─── Assignment ───────────────────────────────────────────────
export interface Assignment {
  id: string;
  title: string;
  instructions?: string;
  dueDate: string;
  maxMarks?: number;
  submissionType: string;
  subject?: Pick<Subject, 'name'>;
  faculty?: Pick<Faculty, 'name'>;
  submissions?: { id: string; status: string; marksObtained?: number }[];
}

// ─── Library ──────────────────────────────────────────────────
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  category?: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookIssue {
  id: string;
  book: Pick<Book, 'title' | 'author'>;
  issuedAt: string;
  dueDate: string;
  returnedAt?: string;
  fine: number;
}

// ─── Notice ───────────────────────────────────────────────────
export interface Notice {
  id: string;
  title: string;
  body: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
  category: string;
  createdAt: string;
  isRead?: boolean;
  author?: Pick<User, 'name'>;
}

// ─── Analytics ────────────────────────────────────────────────
export interface DashboardKpis {
  totalStudents: number;
  totalFaculty: number;
  totalStaff: number;
  pendingAdmissions: number;
  openGrievances: number;
  monthlyFeeCollection: number;
  todayAttendancePct: number | null;
}

export interface AttendanceTrendPoint {
  date: string;
  present: number;
  absent: number;
  late: number;
  leave: number;
}

export interface FeeCollectionPoint {
  month: number;
  amount: number;
  transactions: number;
}

export interface GradeDistribution {
  grade: string;
  count: number;
}

// ─── Hostel ────────────────────────────────────────────────────
export interface HostelRoom {
  id: string;
  name: string;
  hostelName: string;
  floor?: number | null;
  roomType: string;
  capacity: number;
  isActive: boolean;
  notes?: string | null;
}

export interface HostelAllocation {
  id: string;
  studentId: string;
  roomId: string;
  bedNo?: string | null;
  status: 'ACTIVE' | 'VACATED' | string;
  startDate: string;
  endDate?: string | null;
  student?: Pick<Student, 'id' | 'name' | 'admissionNumber'> & {
    class?: { name: string };
    section?: { name: string };
  };
  room?: Pick<HostelRoom, 'id' | 'name' | 'hostelName'>;
}
