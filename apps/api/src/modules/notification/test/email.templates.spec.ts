import { renderTemplate, renderSms, EMAIL_TEMPLATES } from '../templates/email.templates';
import { NotificationTemplate } from '../dto/notification.dto';

describe('Email Templates', () => {
  const baseVars = {
    institutionName: 'Demo School',
    year: '2024',
  };

  describe('renderTemplate', () => {
    it('substitutes all {{variable}} placeholders', () => {
      const { subject, html } = renderTemplate(NotificationTemplate.ATTENDANCE_ABSENT, {
        ...baseVars,
        studentName: 'Arjun Mehta',
        parentName: 'Rajesh Mehta',
        date: '01 Sep 2024',
        className: 'Class 10-A',
        portalUrl: 'https://school.edu.in/portal',
        teacherName: 'Ms. Priya',
      });

      expect(subject).toContain('Arjun Mehta');
      expect(html).toContain('Arjun Mehta');
      expect(html).toContain('Rajesh Mehta');
      expect(html).toContain('Demo School');
      expect(html).not.toContain('{{studentName}}');
      expect(html).not.toContain('{{parentName}}');
    });

    it('leaves unresolved {{variables}} in place rather than crashing', () => {
      const { html } = renderTemplate(NotificationTemplate.FEE_DUE, {
        ...baseVars,
        parentName: 'Parent',
        studentName: 'Student',
        feeHead: 'Tuition',
        amount: '5000',
        dueDate: '31 Dec 2024',
        // paymentUrl intentionally missing
      });

      expect(html).toContain('{{paymentUrl}}'); // unresolved placeholder preserved
    });

    it('throws for unknown template key', () => {
      expect(() => renderTemplate('INVALID_TEMPLATE', {})).toThrow('Email template not found');
    });

    it('all 18 templates render without throwing', () => {
      const defaultVars = {
        ...baseVars,
        studentName: 'Student', parentName: 'Parent', teacherName: 'Teacher',
        date: '2024-09-01', className: 'Class 10', amount: '5000', dueDate: '2024-12-31',
        receiptNumber: 'RCP-2024-0001', paymentMode: 'Online', paymentDate: '2024-09-01',
        subjectName: 'Mathematics', examDate: '2024-09-10', examTime: '10:00 AM',
        venue: 'Hall A', maxMarks: '100', examType: 'Mid-term',
        staffName: 'Teacher', leaveType: 'CL', fromDate: '2024-09-05', toDate: '2024-09-07',
        days: '3', approverName: 'Principal', monthYear: 'August 2024',
        grossEarnings: '50000', totalDeductions: '5000', netSalary: '45000',
        noticeTitle: 'Notice Title', noticeBody: 'Notice content here',
        category: 'GENERAL', priority: 'NORMAL', authorName: 'Admin',
        otp: '123456', name: 'User', totalObtained: '75', totalMax: '100',
        percentage: '75', overallGrade: 'B+', result: 'PASS', resultBadgeClass: 'badge-success',
        examName: 'Mid Term', ticketNumber: 'GRV-2024-001', title: 'Issue',
        status: 'RESOLVED', assignmentTitle: 'HW1', dueTime: '11:59 PM',
        subject: 'Hello', message: 'Message body', employeeId: 'EMP001',
        designation: 'PGT', department: 'Science', email: 'user@school.in',
        tempPassword: 'Temp@1234', admissionNumber: 'ADM-2024-001',
        sectionName: 'A', rollNumber: '001', expiryDate: '2024-12-31',
        daysLeft: '30', lateFeeAmount: '100', overdueDays: '15',
        arrivalTime: '9:30 AM', recipientName: 'Recipient',
        loginUrl: 'https://school.edu.in', paymentUrl: 'https://school.edu.in/pay',
        receiptUrl: 'https://school.edu.in/receipt', portalUrl: 'https://school.edu.in',
        reportCardUrl: 'https://school.edu.in/rc', hallTicketUrl: 'https://school.edu.in/ht',
        payslipUrl: 'https://school.edu.in/payslip', submitUrl: 'https://school.edu.in/submit',
      };

      const templates = Object.values(NotificationTemplate);
      for (const tpl of templates) {
        expect(() => renderTemplate(tpl, defaultVars)).not.toThrow();
      }
    });
  });

  describe('renderSms', () => {
    it('renders SMS template with variables', () => {
      const result = renderSms(NotificationTemplate.ATTENDANCE_ABSENT, {
        institutionName: 'Demo School',
        studentName: 'Arjun',
        date: '01 Sep 2024',
      });

      expect(result).toContain('Demo School');
      expect(result).toContain('Arjun');
      expect(result).not.toContain('{{');
    });

    it('falls back to message variable for unknown templates', () => {
      const result = renderSms('UNKNOWN_TEMPLATE', { message: 'Fallback message' });
      expect(result).toBe('Fallback message');
    });

    it('renders FEE_DUE SMS correctly', () => {
      const result = renderSms(NotificationTemplate.FEE_DUE, {
        institutionName: 'ABC School',
        studentName: 'Priya',
        amount: '5000',
        dueDate: '31 Dec 2024',
        paymentUrl: 'https://school.in/pay',
      });
      expect(result).toContain('Rs.5000');
      expect(result).toContain('Priya');
    });
  });

  describe('Template HTML structure', () => {
    it('all templates produce valid HTML with DOCTYPE', () => {
      const { html } = renderTemplate(NotificationTemplate.WELCOME_STUDENT, {
        institutionName: 'Test School', year: '2024',
        studentName: 'Test', admissionNumber: 'ADM-001',
        className: '10', sectionName: 'A', rollNumber: '001',
        email: 'test@school.in', tempPassword: 'Test@123', loginUrl: 'https://school.in',
      });
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html>');
      expect(html).toContain('</html>');
    });

    it('templates contain unsubscribe footer text', () => {
      const { html } = renderTemplate(NotificationTemplate.NEW_NOTICE, {
        institutionName: 'Test School', year: '2024',
        noticeTitle: 'Test', noticeBody: 'Body', authorName: 'Admin',
        recipientName: 'Student', category: 'GENERAL', priority: 'NORMAL',
        portalUrl: 'https://school.in',
      });
      expect(html).toContain('automated message');
    });
  });
});
