import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DomainError } from '@shared/domain/errors/domain.error';

@Injectable()
export class DomainErrorInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((response) => {
        if (DomainError.isDomainError(response)) {
          throw response;
        }
        return response;
      }),
    );
  }
}
