import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ME } from '../typings/groups';

@Injectable()
export class PermissionsSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      map((data) => {
        return data ? instanceToPlain(data, {
            groups: [ME, ...user.permissions],
          }) : data;
      }),
    );
  }
}
