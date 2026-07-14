import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import {
  PaymentMessageResponse,
  PaymentMessageStatus
} from '../../../core/models/payment-message.model';

@Component({
  selector: 'app-messaging-messages-table',
  standalone: true,
  imports: [CommonModule, DatePipe, ButtonModule, CardModule, PaginatorModule, TableModule, TagModule],
  templateUrl: './messaging-messages-table.component.html',
  styleUrls: ['./messaging-messages-table.component.css']
})
export class MessagingMessagesTableComponent {
  @Input() messages: PaymentMessageResponse[] = [];
  @Input() loading = false;
  @Input() totalRecords = 0;
  @Input() first = 0;
  @Input() rows = 10;
  @Input() rowsPerPageOptions: number[] = [5, 10, 20, 50];
  @Output() pageChange = new EventEmitter<PaginatorState>();
  @Output() messageSelected = new EventEmitter<PaymentMessageResponse>();

  protected onViewMessage(message: PaymentMessageResponse): void {
    this.messageSelected.emit(message);
  }

  protected resolveSeverity(status: string): 'success' | 'warn' | 'danger' | 'info' | 'secondary' | 'contrast' {
    const normalized = (status ?? '').trim().toUpperCase();

    if (normalized === PaymentMessageStatus.Received) {
      return 'info';
    }

    if (normalized === PaymentMessageStatus.Processed) {
      return 'success';
    }

    if (normalized === PaymentMessageStatus.Rejected) {
      return 'danger';
    }

    return 'secondary';
  }
}
