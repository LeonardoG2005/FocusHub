import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private readonly pendingRequests = signal(0);

  readonly isLoading = computed(() => this.pendingRequests() > 0);

  start(): void {
    this.pendingRequests.update((n) => n + 1);
  }

  stop(): void {
    this.pendingRequests.update((n) => Math.max(0, n - 1));
  }

  reset(): void {
    this.pendingRequests.set(0);
  }
}
