import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Roles ────────────────────────────────────────────────────
  const roles = [
    { name: 'SUPER_ADMIN', description: 'Full system access' },
    { name: 'INSTITUTION_ADMIN', description: 'Institution-level admin' },
    { name: 'PRINCIPAL', description: 'School principal' },
    { name: 'HOD', description: 'Head of Department' },
    { name: 'FACULTY', description: 'Teaching staff' },
    { name: 'STUDENT', description: 'Student user' },
    { name: 'PARENT', description: 'Parent / guardian' },
    { name: 'ACCOUNTANT', description: 'Finance department' },
    { name: 'LIBRARIAN', description: 'Library management' },
    { name: 'HOSTEL_WARDEN', description: 'Hostel management' },
    { name: 'TRANSPORT_MANAGER', description: 'Transport management' },
    { name: 'HR_MANAGER', description: 'HR and payroll' },
    { name: 'RECEPTIONIST', description: 'Front desk staff' },
  ];

  const createdRoles: Record<string, { id: string; name: string }> = {};
  for (const role of roles) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    createdRoles[role.name] = r;
    console.log(`  ✓ Role: ${role.name}`);
  }

  // ── Default Institution ───────────────────────────────────────
  const institution = await prisma.institution.upsert({
    where: { id: 'inst-default-001' },
    update: {},
    create: {
      id: 'inst-default-001',
      name: 'Demo School',
      address: '123 School Lane, Mumbai, Maharashtra 400001',
      phone: '+91-22-12345678',
      email: 'admin@demoschool.edu.in',
      website: 'https://demoschool.edu.in',
      board: 'CBSE',
      affiliationNo: 'CBSE-1234567',
    },
  });
  console.log(`  ✓ Institution: ${institution.name}`);

  // ── Super Admin User ──────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@school.edu.in';
  const adminPass  = process.env.SEED_ADMIN_PASSWORD || 'Admin@1234';
  const hashedPass = await bcrypt.hash(adminPass, 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPass,
      name: 'Super Administrator',
      roleId: createdRoles['SUPER_ADMIN'].id,
      institutionId: institution.id,
      isActive: true,
    },
  });
  console.log(`  ✓ Super Admin: ${superAdmin.email} / ${adminPass}`);

  // ── Academic Year ─────────────────────────────────────────────
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'ay-2024-25' },
    update: {},
    create: {
      id: 'ay-2024-25',
      name: '2024-25',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      isCurrent: true,
      institutionId: institution.id,
    },
  });
  console.log(`  ✓ Academic Year: ${academicYear.name}`);

  // ── Classes ───────────────────────────────────────────────────
  const classNames = [
    'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10',
    'Class 11 Science', 'Class 11 Commerce', 'Class 12 Science', 'Class 12 Commerce',
  ];

  const classes: Record<string, { id: string; name: string }> = {};
  for (let i = 0; i < classNames.length; i++) {
    const cls = await prisma.class.upsert({
      where: { id: `cls-${i + 1}` },
      update: {},
      create: {
        id: `cls-${i + 1}`,
        name: classNames[i],
        orderIndex: i + 1,
        academicYearId: academicYear.id,
        institutionId: institution.id,
      },
    });
    classes[cls.name] = cls;
  }
  console.log(`  ✓ ${classNames.length} classes created`);

  // ── Sections for Class 10 (demo) ──────────────────────────────
  const class10 = classes['Class 10'];
  const sectionNames = ['A', 'B', 'C'];
  const sections: { id: string; name: string }[] = [];

  for (const sName of sectionNames) {
    const sec = await prisma.section.upsert({
      where: { id: `sec-10-${sName}` },
      update: {},
      create: {
        id: `sec-10-${sName}`,
        name: sName,
        classId: class10.id,
        maxStrength: 40,
      },
    });
    sections.push(sec);
  }
  console.log(`  ✓ Sections A, B, C created for Class 10`);

  // ── Subjects for Class 10 ─────────────────────────────────────
  const subjectDefs = [
    { name: 'Mathematics', code: 'MATH10', maxMarks: 100, passMarks: 33 },
    { name: 'Science', code: 'SCI10', maxMarks: 100, passMarks: 33 },
    { name: 'English', code: 'ENG10', maxMarks: 100, passMarks: 33 },
    { name: 'Social Science', code: 'SST10', maxMarks: 100, passMarks: 33 },
    { name: 'Hindi', code: 'HIN10', maxMarks: 100, passMarks: 33 },
  ];

  const subjects: { id: string; name: string }[] = [];
  for (const sub of subjectDefs) {
    const s = await prisma.subject.upsert({
      where: { id: `sub-10-${sub.code}` },
      update: {},
      create: {
        id: `sub-10-${sub.code}`,
        ...sub,
        classId: class10.id,
        institutionId: institution.id,
        weeklyPeriods: 6,
      },
    });
    subjects.push(s);
  }
  console.log(`  ✓ ${subjectDefs.length} subjects created for Class 10`);

  // ── Demo Faculty ──────────────────────────────────────────────
  const facultyData = [
    { name: 'Dr. Priya Sharma', email: 'priya.sharma@demoschool.edu.in', subject: 'Mathematics', dept: 'Science' },
    { name: 'Mr. Rahul Verma', email: 'rahul.verma@demoschool.edu.in', subject: 'Science', dept: 'Science' },
    { name: 'Ms. Anita Patel', email: 'anita.patel@demoschool.edu.in', subject: 'English', dept: 'Humanities' },
    { name: 'Mr. Suresh Kumar', email: 'suresh.kumar@demoschool.edu.in', subject: 'Social Science', dept: 'Humanities' },
    { name: 'Ms. Kavita Singh', email: 'kavita.singh@demoschool.edu.in', subject: 'Hindi', dept: 'Languages' },
  ];

  const createdFaculty: { id: string; name: string }[] = [];
  for (let i = 0; i < facultyData.length; i++) {
    const fd = facultyData[i];
    const tempPass = await bcrypt.hash('Faculty@2024', 12);
    const existingUser = await prisma.user.findUnique({ where: { email: fd.email } });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const u = await prisma.user.create({
        data: {
          email: fd.email,
          password: tempPass,
          name: fd.name,
          roleId: createdRoles['FACULTY'].id,
          institutionId: institution.id,
          isActive: true,
        },
      });
      userId = u.id;
    }

    const fac = await prisma.faculty.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        institutionId: institution.id,
        name: fd.name,
        email: fd.email,
        department: fd.dept,
        designation: 'PGT',
        employmentType: 'FULL_TIME',
        joiningDate: new Date('2020-06-01'),
        isActive: true,
      },
    });
    createdFaculty.push(fac);
  }
  console.log(`  ✓ ${facultyData.length} faculty members created`);

  // ── Section class teacher assignment ─────────────────────────
  await prisma.section.update({
    where: { id: sections[0].id },
    data: { classTeacherId: createdFaculty[0].id },
  });

  // ── Faculty assignments (subject → class 10 section A) ────────
  for (let i = 0; i < subjects.length && i < createdFaculty.length; i++) {
    await prisma.facultyAssignment.upsert({
      where: { id: `fa-${i}` },
      update: {},
      create: {
        id: `fa-${i}`,
        facultyId: createdFaculty[i].id,
        subjectId: subjects[i].id,
        classId: class10.id,
        sectionId: sections[0].id,
        academicYearId: academicYear.id,
      },
    });
  }
  console.log(`  ✓ Faculty-subject assignments created`);

  // ── Demo Students ─────────────────────────────────────────────
  const studentData = [
    { name: 'Arjun Mehta', email: 'arjun.mehta@student.school.in', roll: '1001', dob: '2008-05-12', gender: 'MALE', father: 'Rajesh Mehta', fPhone: '+919876543210', parentEmail: 'rajesh.mehta@gmail.com' },
    { name: 'Priya Nair', email: 'priya.nair@student.school.in', roll: '1002', dob: '2008-07-22', gender: 'FEMALE', father: 'Vijay Nair', fPhone: '+919876543211', parentEmail: 'vijay.nair@gmail.com' },
    { name: 'Rohan Das', email: 'rohan.das@student.school.in', roll: '1003', dob: '2008-03-15', gender: 'MALE', father: 'Sunil Das', fPhone: '+919876543212', parentEmail: 'sunil.das@gmail.com' },
    { name: 'Sneha Iyer', email: 'sneha.iyer@student.school.in', roll: '1004', dob: '2008-09-01', gender: 'FEMALE', father: 'Mohan Iyer', fPhone: '+919876543213', parentEmail: 'mohan.iyer@gmail.com' },
    { name: 'Karan Gupta', email: 'karan.gupta@student.school.in', roll: '1005', dob: '2008-11-28', gender: 'MALE', father: 'Ashok Gupta', fPhone: '+919876543214', parentEmail: 'ashok.gupta@gmail.com' },
  ];

  for (let i = 0; i < studentData.length; i++) {
    const sd = studentData[i];
    const tempPass = await bcrypt.hash(`Student@${new Date(sd.dob).getFullYear()}`, 12);
    const existingUser = await prisma.user.findUnique({ where: { email: sd.email } });

    let userId: string;
    if (existingUser) {
      userId = existingUser.id;
    } else {
      const u = await prisma.user.create({
        data: {
          email: sd.email,
          password: tempPass,
          name: sd.name,
          roleId: createdRoles['STUDENT'].id,
          institutionId: institution.id,
          isActive: true,
        },
      });
      userId = u.id;
    }

    await prisma.student.upsert({
      where: { admissionNumber: `ADM-2024-${String(i + 1).padStart(4, '0')}` },
      update: {},
      create: {
        userId,
        institutionId: institution.id,
        name: sd.name,
        email: sd.email,
        dateOfBirth: new Date(sd.dob),
        gender: sd.gender,
        classId: class10.id,
        sectionId: sections[0].id,
        admissionNumber: `ADM-2024-${String(i + 1).padStart(4, '0')}`,
        rollNumber: sd.roll,
        fatherName: sd.father,
        fatherPhone: sd.fPhone,
        parentEmail: sd.parentEmail,
        isActive: true,
      },
    });
  }
  console.log(`  ✓ ${studentData.length} demo students created`);

  // ── Fee Heads ─────────────────────────────────────────────────
  const feeHeads = [
    { id: 'fh-tuition', name: 'Tuition Fee', description: 'Monthly tuition charges' },
    { id: 'fh-library', name: 'Library Fee', description: 'Annual library access' },
    { id: 'fh-sports', name: 'Sports Fee', description: 'Sports & activities' },
    { id: 'fh-lab', name: 'Laboratory Fee', description: 'Science lab charges' },
    { id: 'fh-exam', name: 'Examination Fee', description: 'Term exam charges' },
  ];

  for (const fh of feeHeads) {
    await prisma.feeHead.upsert({
      where: { id: fh.id },
      update: {},
      create: { ...fh, institutionId: institution.id },
    });
  }
  console.log(`  ✓ ${feeHeads.length} fee heads created`);

  // ── Fee Structure for Class 10 ────────────────────────────────
  const existingStructure = await prisma.feeStructure.findFirst({
    where: { classId: class10.id, academicYearId: academicYear.id },
  });

  if (!existingStructure) {
    const feeStructure = await prisma.feeStructure.create({
      data: {
        classId: class10.id,
        academicYearId: academicYear.id,
        institutionId: institution.id,
        frequency: 'ANNUAL',
        lateFeePerDay: 10,
        dueDate: new Date('2024-05-31'),
      },
    });

    const feeAmounts: Record<string, number> = {
      'fh-tuition': 48000,
      'fh-library': 2000,
      'fh-sports': 3000,
      'fh-lab': 4000,
      'fh-exam': 3000,
    };

    for (const [feeHeadId, amount] of Object.entries(feeAmounts)) {
      await prisma.feeStructureItem.create({
        data: { feeStructureId: feeStructure.id, feeHeadId, amount },
      });
    }
    console.log(`  ✓ Fee structure created for Class 10 (total ₹${Object.values(feeAmounts).reduce((a, b) => a + b, 0).toLocaleString()})`);
  }

  // ── Demo Exam ─────────────────────────────────────────────────
  const exam = await prisma.exam.upsert({
    where: { id: 'exam-mid-2024' },
    update: {},
    create: {
      id: 'exam-mid-2024',
      name: 'Mid-Term Examination 2024',
      examType: 'MID_TERM',
      academicYearId: academicYear.id,
      institutionId: institution.id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-09-10'),
      description: 'Mid-term examinations for all classes',
    },
  });
  console.log(`  ✓ Demo exam: ${exam.name}`);

  // ── Demo Books ────────────────────────────────────────────────
  const books = [
    { title: 'NCERT Mathematics Class 10', author: 'NCERT', isbn: '978-81-7450-694-3', category: 'Textbook', totalCopies: 10 },
    { title: 'NCERT Science Class 10', author: 'NCERT', isbn: '978-81-7450-695-0', category: 'Textbook', totalCopies: 10 },
    { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', isbn: '978-81-7371-146-6', category: 'Biography', totalCopies: 5 },
    { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0-06-231500-7', category: 'Fiction', totalCopies: 5 },
    { title: 'Harry Potter and the Philosopher Stone', author: 'J.K. Rowling', isbn: '978-0-7475-3269-9', category: 'Fiction', totalCopies: 8 },
  ];

  for (const book of books) {
    await prisma.book.upsert({
      where: { id: `book-${book.isbn?.replace(/[^a-zA-Z0-9]/g, '')}` },
      update: {},
      create: {
        id: `book-${book.isbn?.replace(/[^a-zA-Z0-9]/g, '')}`,
        ...book,
        availableCopies: book.totalCopies,
        institutionId: institution.id,
      },
    });
  }
  console.log(`  ✓ ${books.length} demo books added to library`);

  // ── Holiday Calendar ──────────────────────────────────────────
  const holidays = [
    { name: 'Republic Day', date: '2025-01-26', type: 'NATIONAL' },
    { name: 'Holi', date: '2025-03-14', type: 'STATE' },
    { name: 'Good Friday', date: '2025-04-18', type: 'NATIONAL' },
    { name: 'Independence Day', date: '2025-08-15', type: 'NATIONAL' },
    { name: 'Gandhi Jayanti', date: '2025-10-02', type: 'NATIONAL' },
    { name: 'Diwali', date: '2025-10-20', type: 'STATE' },
    { name: 'Christmas', date: '2025-12-25', type: 'NATIONAL' },
  ];

  for (const h of holidays) {
    await prisma.holiday.upsert({
      where: { id: `hol-${h.date}` },
      update: {},
      create: {
        id: `hol-${h.date}`,
        name: h.name,
        date: new Date(h.date),
        type: h.type,
        institutionId: institution.id,
      },
    });
  }
  console.log(`  ✓ ${holidays.length} holidays added`);

  // ── Parent accounts (linked to demo students) ────────────────
  const parentPass = process.env.SEED_PARENT_PASSWORD || 'Parent@2024';
  const parentHash = await bcrypt.hash(parentPass, 12);

  const demoStudents = await prisma.student.findMany({
    where: { institutionId: institution.id, classId: class10.id, sectionId: sections[0].id, deletedAt: null },
    orderBy: { createdAt: 'asc' },
    take: 5,
    select: { id: true, name: true },
  });

  const parent1User = await prisma.user.upsert({
    where: { email: 'parent1@demoschool.edu.in' },
    update: {},
    create: {
      email: 'parent1@demoschool.edu.in',
      password: parentHash,
      name: 'Mr. Rajesh Mehta',
      roleId: createdRoles['PARENT'].id,
      institutionId: institution.id,
      isActive: true,
    },
  });
  const parent1 = await prisma.parent.upsert({
    where: { userId: parent1User.id },
    update: {},
    create: {
      userId: parent1User.id,
      institutionId: institution.id,
      name: parent1User.name,
      email: parent1User.email,
      phone: '+919800000001',
      isActive: true,
    },
  });

  const parent2User = await prisma.user.upsert({
    where: { email: 'parent2@demoschool.edu.in' },
    update: {},
    create: {
      email: 'parent2@demoschool.edu.in',
      password: parentHash,
      name: 'Mrs. Vijaya Nair',
      roleId: createdRoles['PARENT'].id,
      institutionId: institution.id,
      isActive: true,
    },
  });
  const parent2 = await prisma.parent.upsert({
    where: { userId: parent2User.id },
    update: {},
    create: {
      userId: parent2User.id,
      institutionId: institution.id,
      name: parent2User.name,
      email: parent2User.email,
      phone: '+919800000002',
      isActive: true,
    },
  });

  if (demoStudents.length) {
    await prisma.parentStudent.createMany({
      data: [
        { institutionId: institution.id, parentId: parent1.id, studentId: demoStudents[0].id, relation: 'FATHER', isPrimary: true },
        ...(demoStudents[1] ? [{ institutionId: institution.id, parentId: parent2.id, studentId: demoStudents[1].id, relation: 'MOTHER', isPrimary: true }] : []),
        ...(demoStudents[2] ? [{ institutionId: institution.id, parentId: parent2.id, studentId: demoStudents[2].id, relation: 'MOTHER', isPrimary: false }] : []),
      ],
      skipDuplicates: true,
    });
  }
  console.log('  ✓ Parent accounts created + linked');

  // ── Timetable slots (Class 10-A, Mon-Fri) ────────────────────
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
  const periods = [
    { start: '09:00', end: '09:45' },
    { start: '09:50', end: '10:35' },
    { start: '10:40', end: '11:25' },
    { start: '11:30', end: '12:15' },
    { start: '12:20', end: '13:05' },
  ];

  const subjectToFaculty: Record<string, string> = {};
  for (let i = 0; i < subjects.length && i < createdFaculty.length; i++) {
    subjectToFaculty[subjects[i].id] = createdFaculty[i].id;
  }

  for (const d of days) {
    for (let p = 0; p < periods.length; p++) {
      const subj = subjects[p % subjects.length];
      const facId = subjectToFaculty[subj.id] || createdFaculty[0].id;
      const key = `tt-${d}-${p + 1}`;
      const existing = await prisma.timetableSlot.findFirst({
        where: { institutionId: institution.id, academicYearId: academicYear.id, classId: class10.id, sectionId: sections[0].id, day: d, startTime: periods[p].start, endTime: periods[p].end },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.timetableSlot.create({
        data: {
          day: d,
          startTime: periods[p].start,
          endTime: periods[p].end,
          classId: class10.id,
          sectionId: sections[0].id,
          subjectId: subj.id,
          facultyId: facId,
          academicYearId: academicYear.id,
          room: `10-${sections[0].name}`,
          institutionId: institution.id,
        },
      });
    }
  }
  console.log('  ✓ Timetable slots created for Class 10-A');

  // ── Assignments + submissions ────────────────────────────────
  for (let i = 0; i < subjects.length; i++) {
    const subj = subjects[i];
    const facId = subjectToFaculty[subj.id] || createdFaculty[0].id;

    const existing = await prisma.assignment.findFirst({
      where: { institutionId: institution.id, classId: class10.id, sectionId: sections[0].id, subjectId: subj.id, title: `Homework 1 — ${subj.name}` },
      select: { id: true },
    });
    if (existing) continue;

    const a = await prisma.assignment.create({
      data: {
        title: `Homework 1 — ${subj.name}`,
        instructions: 'Solve the questions from the worksheet uploaded in Materials.',
        classId: class10.id,
        sectionId: sections[0].id,
        subjectId: subj.id,
        facultyId: facId,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        maxMarks: 10,
        submissionType: 'TEXT',
        institutionId: institution.id,
      },
    });

    for (const s of demoStudents.slice(0, 3)) {
      const existingSub = await prisma.assignmentSubmission.findFirst({
        where: { assignmentId: a.id, studentId: s.id },
        select: { id: true },
      });
      if (existingSub) continue;
      await prisma.assignmentSubmission.create({
        data: {
          assignmentId: a.id,
          studentId: s.id,
          textContent: `My answers for ${subj.name}.`,
          submittedAt: new Date(),
          status: 'SUBMITTED',
          marksObtained: i % 2 === 0 ? 8 : 7,
          feedback: 'Good work. Improve presentation.',
          gradedById: superAdmin.id,
          gradedAt: new Date(),
        },
      });
    }
  }
  console.log('  ✓ Assignments + submissions created');

  // ── Attendance records (last 10 days, Mathematics) ───────────
  const math = subjects.find((s) => s.name.toLowerCase().includes('math')) || subjects[0];
  for (let d = 1; d <= 10; d++) {
    const date = new Date();
    date.setDate(date.getDate() - d);
    date.setHours(0, 0, 0, 0);
    for (const s of demoStudents) {
      const status = Math.random() < 0.1 ? 'ABSENT' : 'PRESENT';
      await prisma.attendanceRecord.upsert({
        where: { studentId_subjectId_date: { studentId: s.id, subjectId: math.id, date } },
        update: { status },
        create: {
          studentId: s.id,
          classId: class10.id,
          sectionId: sections[0].id,
          subjectId: math.id,
          academicYearId: academicYear.id,
          date,
          status,
          markedById: superAdmin.id,
        },
      });
    }
  }
  console.log('  ✓ Attendance records created');

  // ── Fee payments (partial) ───────────────────────────────────
  const tuition = await prisma.feeHead.findFirst({ where: { id: 'fh-tuition' } });
  if (tuition) {
    for (let i = 0; i < demoStudents.length; i++) {
      const s = demoStudents[i];
      const paid = i < 2;
      const receiptNumber = `RCPT-${new Date().getFullYear()}-${String(i + 1).padStart(4, '0')}`;
      const existing = await prisma.feePayment.findFirst({
        where: { institutionId: institution.id, studentId: s.id, feeHeadId: tuition.id, receiptNumber },
        select: { id: true },
      });
      if (existing) continue;
      await prisma.feePayment.create({
        data: {
          studentId: s.id,
          feeHeadId: tuition.id,
          amount: paid ? 48000 : 0,
          paymentMode: paid ? 'CASH' : 'PENDING',
          receiptNumber,
          status: paid ? 'PAID' : 'PENDING',
          paidAt: paid ? new Date() : null,
          collectedById: paid ? superAdmin.id : null,
          institutionId: institution.id,
          remarks: paid ? 'Seed payment' : 'Pending',
        },
      });
    }
  }
  console.log('  ✓ Fee payments created');

  // ── Library issues (one active issue) ────────────────────────
  const anyBook = await prisma.book.findFirst({ where: { institutionId: institution.id }, select: { id: true } });
  if (anyBook && demoStudents[0]) {
    const existing = await prisma.bookIssue.findFirst({
      where: { studentId: demoStudents[0].id, bookId: anyBook.id, returnedAt: null },
      select: { id: true },
    });
    if (!existing) {
      await prisma.bookIssue.create({
        data: {
          studentId: demoStudents[0].id,
          bookId: anyBook.id,
          issuedById: superAdmin.id,
          institutionId: institution.id,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log('  ✓ Library issue created');

  // ── Exam schedules + grades (non-zero analytics) ─────────────
  for (let i = 0; i < Math.min(3, subjects.length); i++) {
    const subj = subjects[i];
    const existing = await prisma.examSchedule.findFirst({
      where: { examId: exam.id, classId: class10.id, sectionId: sections[0].id, subjectId: subj.id },
      select: { id: true },
    });
    const schedule = existing
      ? await prisma.examSchedule.findUnique({ where: { id: existing.id } })
      : await prisma.examSchedule.create({
        // Prisma checked create input can be stricter in TS; this seed uses unchecked IDs.
        data: ({
          examId: exam.id,
          classId: class10.id,
          sectionId: sections[0].id,
          subjectId: subj.id,
          date: new Date('2024-09-02'),
          startTime: '10:00',
          endTime: '13:00',
          venue: 'Main Hall',
          invigilatorId: createdFaculty[0].id,
          maxMarks: 100,
          isFinalized: true,
          institutionId: institution.id,
        } as any),
      });

    if (!schedule) continue;
    for (let sidx = 0; sidx < demoStudents.length; sidx++) {
      const st = demoStudents[sidx];
      const marks = 45 + (sidx * 7) % 45;
      await prisma.grade.upsert({
        where: { studentId_examScheduleId: { studentId: st.id, examScheduleId: schedule.id } },
        update: {},
        create: {
          studentId: st.id,
          examId: exam.id,
          examScheduleId: schedule.id,
          subjectId: subj.id,
          classId: class10.id,
          sectionId: sections[0].id,
          marksObtained: marks,
          maxMarks: 100,
          isPassed: marks >= 33,
          grade: marks >= 90 ? 'A+' : marks >= 75 ? 'A' : marks >= 60 ? 'B' : marks >= 45 ? 'C' : 'D',
          remarks: 'Seed marks',
          enteredById: superAdmin.id,
        },
      });
    }
  }
  console.log('  ✓ Exam schedules + grades created');

  // ── Study materials (dummy URLs) ─────────────────────────────
  for (let i = 0; i < Math.min(3, subjects.length); i++) {
    const subj = subjects[i];
    const existing = await prisma.studyMaterial.findFirst({
      where: { institutionId: institution.id, classId: class10.id, sectionId: sections[0].id, subjectId: subj.id, title: `Worksheet — ${subj.name}` },
      select: { id: true },
    });
    if (existing) continue;
    await prisma.studyMaterial.create({
      data: {
        institutionId: institution.id,
        uploadedById: superAdmin.id,
        facultyId: createdFaculty[i]?.id,
        title: `Worksheet — ${subj.name}`,
        description: 'Seed material (demo). Replace with real uploads in production.',
        classId: class10.id,
        sectionId: sections[0].id,
        subjectId: subj.id,
        fileName: `worksheet-${subj.id}.pdf`,
        fileKey: `seed/materials/${subj.id}.pdf`,
        fileUrl: `https://example.com/seed/materials/${subj.id}.pdf`,
        isActive: true,
      },
    });
  }
  console.log('  ✓ Study materials created');

  // ── Transport demo ───────────────────────────────────────────
  const vehicle = await prisma.transportVehicle.upsert({
    where: { id: 'veh-01' },
    update: {},
    create: {
      id: 'veh-01',
      institutionId: institution.id,
      vehicleNo: 'MH-01-AB-1234',
      type: 'BUS',
      capacity: 40,
      driverName: 'Sanjay Driver',
      driverPhone: '+919800000010',
      isActive: true,
    },
  });
  const route = await prisma.transportRoute.upsert({
    where: { id: 'route-01' },
    update: {},
    create: {
      id: 'route-01',
      institutionId: institution.id,
      name: 'Route 1 — Andheri',
      vehicleId: vehicle.id,
      isActive: true,
    },
  });
  const stop = await prisma.transportStop.upsert({
    where: { id: 'stop-01' },
    update: {},
    create: {
      id: 'stop-01',
      routeId: route.id,
      name: 'Andheri Station',
      order: 1,
      pickupTime: '07:30',
      dropTime: '14:30',
    },
  });
  if (demoStudents[0]) {
    const existing = await prisma.transportAssignment.findFirst({
      where: { institutionId: institution.id, studentId: demoStudents[0].id, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!existing) {
      await prisma.transportAssignment.create({
        data: {
          institutionId: institution.id,
          studentId: demoStudents[0].id,
          routeId: route.id,
          stopId: stop.id,
          startDate: new Date(),
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log('  ✓ Transport demo created');

  // ── Hostel demo ──────────────────────────────────────────────
  const room = await prisma.hostelRoom.upsert({
    where: { id: 'hostel-room-01' },
    update: {},
    create: {
      id: 'hostel-room-01',
      institutionId: institution.id,
      hostelName: 'Tagore Hostel',
      name: '101',
      capacity: 3,
      roomType: 'SHARED',
      floor: 1,
      isActive: true,
    },
  });
  if (demoStudents[0]) {
    const existing = await prisma.hostelAllocation.findFirst({
      where: { institutionId: institution.id, studentId: demoStudents[0].id, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!existing) {
      await prisma.hostelAllocation.create({
        data: {
          institutionId: institution.id,
          studentId: demoStudents[0].id,
          roomId: room.id,
          startDate: new Date(),
          status: 'ACTIVE',
        },
      });
    }
  }
  console.log('  ✓ Hostel demo created');

  // ── Admissions demo ──────────────────────────────────────────
  const enquiry = await prisma.admissionEnquiry.findFirst({
    where: { institutionId: institution.id, childName: 'Aarav Singh' },
    select: { id: true },
  });
  if (!enquiry) {
    await prisma.admissionEnquiry.create({
      data: {
        institutionId: institution.id,
        childName: 'Aarav Singh',
        parentName: 'Rohit Singh',
        parentPhone: '+919800000020',
        classInterested: 'Class 10',
        source: 'WEBSITE',
        status: 'NEW',
      },
    });
  }
  const application = await prisma.admissionApplication.findFirst({
    where: { institutionId: institution.id, studentName: 'Aarav Singh' },
    select: { id: true },
  });
  if (!application) {
    await prisma.admissionApplication.create({
      data: {
        institutionId: institution.id,
        applicationNo: `APP-${new Date().getFullYear()}-0001`,
        studentName: 'Aarav Singh',
        dateOfBirth: new Date('2010-01-12'),
        classApplied: 'Class 10',
        status: 'SUBMITTED',
      },
    });
  }
  console.log('  ✓ Admissions demo created');

  console.log('\n✅ Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Login credentials:');
  console.log(`  Super Admin  : ${adminEmail} / ${adminPass}`);
  console.log('  Faculty      : priya.sharma@demoschool.edu.in / Faculty@2024');
  console.log('  Student      : arjun.mehta@student.school.in / Student@2008');
  console.log(`  Parent 1     : parent1@demoschool.edu.in / ${parentPass}`);
  console.log(`  Parent 2     : parent2@demoschool.edu.in / ${parentPass}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
