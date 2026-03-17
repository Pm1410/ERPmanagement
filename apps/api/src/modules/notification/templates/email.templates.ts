/**
 * Email HTML templates for every NotificationTemplate type.
 * Uses simple {{variable}} substitution (Handlebars-compatible).
 * All templates are fully self-contained HTML — inline CSS, no external deps.
 */

const BASE_STYLE = `
  <style>
    body { margin:0; padding:0; background:#f1f5f9; font-family:Arial,Helvetica,sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border-radius:8px;
      overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08); }
    .header { background:#1E40AF; padding:28px 32px; text-align:center; }
    .header h1 { color:#ffffff; margin:0; font-size:22px; letter-spacing:-0.3px; }
    .header p  { color:#93C5FD; margin:6px 0 0; font-size:13px; }
    .body { padding:32px; }
    .body h2 { font-size:18px; color:#1e293b; margin:0 0 8px; }
    .body p  { font-size:14px; color:#475569; line-height:1.7; margin:0 0 12px; }
    .highlight { background:#eff6ff; border-left:4px solid #1E40AF;
      border-radius:0 6px 6px 0; padding:12px 16px; margin:16px 0; }
    .highlight p { margin:0; font-size:14px; color:#1e40af; font-weight:600; }
    .btn { display:inline-block; background:#1E40AF; color:#ffffff !important;
      text-decoration:none; padding:10px 24px; border-radius:6px; font-size:14px;
      font-weight:600; margin:16px 0; }
    .table { width:100%; border-collapse:collapse; margin:16px 0; font-size:13px; }
    .table th { background:#f8fafc; padding:8px 12px; text-align:left;
      border-bottom:2px solid #e2e8f0; color:#64748b; font-weight:600; }
    .table td { padding:8px 12px; border-bottom:1px solid #f1f5f9; color:#334155; }
    .badge { display:inline-block; padding:3px 10px; border-radius:9999px;
      font-size:12px; font-weight:600; }
    .badge-success { background:#dcfce7; color:#166534; }
    .badge-danger  { background:#fee2e2; color:#991b1b; }
    .badge-warning { background:#fef9c3; color:#854d0e; }
    .footer { background:#f8fafc; padding:20px 32px; text-align:center; }
    .footer p { font-size:12px; color:#94a3b8; margin:0; }
  </style>
`;

const wrap = (headerTitle: string, headerSub: string, body: string) => `
<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">
<title>${headerTitle}</title>${BASE_STYLE}</head>
<body><div class="wrapper">
  <div class="header"><h1>{{institutionName}}</h1><p>${headerSub}</p></div>
  <div class="body">${body}</div>
  <div class="footer"><p>This is an automated message from {{institutionName}} ERP. Please do not reply.</p>
  <p style="margin-top:6px;">© {{year}} {{institutionName}}</p></div>
</div></body></html>`;

