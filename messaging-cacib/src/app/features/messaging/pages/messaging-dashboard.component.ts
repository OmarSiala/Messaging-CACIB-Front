import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import {
  PaymentMessageResponse,
  PaymentMessageStatus,
  PublishMessageRequest
} from '../../../core/models/payment-message.model';
import { AppLoggerService } from '../../../core/services/app-logger.service';
import { PaymentMessageApiService } from '../../../core/services/payment-message-api.service';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SOURCE_QUEUE = 'DEV.QUEUE.1';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-messaging-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    ButtonModule,
    CardModule,
    InputTextModule,
    TextareaModule,
    TableModule,
    PaginatorModule,
    TagModule,
    ToastModule,
    MessageModule
  ],
  providers: [MessageService],
  templateUrl: './messaging-dashboard.component.html',
  styleUrl: './messaging-dashboard.component.css'
})
export class MessagingDashboardComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(PaymentMessageApiService);
  private readonly logger = inject(AppLoggerService);
  private readonly messageService = inject(MessageService);

  protected readonly defaultSourceQueue = DEFAULT_SOURCE_QUEUE;
  protected readonly pageSizeOptions = [5, 10, 20, 50];

  protected readonly isListLoading = signal(false);
  protected readonly isDetailLoading = signal(false);
  protected readonly isSending = signal(false);

  protected readonly messages = signal<PaymentMessageResponse[]>([]);
  protected readonly selectedMessage = signal<PaymentMessageResponse | null>(null);

  protected totalElements = 0;
  protected currentPage = 0;
  protected pageSize = DEFAULT_PAGE_SIZE;

  protected readonly sendForm = this.fb.nonNullable.group({
    sourceQueue: [DEFAULT_SOURCE_QUEUE, [Validators.required, Validators.maxLength(128)]],
    correlationId: ['', [Validators.maxLength(64)]],
    payload: ['', [Validators.required, Validators.maxLength(20000)]]
  });

  protected readonly lookupForm = this.fb.nonNullable.group({
    messageId: ['', [Validators.required, Validators.pattern(UUID_REGEX)]]
  });

  ngOnInit(): void {
    this.loadMessages(this.currentPage, this.pageSize);
  }

  protected onPageChange(event: PaginatorState): void {
    const nextPage = event.page ?? 0;
    const nextSize = event.rows ?? DEFAULT_PAGE_SIZE;

    this.loadMessages(nextPage, nextSize);
  }

  protected onSendMessage(): void {
    if (this.sendForm.invalid) {
      this.sendForm.markAllAsTouched();
      this.notifyError('Validation', 'Le payload est obligatoire pour publier un message.');
      return;
    }

    const request: PublishMessageRequest = {
      payload: this.sendForm.controls.payload.value.trim(),
      correlationId: this.normalizeNullable(this.sendForm.controls.correlationId.value)
    };

    this.isSending.set(true);

    this.apiService
      .publishMessage(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSending.set(false))
      )
      .subscribe({
        next: () => {
          this.logger.info('Message published from UI', {
            correlationId: request.correlationId
          });
          this.notifySuccess('Publication', 'Message envoyé vers la queue avec succès.');
          this.sendForm.controls.payload.reset('');
          this.loadMessages(0, this.pageSize);
        },
        error: (error: unknown) => {
          this.notifyError('Publication impossible', this.resolveErrorMessage(error));
        }
      });
  }

  protected onLoadMessageById(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      this.notifyError('Validation', 'Veuillez saisir un UUID valide.');
      return;
    }

    this.fetchMessageDetail(this.lookupForm.controls.messageId.value.trim());
  }

  protected onSelectMessage(message: PaymentMessageResponse): void {
    this.fetchMessageDetail(message.id);
  }

  protected resolveSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const normalized = status?.toUpperCase() ?? '';

    if (normalized === PaymentMessageStatus.Received) {
      return 'info';
    }

    if (normalized === PaymentMessageStatus.Processed) {
      return 'success';
    }

    if (normalized === PaymentMessageStatus.Failed) {
      return 'danger';
    }

    return 'secondary';
  }

  private loadMessages(page: number, size: number): void {
    this.isListLoading.set(true);

    this.apiService
      .getMessages(page, size)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isListLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          this.messages.set(response.content);
          this.currentPage = response.number;
          this.pageSize = response.size;
          this.totalElements = response.totalElements;

          this.logger.info('Message list refreshed from UI', {
            page: this.currentPage,
            size: this.pageSize,
            totalElements: this.totalElements
          });
        },
        error: (error: unknown) => {
          this.notifyError('Lecture impossible', this.resolveErrorMessage(error));
        }
      });
  }

  private fetchMessageDetail(messageId: string): void {
    this.isDetailLoading.set(true);

    this.apiService
      .getMessageById(messageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isDetailLoading.set(false))
      )
      .subscribe({
        next: (message) => {
          this.selectedMessage.set(message);
          this.lookupForm.controls.messageId.setValue(message.id);
          this.logger.info('Message detail loaded from UI', { messageId });
        },
        error: (error: unknown) => {
          this.selectedMessage.set(null);
          this.notifyError('Message introuvable', this.resolveErrorMessage(error));
        }
      });
  }

  private normalizeNullable(value: string): string | null {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  private resolveErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.length > 0) {
        return error.error;
      }

      if (error.status === 404) {
        return 'Aucun message correspondant n\'a été trouvé.';
      }

      if (error.status >= 500) {
        return 'Le backend est indisponible temporairement.';
      }
    }

    return 'Une erreur technique est survenue.';
  }

  private notifySuccess(summary: string, detail: string): void {
    this.messageService.add({ severity: 'success', summary, detail });
  }

  private notifyError(summary: string, detail: string): void {
    this.messageService.add({ severity: 'error', summary, detail });
  }
}
