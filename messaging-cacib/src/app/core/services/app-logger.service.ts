import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppLoggerService {
  info(message: string, context?: unknown): void {
    console.info(`[Messaging-CACIB] ${message}`, context ?? '');
  }

  error(message: string, context?: unknown): void {
    console.error(`[Messaging-CACIB] ${message}`, context ?? '');
  }
}