export const EMAIL_TEMPLATES: Record<string, { subject: string; html: string }> = {

  ATTENDANCE_ABSENT: {
    subject: 'Attendance Alert — {{studentName}} was absent today',
    html: wrap('Attendance Alert', 'Student Attendance Notification',
      `<h2>Attendance Alert</h2>
       <p>Dear {{parentName}},</p>
       <p>This is to inform you that <strong>{{studentName}}</strong> was marked <strong>absent</strong> today.</p>
       <div class="highlight"><p>📅 Date: {{date}} &nbsp;&nbsp; 🏫 Class: {{className}}</p></div>
       <p>If this absence was unplanned, please contact the school at your earliest convenience or log in to the parent portal to apply for a leave.</p>
       <a class="btn" href="{{portalUrl}}">Open Parent Portal</a>
       <p>Regards,<br>{{teacherName}}<br>Class Teacher, {{className}}</p>`),
  },

  ATTENDANCE_LATE: {
    subject: '{{studentName}} arrived late today',
    html: wrap('Late Arrival', 'Student Attendance Notification',
      `<h2>Late Arrival Notice</h2>
       <p>Dear {{parentName}},</p>
       <p><strong>{{studentName}}</strong> arrived late to school today at <strong>{{arrivalTime}}</strong>.</p>
       <div class="highlight"><p>📅 Date: {{date}} &nbsp;&nbsp; 🏫 Class: {{className}}</p></div>
       <p>Punctuality is important. Repeated late arrivals may affect your child's attendance record.</p>
       <p>Regards,<br>{{institutionName}} Administration</p>`),
  },

  FEE_DUE: {
    subject: 'Fee Payment Due — {{studentName}}',
    html: wrap('Fee Due Reminder', 'Finance Department',
      `<h2>Fee Payment Reminder</h2>
       <p>Dear {{parentName}},</p>
       <p>This is a gentle reminder that the following fee payment is due for <strong>{{studentName}}</strong>.</p>
       <table class="table">
         <tr><th>Fee Head</th><th>Amount</th><th>Due Date</th></tr>
         <tr><td>{{feeHead}}</td><td>₹{{amount}}</td><td>{{dueDate}}</td></tr>
       </table>
       <p>Please make the payment before the due date to avoid late fees.</p>
       <a class="btn" href="{{paymentUrl}}">Pay Now</a>
       <p>For queries, contact the accounts office.</p>`),
  },

  FEE_RECEIPT: {
    subject: 'Payment Receipt — ₹{{amount}} received',
    html: wrap('Payment Receipt', 'Finance Department',
      `<h2>Payment Confirmation</h2>
       <p>Dear {{parentName}},</p>
       <p>We have received a payment of <strong>₹{{amount}}</strong> for <strong>{{studentName}}</strong>.</p>
       <table class="table">
         <tr><th>Receipt No</th><td>{{receiptNumber}}</td></tr>
         <tr><th>Amount Paid</th><td>₹{{amount}}</td></tr>
         <tr><th>Payment Mode</th><td>{{paymentMode}}</td></tr>
         <tr><th>Date</th><td>{{paymentDate}}</td></tr>
         <tr><th>Fee Head</th><td>{{feeHead}}</td></tr>
       </table>
       <p>Please keep this receipt for your records. You can also download it from the parent portal.</p>
       <a class="btn" href="{{receiptUrl}}">Download Receipt</a>`),
  },

  FEE_OVERDUE: {
    subject: '⚠️ Overdue Fee — Immediate Action Required',
    html: wrap('Overdue Fee Notice', 'Finance Department',
      `<h2>Overdue Fee Notice</h2>
       <p>Dear {{parentName}},</p>
       <p>The following fee for <strong>{{studentName}}</strong> is now overdue by <strong>{{overdueDays}} days</strong>.</p>
       <div class="highlight" style="border-color:#dc2626;background:#fef2f2;">
         <p style="color:#dc2626;">⚠️ Outstanding: ₹{{amount}} &nbsp;&nbsp; Overdue since: {{dueDate}}</p>
       </div>
       <p>A late fee of ₹{{lateFeeAmount}} has been added. Please clear the dues immediately to avoid further penalties.</p>
       <a class="btn" style="background:#dc2626;" href="{{paymentUrl}}">Pay Now</a>`),
  },

  EXAM_REMINDER: {
    subject: '📝 Exam Reminder — {{subjectName}} on {{examDate}}',
    html: wrap('Exam Reminder', 'Academic Department',
      `<h2>Upcoming Exam Reminder</h2>
       <p>Dear {{studentName}},</p>
       <p>This is a reminder about your upcoming examination.</p>
       <table class="table">
         <tr><th>Subject</th><td>{{subjectName}}</td></tr>
         <tr><th>Exam Type</th><td>{{examType}}</td></tr>
         <tr><th>Date</th><td>{{examDate}}</td></tr>
         <tr><th>Time</th><td>{{examTime}}</td></tr>
         <tr><th>Venue / Hall</th><td>{{venue}}</td></tr>
         <tr><th>Max Marks</th><td>{{maxMarks}}</td></tr>
       </table>
       <p>Please bring your hall ticket and valid ID. Report 15 minutes before the exam.</p>
       <a class="btn" href="{{hallTicketUrl}}">Download Hall Ticket</a>`),
  },

  RESULT_PUBLISHED: {
    subject: '📊 Results Published — {{examName}}',
    html: wrap('Results Available', 'Academic Department',
      `<h2>Exam Results Published</h2>
       <p>Dear {{studentName}},</p>
       <p>Results for <strong>{{examName}}</strong> have been published. Here is your summary:</p>
       <table class="table">
         <tr><th>Total Marks</th><td>{{totalObtained}} / {{totalMax}}</td></tr>
         <tr><th>Percentage</th><td>{{percentage}}%</td></tr>
         <tr><th>Grade</th><td>{{overallGrade}}</td></tr>
         <tr><th>Result</th><td><span class="badge {{resultBadgeClass}}">{{result}}</span></td></tr>
       </table>
       <a class="btn" href="{{reportCardUrl}}">View Full Report Card</a>`),
  },

  NEW_NOTICE: {
    subject: '📢 New Notice: {{noticeTitle}}',
    html: wrap('New Notice', 'School Administration',
      `<h2>{{noticeTitle}}</h2>
       <p>Dear {{recipientName}},</p>
       <p>A new notice has been published by <strong>{{authorName}}</strong>.</p>
       <div class="highlight"><p>{{noticeBody}}</p></div>
       <p><strong>Category:</strong> {{category}} &nbsp;&nbsp; <strong>Priority:</strong> {{priority}}</p>
       <a class="btn" href="{{portalUrl}}">View in Portal</a>`),
  },

  LEAVE_APPROVED: {
    subject: '✅ Leave Approved — {{fromDate}} to {{toDate}}',
    html: wrap('Leave Approved', 'HR Department',
      `<h2>Leave Request Approved</h2>
       <p>Dear {{staffName}},</p>
       <p>Your leave request has been <strong>approved</strong>.</p>
       <table class="table">
         <tr><th>Leave Type</th><td>{{leaveType}}</td></tr>
         <tr><th>From</th><td>{{fromDate}}</td></tr>
         <tr><th>To</th><td>{{toDate}}</td></tr>
         <tr><th>Days</th><td>{{days}}</td></tr>
         <tr><th>Approved By</th><td>{{approverName}}</td></tr>
       </table>
       {{#if remarks}}<p><strong>Remarks:</strong> {{remarks}}</p>{{/if}}`),
  },

  LEAVE_REJECTED: {
    subject: '❌ Leave Request Rejected',
    html: wrap('Leave Rejected', 'HR Department',
      `<h2>Leave Request Not Approved</h2>
       <p>Dear {{staffName}},</p>
       <p>Your leave request from <strong>{{fromDate}}</strong> to <strong>{{toDate}}</strong> has been <strong>rejected</strong>.</p>
       {{#if remarks}}<div class="highlight" style="border-color:#dc2626;background:#fef2f2;">
         <p style="color:#dc2626;">Reason: {{remarks}}</p></div>{{/if}}
       <p>Please contact HR or your supervisor for more details.</p>`),
  },

  PASSWORD_RESET_OTP: {
    subject: '🔐 Your Password Reset OTP',
    html: wrap('Password Reset', 'Account Security',
      `<h2>Password Reset Request</h2>
       <p>Dear {{name}},</p>
       <p>We received a request to reset your password. Use the OTP below:</p>
       <div class="highlight" style="text-align:center;">
         <p style="font-size:32px;letter-spacing:8px;font-family:monospace;">{{otp}}</p>
       </div>
       <p><strong>This OTP is valid for 10 minutes.</strong> Do not share it with anyone.</p>
       <p>If you did not request a password reset, please ignore this email.</p>`),
  },

  WELCOME_STUDENT: {
    subject: '🎓 Welcome to {{institutionName}}!',
    html: wrap('Welcome!', 'Student Enrollment',
      `<h2>Welcome, {{studentName}}! 🎉</h2>
       <p>We are delighted to welcome you to <strong>{{institutionName}}</strong>.</p>
       <table class="table">
         <tr><th>Admission Number</th><td>{{admissionNumber}}</td></tr>
         <tr><th>Class</th><td>{{className}} — Section {{sectionName}}</td></tr>
         <tr><th>Roll Number</th><td>{{rollNumber}}</td></tr>
         <tr><th>Login Email</th><td>{{email}}</td></tr>
         <tr><th>Temporary Password</th><td><code>{{tempPassword}}</code></td></tr>
       </table>
       <p>Please log in and change your password immediately.</p>
       <a class="btn" href="{{loginUrl}}">Login to Student Portal</a>`),
  },

  WELCOME_STAFF: {
    subject: '👋 Welcome to {{institutionName}} — Staff Portal Access',
    html: wrap('Welcome, Staff!', 'HR Department',
      `<h2>Welcome, {{staffName}}!</h2>
       <p>Your account has been created in <strong>{{institutionName}}</strong> ERP.</p>
       <table class="table">
         <tr><th>Employee ID</th><td>{{employeeId}}</td></tr>
         <tr><th>Designation</th><td>{{designation}}</td></tr>
         <tr><th>Department</th><td>{{department}}</td></tr>
         <tr><th>Login Email</th><td>{{email}}</td></tr>
         <tr><th>Temporary Password</th><td><code>{{tempPassword}}</code></td></tr>
       </table>
       <a class="btn" href="{{loginUrl}}">Login to Faculty Portal</a>`),
  },

  WELCOME_PARENT: {
    subject: '👨‍👩‍👧 Parent Portal Access — {{institutionName}}',
    html: wrap('Welcome, Parent!', 'Parent Portal Access',
      `<h2>Welcome, {{parentName}}!</h2>
       <p>Your parent account has been created in <strong>{{institutionName}}</strong> ERP.</p>
       <table class="table">
         <tr><th>Login Email</th><td>{{email}}</td></tr>
         <tr><th>Temporary Password</th><td><code>{{tempPassword}}</code></td></tr>
       </table>
       <p>Please log in and change your password immediately.</p>
       <a class="btn" href="{{loginUrl}}">Open Parent Portal</a>`),
  },

  CONTRACT_EXPIRY: {
    subject: '⚠️ Your employment contract expires on {{expiryDate}}',
    html: wrap('Contract Expiry Notice', 'HR Department',
      `<h2>Contract Expiry Reminder</h2>
       <p>Dear {{staffName}},</p>
       <p>This is to inform you that your employment contract is expiring on <strong>{{expiryDate}}</strong>
          — that is <strong>{{daysLeft}} days</strong> from today.</p>
       <p>Please contact HR to discuss renewal.</p>`),
  },

  PAYSLIP_GENERATED: {
    subject: '💰 Payslip for {{monthYear}} is ready',
    html: wrap('Payslip Ready', 'Payroll Department',
      `<h2>Payslip Generated</h2>
       <p>Dear {{staffName}},</p>
       <p>Your payslip for <strong>{{monthYear}}</strong> has been generated.</p>
       <table class="table">
         <tr><th>Gross Earnings</th><td>₹{{grossEarnings}}</td></tr>
         <tr><th>Total Deductions</th><td>₹{{totalDeductions}}</td></tr>
         <tr><th>Net Salary</th><td style="font-weight:bold;">₹{{netSalary}}</td></tr>
       </table>
       <a class="btn" href="{{payslipUrl}}">Download Payslip</a>`),
  },

  GRIEVANCE_UPDATE: {
    subject: '📋 Grievance {{ticketNumber}} — Status Updated',
    html: wrap('Grievance Update', 'Student Affairs',
      `<h2>Grievance Status Update</h2>
       <p>Dear {{studentName}},</p>
       <p>Your grievance <strong>{{ticketNumber}}</strong> has been updated.</p>
       <table class="table">
         <tr><th>Title</th><td>{{title}}</td></tr>
         <tr><th>New Status</th><td><span class="badge badge-{{statusClass}}">{{status}}</span></td></tr>
         {{#if resolution}}<tr><th>Resolution</th><td>{{resolution}}</td></tr>{{/if}}
       </table>
       <a class="btn" href="{{portalUrl}}">View Grievance</a>`),
  },

  ASSIGNMENT_DUE: {
    subject: '📚 Assignment Due Tomorrow — {{subjectName}}',
    html: wrap('Assignment Reminder', 'Academic Department',
      `<h2>Assignment Deadline Reminder</h2>
       <p>Dear {{studentName}},</p>
       <p>Your assignment for <strong>{{subjectName}}</strong> is due <strong>tomorrow</strong>.</p>
       <div class="highlight">
         <p>📝 {{assignmentTitle}}<br>⏰ Due: {{dueDate}} at {{dueTime}}</p>
       </div>
       <a class="btn" href="{{submitUrl}}">Submit Assignment</a>`),
  },

  REPORT_CARD_READY: {
    subject: '🎓 Report Card for {{examName}} is Ready',
    html: wrap('Report Card Available', 'Academic Department',
      `<h2>Report Card Published</h2>
       <p>Dear {{parentName}},</p>
       <p>The report card for <strong>{{studentName}}</strong> for <strong>{{examName}}</strong> is now available.</p>
       <a class="btn" href="{{reportCardUrl}}">Download Report Card</a>`),
  },

  BULK_NOTICE: {
    subject: '📢 {{subject}}',
    html: wrap('School Notice', 'School Administration',
      `<h2>{{subject}}</h2>
       <p>Dear {{recipientName}},</p>
       <div class="highlight"><p>{{message}}</p></div>
       <p>— {{institutionName}} Administration</p>`),
  },
};

