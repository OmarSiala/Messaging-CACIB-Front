export enum PaymentMessageStatus {
  Received = 'RECEIVED',
  Processed = 'PROCESSED',
  Failed = 'FAILED',
  Unknown = 'UNKNOWN'
}

export interface PaymentMessageResponse {
  id: string;
  mqMessageId: string;
  correlationId: string | null;
  sourceQueue: string;
  payload: string;
  status: PaymentMessageStatus | string;
  receivedAt: string;
  createdAt: string;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface PublishMessageRequest {
  payload: string;
  correlationId: string | null;
}

export interface PublishMessageResponse {
  messageId?: string;
  correlationId?: string;
  status?: string;
  queue?: string;
  detail?: string;
}
