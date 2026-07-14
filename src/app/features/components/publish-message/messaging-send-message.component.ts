import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { TextareaModule } from 'primeng/textarea';
import { PublishMessageRequest } from '../../../core/models/payment-message.model';

@Component({
  selector: 'app-messaging-send-message',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, MessageModule],
  templateUrl: './messaging-send-message.component.html',
  styleUrl: './messaging-send-message.component.css'
})
export class MessagingSendMessageComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private wasOpen = false;

  @Input() isOpen = false;
  @Input() defaultSourceQueue = 'DEV.QUEUE.1';
  @Input() isSending = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Output() sendMessage = new EventEmitter<PublishMessageRequest>();

  protected readonly sendForm = this.fb.nonNullable.group({
    sourceQueue: [this.defaultSourceQueue, [Validators.required, Validators.maxLength(128)]],
    correlationId: ['', [Validators.maxLength(64)]],
    payload: ['', [Validators.required, Validators.maxLength(20000)]]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultSourceQueue'] && this.sendForm.controls.sourceQueue.value !== this.defaultSourceQueue) {
      this.sendForm.controls.sourceQueue.setValue(this.defaultSourceQueue);
    }

    if (changes['isOpen'] && this.wasOpen && !this.isOpen) {
      this.resetForm();
    }

    this.wasOpen = this.isOpen;
  }

  protected openComposer(): void {
    this.isOpenChange.emit(true);
  }

  protected closeComposer(): void {
    this.isOpenChange.emit(false);
  }

  protected onSendMessage(): void {
    if (this.sendForm.invalid) {
      this.sendForm.markAllAsTouched();
      return;
    }

    const request: PublishMessageRequest = {
      payload: this.sendForm.controls.payload.value.trim(),
      correlationId: this.normalizeNullable(this.sendForm.controls.correlationId.value)
    };

    this.sendMessage.emit(request);
  }

  private resetForm(): void {
    this.sendForm.reset({
      sourceQueue: this.defaultSourceQueue,
      correlationId: '',
      payload: ''
    });
  }

  private normalizeNullable(value: string): string | null {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
