import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { AppLoggerService } from './app-logger.service';
import { PaymentMessageApiService } from './payment-message-api.service';

describe('PaymentMessageApiService', () => {
  const httpClientMock = {
    get: vi.fn(),
    post: vi.fn()
  };

  const loggerMock = {
    info: vi.fn(),
    error: vi.fn()
  };

  beforeEach(() => {
    httpClientMock.get.mockReset();
    httpClientMock.post.mockReset();
    loggerMock.info.mockReset();
    loggerMock.error.mockReset();

    TestBed.configureTestingModule({
      providers: [
        PaymentMessageApiService,
        {
          provide: HttpClient,
          useValue: httpClientMock
        },
        {
          provide: AppLoggerService,
          useValue: loggerMock
        }
      ]
    });
  });

  it('should request paginated messages', async () => {
    const service = TestBed.inject(PaymentMessageApiService);
    const page = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      numberOfElements: 0,
      first: true,
      last: true,
      empty: true
    };

    httpClientMock.get.mockReturnValue(of(page));

    const response = await firstValueFrom(service.getMessages(0, 10));

    expect(response).toEqual(page);
    expect(httpClientMock.get).toHaveBeenCalledTimes(1);
    expect(loggerMock.info).toHaveBeenCalled();
  });

  it('should propagate backend error when publish fails', async () => {
    const service = TestBed.inject(PaymentMessageApiService);
    const backendError = new Error('publish failed');

    httpClientMock.post.mockReturnValue(throwError(() => backendError));

    await expect(
      firstValueFrom(
        service.publishMessage({
          sourceQueue: 'DEV.QUEUE.1',
          payload: 'sample',
          correlationId: null
        })
      )
    ).rejects.toBe(backendError);

    expect(loggerMock.error).toHaveBeenCalled();
  });
});
