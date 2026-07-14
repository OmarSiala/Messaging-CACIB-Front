import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { MessageService } from 'primeng/api';
import { PaymentMessageApiService } from '../../../core/services/payment-message-api.service';
// @ts-ignore - the dashboard component is a sibling standalone component resolved by the Angular builder.
import { MessagingDashboardComponent } from './messaging-dashboard.component';

describe('MessagingDashboardComponent', () => {
  const apiServiceMock = {
    getMessages: vi.fn(),
    getMessageById: vi.fn(),
    publishMessage: vi.fn()
  };

  beforeEach(async () => {
    apiServiceMock.getMessages.mockReset();
    apiServiceMock.getMessageById.mockReset();
    apiServiceMock.publishMessage.mockReset();

    apiServiceMock.getMessages.mockReturnValue(
      of({
        content: [
          {
            id: '590f2c65-07f7-4a35-85f2-cf25257d517f',
            mqMessageId: 'ID:MQ123',
            correlationId: 'CORR-1',
            sourceQueue: 'DEV.QUEUE.1',
            payload: '{"amount":120}',
            status: 'RECEIVED',
            receivedAt: '2026-01-01T10:00:00Z',
            createdAt: '2026-01-01T10:00:00Z'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        numberOfElements: 1,
        first: true,
        last: true,
        empty: false
      })
    );

    apiServiceMock.getMessageById.mockReturnValue(
      of({
        id: '590f2c65-07f7-4a35-85f2-cf25257d517f',
        mqMessageId: 'ID:MQ123',
        correlationId: 'CORR-1',
        sourceQueue: 'DEV.QUEUE.1',
        payload: '{"amount":120}',
        status: 'RECEIVED',
        receivedAt: '2026-01-01T10:00:00Z',
        createdAt: '2026-01-01T10:00:00Z'
      })
    );

    apiServiceMock.publishMessage.mockReturnValue(of({ status: 'SENT' }));

    await TestBed.configureTestingModule({
      imports: [MessagingDashboardComponent],
      providers: [
        {
          provide: PaymentMessageApiService,
          useValue: apiServiceMock
        },
        MessageService
      ]
    }).compileComponents();
  });

  it('should create and load first page', () => {
    const fixture = TestBed.createComponent(MessagingDashboardComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(apiServiceMock.getMessages).toHaveBeenCalledWith(0, 10);
  });

  it('should load message detail when requested', () => {
    const fixture = TestBed.createComponent(MessagingDashboardComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as MessagingDashboardComponent;
    component.onRequestMessage('590f2c65-07f7-4a35-85f2-cf25257d517f');

    expect(apiServiceMock.getMessageById).toHaveBeenCalledWith(
      '590f2c65-07f7-4a35-85f2-cf25257d517f'
    );
  });

  it('should publish a message request', () => {
    const fixture = TestBed.createComponent(MessagingDashboardComponent);
    fixture.detectChanges();

    const component = fixture.componentInstance as MessagingDashboardComponent;

    component.onSendMessage({
      sourceQueue: 'DEV.QUEUE.1',
      payload: 'sample',
      correlationId: null
    });

    expect(apiServiceMock.publishMessage).toHaveBeenCalledWith({
      sourceQueue: 'DEV.QUEUE.1',
      payload: 'sample',
      correlationId: null
    });
  });
});
