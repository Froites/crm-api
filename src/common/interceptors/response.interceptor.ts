import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../types/api-response.type';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // Se já é uma resposta formatada, retorna como está
        if (data && typeof data === 'object' && 'success' in data) {
          return data;
        }

        // Formata a resposta padrão
        return {
          success: true,
          data,
          message: 'Operation completed successfully',
        };
      }),
    );
  }
}