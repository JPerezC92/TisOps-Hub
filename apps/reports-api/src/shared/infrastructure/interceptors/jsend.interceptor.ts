import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class JSendInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        // Already JSend-wrapped — pass through (backward compat for unmigrated controllers)
        if (
          response &&
          typeof response === 'object' &&
          'status' in response &&
          response.status === 'success'
        ) {
          return response;
        }

        return { status: 'success', data: response };
      }),
    );
  }
}
