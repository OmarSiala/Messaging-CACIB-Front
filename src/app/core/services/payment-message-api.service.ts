import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import {
  PageResponse,
  PaymentMessageResponse,
  PublishMessageRequest,
  PublishMessageResponse
} from '../models/payment-message.model';
import { AppLoggerService } from './app-logger.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentMessageApiService {
  private readonly http = inject(HttpClient);
  private readonly logger = inject(AppLoggerService);

  private readonly messagesBasePath = 'http://localhost:8080/api/v1/messages';
  private readonly publishPath = 'http://localhost:8080/api/v1/mq/messages';

  getMessages(page: number, size: number): Observable<PageResponse<PaymentMessageResponse>> {
    const params = new HttpParams().set('page', page).set('size', size).set('sort', 'receivedAt,desc');

    this.logger.info('Requesting paginated message list', { page, size });

    return this.http
      .get<PageResponse<PaymentMessageResponse>>(this.messagesBasePath, { params })
      .pipe(
        tap((response) => {
          this.logger.info('Paginated message list received', {
            page: response.number,
            size: response.size,
            totalElements: response.totalElements
          });
        }),
        catchError((error: unknown) => {
          this.logger.error('Failed to retrieve message list', error);
          return throwError(() => error);
        })
      );
  }

  getMessageById(id: string): Observable<PaymentMessageResponse> {
    this.logger.info('Requesting message detail', { id });

    return this.http.get<PaymentMessageResponse>(`${this.messagesBasePath}/${id}`).pipe(
      tap(() => {
        this.logger.info('Message detail received', { id });
      }),
      catchError((error: unknown) => {
        this.logger.error('Failed to retrieve message detail', { id, error });
        return throwError(() => error);
      })
    );
  }

  publishMessage(request: PublishMessageRequest): Observable<PublishMessageResponse> {
    this.logger.info('Publishing message to MQ through backend API', {
      correlationId: request.correlationId
    });

    return this.http.post<PublishMessageResponse>(this.publishPath, request).pipe(
      tap((response) => {
        this.logger.info('Message publish request accepted', response);
      }),
      catchError((error: unknown) => {
        this.logger.error('Failed to publish message', error);
        return throwError(() => error);
      })
    );
  }
}