/** Render a template by substituting {{variable}} placeholders */
export function renderTemplate(
  templateKey: string,
  variables: Record<string, string>,
): { subject: string; html: string } {
  const tpl = EMAIL_TEMPLATES[templateKey];
  if (!tpl) throw new Error(`Email template not found: ${templateKey}`);

  const substitute = (str: string) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? `{{${key}}}`);

  // Strip simple {{#if x}}...{{/if}} blocks based on truthy variable
  const processConditionals = (str: string) =>
    str.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, key, content) =>
      variables[key] ? content : '',
    );

  const processed = processConditionals(tpl.html);
  return {
    subject: substitute(tpl.subject),
    html: substitute(processed),
  };
}

/** SMS body templates — kept short for character limits */
export const SMS_TEMPLATES: Record<string, string> = {
  ATTENDANCE_ABSENT:   '{{institutionName}}: {{studentName}} was absent on {{date}}. Contact school if unplanned.',
  ATTENDANCE_LATE:     '{{institutionName}}: {{studentName}} arrived late at {{arrivalTime}} on {{date}}.',
  FEE_DUE:             '{{institutionName}}: Fee of Rs.{{amount}} due for {{studentName}} by {{dueDate}}. Pay at {{paymentUrl}}',
  FEE_OVERDUE:         '{{institutionName}}: OVERDUE fee Rs.{{amount}} for {{studentName}}. Pay immediately to avoid penalty.',
  EXAM_REMINDER:       '{{institutionName}}: {{subjectName}} exam on {{examDate}} at {{examTime}} in {{venue}}. All the best!',
  RESULT_PUBLISHED:    '{{institutionName}}: {{studentName}} scored {{percentage}}% in {{examName}}. Login to view full result.',
  PASSWORD_RESET_OTP:  '{{institutionName}}: Your OTP is {{otp}}. Valid for 10 minutes. Do not share.',
  WELCOME_PARENT:      '{{institutionName}}: Parent portal access created. Email: {{email}} Pass: {{tempPassword}} Login: {{loginUrl}}',
  LEAVE_APPROVED:      '{{institutionName}}: Your leave from {{fromDate}} to {{toDate}} is APPROVED.',
  LEAVE_REJECTED:      '{{institutionName}}: Your leave request has been REJECTED. Contact HR for details.',
  CONTRACT_EXPIRY:     '{{institutionName}}: Your contract expires on {{expiryDate}}. Contact HR for renewal.',
  GRIEVANCE_UPDATE:    '{{institutionName}}: Grievance {{ticketNumber}} status: {{status}}. Login for details.',
  BULK_NOTICE:         '{{institutionName}}: {{message}}',
};

export function renderSms(templateKey: string, variables: Record<string, string>): string {
  const tpl = SMS_TEMPLATES[templateKey] ?? variables['message'] ?? '';
  return tpl.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '');
}
