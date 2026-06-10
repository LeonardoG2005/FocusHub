import { Injectable, computed, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})

export class LoadingService {
  private readonly pendingRequests = signal(0);
  private readonly visible = signal(false);

  private startedAt = 0;
  private hideTimeout?: ReturnType<typeof setTimeout>;

  readonly isLoading = computed(() => this.visible());

  start(): void {
    if (this.pendingRequests() === 0) {
      this.startedAt = Date.now();

      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = undefined;
      }


      this.visible.set(true);
    }

    this.pendingRequests.update((n) => n + 1);
  }

  stop(): void {
    this.pendingRequests.update((n) => Math.max(0, n - 1));

    if (this.pendingRequests() > 0) {
      return;
    }

    const elapsed = Date.now() - this.startedAt;
    const remaining = Math.max(0, 500 - elapsed);

    this.hideTimeout = setTimeout(() => {
      if (this.pendingRequests() === 0) {
        this.visible.set(false);
      }
    }, remaining);
  }

  reset(): void {
    this.pendingRequests.set(0);
    this.visible.set(false);

    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = undefined;
    }
  }
}
