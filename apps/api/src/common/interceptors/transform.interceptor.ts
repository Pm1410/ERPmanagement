import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<any, any> {
  intercept(context: ExecutionContext, next: CallHandler): any {
    const req = context.switchToHttp().getRequest();
    if (req.url && req.url.startsWith('/queues')) {
      return next.handle();
    }

    return (next.handle().pipe(
      map((data: any) => {
        // If already wrapped (e.g. paginated), pass through
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }
        return {
          success: true,
          data,
          meta: { timestamp: new Date().toISOString() },
        };
      }) as any
    ) as any);
  }
}
