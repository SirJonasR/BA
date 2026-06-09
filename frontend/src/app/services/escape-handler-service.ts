import { Injectable, OnDestroy } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import { QueryList } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class EscapeHandlerService implements OnDestroy {
  private escapeListeners = new Map<string, (event: KeyboardEvent) => void>();

  setupEscapeListener(
    dropdownOptions: QueryList<MatSelect> | undefined,
    componentId: string,
  ): void {
    // Remove existing listener if present
    this.removeEscapeListener(componentId);

    // Create new listener with capture=true for higher priority
    const escapeListener = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        // Close all open dropowns first
        let hasOpenDropdown = false;
        dropdownOptions?.forEach((select) => {
          if (select.panelOpen) {
            select.close();
            hasOpenDropdown = true;
          }
        });
        // If we closed a dropdown, prevent default behavior to avoid closing sidebar
        if (hasOpenDropdown) {
          event.stopPropagation();
          event.preventDefault();
        }
      }
    };

    // Store the listener
    this.escapeListeners.set(componentId, escapeListener);

    // Add listener with capture=true for higher priority
    window.addEventListener('keydown', escapeListener, true);
  }

  removeEscapeListener(componentId?: string): void {
    if (componentId) {
      // Remove specific listener
      const listener = this.escapeListeners.get(componentId);
      if (listener) {
        window.removeEventListener('keydown', listener, true);
        this.escapeListeners.delete(componentId);
      }
    } else {
      // Remove all listeners (backwards compatibility)
      this.escapeListeners.forEach((listener) => {
        window.removeEventListener('keydown', listener, true);
      });
      this.escapeListeners.clear();
    }
  }

  ngOnDestroy(): void {
    this.removeEscapeListener();
  }
}
