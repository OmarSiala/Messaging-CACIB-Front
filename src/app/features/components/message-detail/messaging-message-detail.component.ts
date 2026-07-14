import { CommonModule, DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import {
  PaymentMessageResponse,
  PaymentMessageStatus
} from '../../../core/models/payment-message.model';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Component({
  selector: 'app-messaging-message-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe, ButtonModule, CardModule, InputTextModule, TagModule, MessageModule],
  templateUrl: './messaging-message-detail.component.html',
  styleUrl: './messaging-message-detail.component.css'
})
export class MessagingMessageDetailComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() selectedMessage: PaymentMessageResponse | null = null;
  @Input() isLoading = false;
  @Output() messageRequested = new EventEmitter<string>();

  protected readonly lookupForm = this.fb.nonNullable.group({
    messageId: ['', [Validators.required, Validators.pattern(UUID_REGEX)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedMessage'] && this.selectedMessage) {
      this.lookupForm.controls.messageId.setValue(this.selectedMessage.id, { emitEvent: false });
    }
  }

  protected onLoadMessageById(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.messageRequested.emit(this.lookupForm.controls.messageId.value.trim());
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
}
