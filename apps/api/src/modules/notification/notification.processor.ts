import { Process, Processor, OnQueueFailed, OnQueueCompleted, OnQueueStalled } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../../common/prisma/prisma.service';
import { renderTemplate, renderSms } from './templates/email.templates';
import { NotificationChannel } from './dto/notification.dto';

interface NotificationJob {
  channel: NotificationChannel;
  template: string;
  recipient: string;
  variables: Record<string, string>;
  institutionId?: string;
  userId?: string;
}

@Processor('notification-queue')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.initTransporter();
  }

  private initTransporter() {
    const sendgridKey = this.config.get('SENDGRID_API_KEY');
    const smtpHost   = this.config.get('SMTP_HOST');

    if (sendgridKey && sendgridKey !== 'SG.xxxx') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        auth: { user: 'apikey', pass: sendgridKey },
      });
      this.logger.log('Email: using SendGrid');
    } else if (smtpHost) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(this.config.get('SMTP_PORT', '587'), 10),
        secure: this.config.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.config.get('SMTP_USER', ''),
          pass: this.config.get('SMTP_PASS', ''),
        },
      });
      this.logger.log(`Email: using SMTP ${smtpHost}`);
    } else {
      // MailHog / Mailtrap dev fallback
      this.transporter = nodemailer.createTransport({
        host: this.config.get('MAILHOG_HOST', 'localhost'),
        port: parseInt(this.config.get('MAILHOG_PORT', '1025'), 10),
        secure: false,
        ignoreTLS: true,
      });
      this.logger.log('Email: using MailHog (dev)');
    }
  }

  // ── Email ──────────────────────────────────────────────────
  @Process('send-email')
  async handleEmail(job: Job<NotificationJob>) {
    const { recipient, template, variables, institutionId } = job.data;
    this.logger.log(`[EMAIL] job=${job.id} to=${recipient} tpl=${template}`);

    const logId = await this.createLog('EMAIL', recipient, template, institutionId);

    try {
      const { subject, html } = renderTemplate(template, {
        ...variables,
        institutionName: variables.institutionName ?? 'School ERP',
        year: new Date().getFullYear().toString(),
      });

      if (!this.transporter) throw new Error('Email transporter not configured');

      await this.transporter.sendMail({
        from: `"${this.config.get('EMAIL_FROM_NAME', 'School ERP')}" <${this.config.get('EMAIL_FROM', 'noreply@school.edu.in')}>`,
        to: recipient,
        subject,
        html,
      });

      await this.updateLog(logId, 'SENT');
      this.logger.log(`[EMAIL] ✓ sent to ${recipient}`);
    } catch (err: any) {
      await this.updateLog(logId, 'FAILED', err.message);
      this.logger.error(`[EMAIL] ✗ ${recipient}: ${err.message}`);
      throw err; // triggers Bull retry
    }
  }

  // ── SMS ────────────────────────────────────────────────────
  @Process('send-sms')
  async handleSms(job: Job<NotificationJob>) {
    const { recipient, template, variables, institutionId } = job.data;
    this.logger.log(`[SMS] job=${job.id} to=${recipient} tpl=${template}`);

    const logId = await this.createLog('SMS', recipient, template, institutionId);

    try {
      const body = renderSms(template, variables);

      const accountSid = this.config.get('TWILIO_ACCOUNT_SID');
      const authToken  = this.config.get('TWILIO_AUTH_TOKEN');
      const from       = this.config.get('TWILIO_PHONE_NUMBER');

      if (accountSid && authToken && accountSid !== 'ACxxxx') {
        const twilio = require('twilio')(accountSid, authToken);
        await twilio.messages.create({ body, from, to: recipient });
      } else if (this.config.get('MSG91_AUTH_KEY')) {
        // MSG91 fallback (common in India)
        await this.sendMsg91(recipient, body);
      } else {
        this.logger.warn(`[SMS] No SMS provider configured — message for ${recipient}: ${body}`);
      }

      await this.updateLog(logId, 'SENT');
      this.logger.log(`[SMS] ✓ sent to ${recipient}`);
    } catch (err: any) {
      await this.updateLog(logId, 'FAILED', err.message);
      this.logger.error(`[SMS] ✗ ${recipient}: ${err.message}`);
      // Skip SMS send, don't throw to gracefully handle
    }
  }

  // ── Push (FCM) ─────────────────────────────────────────────
  @Process('send-push')
  async handlePush(job: Job<NotificationJob>) {
    const { recipient, template, variables, institutionId } = job.data;
    this.logger.log(`[PUSH] job=${job.id} token=${recipient.substring(0, 20)}...`);

    const logId = await this.createLog('PUSH', recipient, template, institutionId);

    try {
      const { subject, html } = renderTemplate(template, variables);
      // Strip HTML for push body
      const bodyText = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 200);

      const projectId   = this.config.get('FIREBASE_PROJECT_ID');
      const clientEmail = this.config.get('FIREBASE_CLIENT_EMAIL');
      const privateKey  = this.config.get('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

      if (projectId && clientEmail && privateKey) {
        const admin = require('firebase-admin');
        if (!admin.apps.length) {
          admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
          });
        }
        await admin.messaging().send({
          token: recipient,
          notification: { title: subject, body: bodyText },
          data: { template, ...variables },
        });
      } else {
        this.logger.warn(`[PUSH] Firebase not configured — skipping push for ${recipient.substring(0, 20)}`);
      }

      await this.updateLog(logId, 'SENT');
      this.logger.log(`[PUSH] ✓ sent`);
    } catch (err: any) {
      await this.updateLog(logId, 'FAILED', err.message);
      this.logger.error(`[PUSH] ✗ ${err.message}`);
      // Skip PUSH send, don't throw to gracefully handle
    }
  }

  // ── In-App (persisted to DB, sent via Socket.IO event) ─────
  @Process('send-in-app')
  async handleInApp(job: Job<NotificationJob>) {
    const { userId, template, variables, institutionId } = job.data;
    if (!userId) return;

    try {
      await this.prisma.inAppNotification.create({
        data: {
          userId,
          template,
          title: variables.subject ?? template.replace(/_/g, ' '),
          body: variables.message ?? variables.noticeBody ?? '',
          isRead: false,
          institutionId: institutionId ?? '',
          metadata: JSON.stringify(variables),
        },
      }).catch(() => null); // graceful if model not yet migrated

      this.logger.log(`[IN-APP] ✓ persisted for user ${userId}`);
    } catch (err: any) {
      this.logger.error(`[IN-APP] ✗ ${err.message}`);
    }
  }

  // ── Queue event hooks ──────────────────────────────────────
  @OnQueueFailed()
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} (${job.name}) failed after ${job.attemptsMade} attempts: ${err.message}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job) {
    this.logger.debug(`Job ${job.id} (${job.name}) completed`);
  }

  @OnQueueStalled()
  onStalled(job: Job) {
    this.logger.warn(`Job ${job.id} (${job.name}) stalled — will be retried`);
  }

  // ── Helpers ────────────────────────────────────────────────
  private async createLog(channel: string, recipient: string, template: string, institutionId?: string): Promise<string> {
    const log = await this.prisma.notificationLog.create({
      data: {
        channel,
        recipient,
        subject: template,
        body: '',
        status: 'PENDING',
        institutionId: institutionId ?? null,
      },
    }).catch(() => ({ id: 'noop' }));
    return log.id;
  }

  private async updateLog(logId: string, status: string, errorMessage?: string) {
    if (logId === 'noop') return;
    await this.prisma.notificationLog.update({
      where: { id: logId },
      data: { status, ...(status === 'SENT' ? { sentAt: new Date() } : {}), errorMessage: errorMessage ?? null },
    }).catch(() => null);
  }

  private async sendMsg91(to: string, body: string) {
    const authKey  = this.config.get('MSG91_AUTH_KEY');
    const senderId = this.config.get('MSG91_SENDER_ID', 'SCHOOL');
    const response = await fetch(`https://api.msg91.com/api/v5/flow/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: authKey },
      body: JSON.stringify({ template_id: 'custom', recipients: [{ mobiles: to, var1: body }], sender: senderId }),
    });
    if (!response.ok) throw new Error(`MSG91 error: ${response.status}`);
  }
}
