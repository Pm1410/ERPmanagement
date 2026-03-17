import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';

interface ReportCardJobData {
  studentId: string;
  examId: string;
  institutionId: string;
}

@Processor('report-card')
export class ReportCardProcessor {
  private readonly logger = new Logger(ReportCardProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  @Process('generate')
  async handleGenerate(job: Job<ReportCardJobData>) {
    const { studentId, examId, institutionId } = job.data;
    this.logger.log(`Generating report card for student=${studentId} exam=${examId}`);

    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        section: true,
      },
    });

    const grades = await this.prisma.grade.findMany({
      where: { studentId, examId },
      include: { subject: true },
    });

    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!student || !grades.length) {
      this.logger.warn(`No data found for report card generation`);
      return null;
    }

    // Build HTML report card
    const html = this.buildReportCardHtml({ student, grades, institution });

    // In production use Puppeteer:
    // const browser = await puppeteer.launch({ headless: true });
    // const page = await browser.newPage();
    // await page.setContent(html, { waitUntil: 'networkidle0' });
    // const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    // await browser.close();
    // const { key } = await this.s3.upload(pdfBuffer, `report-card-${studentId}.pdf`, `report-cards/${institutionId}`, 'application/pdf');

    this.logger.log(`Report card HTML generated (${html.length} bytes) for ${student.name}`);
    return { studentId, studentName: student.name, status: 'generated' };
  }

  private buildReportCardHtml(data: {
    student: any;
    grades: any[];
    institution: any;
  }): string {
    const { student, grades, institution } = data;
    const totalMax = grades.reduce((s: number, g: any) => s + g.maxMarks, 0);
    const totalObtained = grades.reduce((s: number, g: any) => s + Number(g.marksObtained), 0);
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    const rows = grades.map((g: any) => `
      <tr>
        <td>${g.subject.name}</td>
        <td>${g.maxMarks}</td>
        <td>${Number(g.marksObtained).toFixed(0)}</td>
        <td>${g.grade}</td>
        <td>${g.isPassed ? 'Pass' : 'Fail'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Report Card</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #1E40AF; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 24px; color: #1E40AF; margin: 0; }
          .header p { margin: 4px 0; color: #555; }
          .student-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 24px; }
          .student-info span { font-size: 14px; }
          .label { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th { background: #1E40AF; color: white; padding: 10px; text-align: left; font-size: 13px; }
          td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
          tr:nth-child(even) td { background: #f9fafb; }
          .summary { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; }
          .summary h3 { margin: 0 0 8px; color: #1E40AF; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #666; }
          .sig-line { border-top: 1px solid #999; padding-top: 4px; text-align: center; width: 160px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${institution?.name ?? 'School Name'}</h1>
          <p>${institution?.address ?? ''}</p>
          <p>Affiliation No: ${institution?.affiliationNo ?? 'N/A'}</p>
          <h2 style="margin-top:12px;font-size:18px;">Progress Report Card</h2>
        </div>

        <div class="student-info">
          <span><span class="label">Student Name:</span> ${student.name}</span>
          <span><span class="label">Admission No:</span> ${student.admissionNumber}</span>
          <span><span class="label">Class:</span> ${student.class?.name} - ${student.section?.name}</span>
          <span><span class="label">Roll No:</span> ${student.rollNumber}</span>
          <span><span class="label">Father's Name:</span> ${student.fatherName ?? 'N/A'}</span>
          <span><span class="label">Date of Birth:</span> ${new Date(student.dateOfBirth).toLocaleDateString('en-IN')}</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Max Marks</th>
              <th>Marks Obtained</th>
              <th>Grade</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <div class="summary">
          <h3>Overall Performance</h3>
          <p><span class="label">Total Marks:</span> ${totalObtained} / ${totalMax}</p>
          <p><span class="label">Percentage:</span> ${percentage}%</p>
          <p><span class="label">Overall Result:</span> ${grades.every((g: any) => g.isPassed) ? '✅ PASS' : '❌ FAIL'}</p>
        </div>

        <div class="footer">
          <div class="sig-line">Class Teacher</div>
          <div class="sig-line">Principal</div>
          <div class="sig-line">Parent / Guardian</div>
        </div>
      </body>
      </html>
    `;
  }
}
