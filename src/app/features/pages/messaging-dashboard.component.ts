import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { PaginatorState } from 'primeng/paginator';
import {
  PaymentMessageResponse,
  PublishMessageRequest
} from '../../core/models/payment-message.model';
import { AppLoggerService } from '../../core/services/app-logger.service';
import { PaymentMessageApiService } from '../../core/services/payment-message-api.service';
import { MessagingMessageDetailComponent } from '../components/message-detail/messaging-message-detail.component';
import { MessagingMessagesTableComponent } from '../components/message-list/messaging-messages-table.component';
import { MessagingSendMessageComponent } from '../components/publish-message/messaging-send-message.component';

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SOURCE_QUEUE = 'DEV.QUEUE.1';

@Component({
  selector: 'app-messaging-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    MessagingMessageDetailComponent,
    MessagingMessagesTableComponent,
    MessagingSendMessageComponent
  ],
  providers: [MessageService],
  templateUrl: './messaging-dashboard.component.html',
  styleUrl: './messaging-dashboard.component.css'
})
export class MessagingDashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly apiService = inject(PaymentMessageApiService);
  private readonly logger = inject(AppLoggerService);
  private readonly messageService = inject(MessageService);

  protected readonly defaultSourceQueue = DEFAULT_SOURCE_QUEUE;
  protected readonly pageSizeOptions = [5, 10, 20, 50];

  protected readonly isListLoading = signal(false);
  protected readonly isDetailLoading = signal(false);
  protected readonly isSending = signal(false);
  protected readonly isComposerOpen = signal(false);

  protected readonly messages = signal<PaymentMessageResponse[]>([]);
  protected readonly selectedMessage = signal<PaymentMessageResponse | null>(null);

  protected totalElements = 0;
  protected currentPage = 0;
  protected pageSize = DEFAULT_PAGE_SIZE;

  ngOnInit(): void {
    this.loadMessages(this.currentPage, this.pageSize);
  }

  protected onPageChange(event: PaginatorState): void {
    const nextPage = event.page ?? 0;
    const nextSize = event.rows ?? DEFAULT_PAGE_SIZE;

    this.loadMessages(nextPage, nextSize);
  }

  protected onSendMessage(request: PublishMessageRequest): void {
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
          this.isComposerOpen.set(false);
          this.loadMessages(0, this.pageSize);
        },
        error: (error: unknown) => {
          this.notifyError('Publication impossible', this.resolveErrorMessage(error));
        }
      });
  }

  protected onRequestMessage(messageId: string): void {
    this.fetchMessageDetail(messageId);
  }

  protected onSelectMessage(message: PaymentMessageResponse): void {
    this.fetchMessageDetail(message.id);
  }

  protected openComposer(): void {
    this.isComposerOpen.set(true);
  }

  protected closeComposer(): void {
    this.isComposerOpen.set(false);
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
          this.logger.info('Message detail loaded from UI', { messageId });
        },
        error: (error: unknown) => {
          this.selectedMessage.set(null);
          this.notifyError('Message introuvable', this.resolveErrorMessage(error));
        }
      });
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
