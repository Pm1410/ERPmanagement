import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Optional,
  Inject,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(@Optional() @Inject(PrismaService) private readonly prisma?: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): any {
    const req = context.switchToHttp().getRequest();

    if (!MUTATING.has(req.method)) {
      return next.handle();
    }

    const start = Date.now();

    return (next.handle().pipe(
      tap(async () => {
        if (!this.prisma || !req.user) return;
        try {
          await this.prisma.auditLog.create({
            data: {
              userId: req.user.id,
              action: req.method,
              entity: req.path.split('/')[3] || req.path,
              entityId: req.params?.id || null,
              payload: req.body
                ? JSON.stringify(req.body).slice(0, 2000)
                : null,
              ipAddress: req.ip,
              userAgent: req.headers['user-agent'] || null,
              durationMs: Date.now() - start,
            },
          });
        } catch {
          // Audit log failure must never break the response
        }
      }) as any
    ) as any);
  }
}
