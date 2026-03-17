import { Process, Processor, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../../common/prisma/prisma.service';
import { S3Service } from '../../common/storage/s3.service';

interface ExportJob {
  entity: string;
  fields: string[];
  data: Record<string, unknown>[];
  format: 'EXCEL' | 'CSV' | 'PDF';
  institutionId: string;
  emailTo?: string;
  reportName?: string;
}

@Processor('export-queue')
export class ExportProcessor {
  private readonly logger = new Logger(ExportProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly config: ConfigService,
  ) {}

  @Process('export')
  async handleExport(job: Job<ExportJob>) {
    const { entity, fields, data, format, institutionId, emailTo, reportName } = job.data;
    this.logger.log(`Export job ${job.id}: ${format} for ${entity} (${data.length} rows)`);

    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    if (format === 'EXCEL') {
      buffer = await this.buildExcel(entity, fields, data);
      mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      extension = 'xlsx';
    } else if (format === 'CSV') {
      buffer = this.buildCsv(fields, data);
      mimeType = 'text/csv';
      extension = 'csv';
    } else {
      buffer = await this.buildPdf(entity, fields, data);
      mimeType = 'application/pdf';
      extension = 'pdf';
    }

    const filename = `${reportName ?? entity}-${Date.now()}.${extension}`;
    const { key, url } = await this.s3.upload(buffer, filename, `exports/${institutionId}`, mimeType);

    // Persist export record
    await this.prisma.exportLog.create({
      data: {
        entity,
        format,
        fileName: filename,
        fileKey: key,
        rowCount: data.length,
        institutionId,
        status: 'DONE',
        completedAt: new Date(),
      },
    }).catch(() => null); // graceful if model doesn't exist yet

    this.logger.log(`Export ${job.id} done → ${key}`);
    return { key, url, rowCount: data.length };
  }

  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Export job ${job.id} failed: ${err.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: unknown) {
    this.logger.log(`Export job ${job.id} completed`);
  }

  // ── Builders ───────────────────────────────────────────────
  private async buildExcel(entity: string, fields: string[], data: Record<string, unknown>[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'School ERP';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet(entity, {
      pageSetup: { paperSize: 9, orientation: 'landscape' },
    });

    // Header row — styled
    sheet.columns = fields.map((f) => ({
      header: f.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
      key: f,
      width: Math.max(15, f.length + 4),
    }));

    const headerRow = sheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E40AF' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF93C5FD' } },
      };
    });
    headerRow.height = 20;

    // Data rows
    data.forEach((row, i) => {
      const dataRow = sheet.addRow(fields.map((f) => row[f] ?? ''));
      if (i % 2 === 0) {
        dataRow.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
        });
      }
      dataRow.eachCell((cell) => {
        cell.border = { bottom: { style: 'hair', color: { argb: 'FFE2E8F0' } } };
      });
    });

    // Auto-filter on header
    sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: fields.length } };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];

    // Summary row
    sheet.addRow([]);
    const summaryRow = sheet.addRow([`Total records: ${data.length}`, ...Array(fields.length - 1).fill('')]);
    summaryRow.font = { italic: true, color: { argb: 'FF64748B' } };

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  private buildCsv(fields: string[], data: Record<string, unknown>[]): Buffer {
    const header = fields.join(',');
    const rows = data.map((row) =>
      fields
        .map((f) => {
          const val = row[f] ?? '';
          const str = String(val).replace(/"/g, '""');
          return str.includes(',') || str.includes('\n') || str.includes('"') ? `"${str}"` : str;
        })
        .join(','),
    );
    return Buffer.from([header, ...rows].join('\n'), 'utf-8');
  }

  private async buildPdf(entity: string, fields: string[], data: Record<string, unknown>[]): Promise<Buffer> {
    // Build HTML table then render to PDF via puppeteer
    // In production, puppeteer is installed. For now return an HTML buffer as fallback.
    const rows = data.map((row) =>
      `<tr>${fields.map((f) => `<td>${row[f] ?? ''}</td>`).join('')}</tr>`,
    ).join('');

    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { font-size: 18px; color: #1E40AF; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #1E40AF; color: white; padding: 6px 8px; text-align: left; }
        td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
        tr:nth-child(even) td { background: #eff6ff; }
        .footer { margin-top: 16px; font-size: 10px; color: #94a3b8; text-align: right; }
      </style></head><body>
      <h1>${entity} Report — ${new Date().toLocaleDateString()}</h1>
      <table>
        <thead><tr>${fields.map((f) => `<th>${f}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <p class="footer">Generated by School ERP on ${new Date().toISOString()}</p>
      </body></html>
    `;

    // Try puppeteer if available
    try {
      const puppeteer = await import('puppeteer');
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({ format: 'A4', landscape: true, printBackground: true });
      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch {
      // Fallback: return HTML as a buffer if puppeteer unavailable
      return Buffer.from(html, 'utf-8');
    }
  }
}
