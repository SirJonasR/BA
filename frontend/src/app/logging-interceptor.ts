import { Injectable, NgZone } from '@angular/core';
import { tap } from 'rxjs/operators';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(
    private snackBar: MatSnackBar,
    private zone: NgZone,
  ) {}

  intercept(
    req: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      tap({
        error: (error: HttpErrorResponse) => {
          // 429: Rate Limit → Snackbar anzeigen
          if (error.status === 429) {
            if (error.error instanceof Blob) {
              error.error
                .text()
                .then((text) => {
                  this.zone.run(() => {
                    setTimeout(() => {
                      this.snackBar.open(
                        text || 'Zu viele Anfragen!',
                        'Schließen',
                        {
                          duration: 10000,
                          panelClass: ['highlighted-snackbar'],
                        },
                      );
                    }, 0);
                  });
                })
                .catch(() => {
                  // Fallback if blob cannot be parsed
                  this.zone.run(() => {
                    setTimeout(() => {
                      this.snackBar.open('Zu viele Anfragen!', 'Schließen', {
                        duration: 10000,
                        panelClass: ['highlighted-snackbar'],
                      });
                    }, 0);
                  });
                });
            } else {
              const message = error.error || 'Zu viele Anfragen!';
              this.zone.run(() => {
                setTimeout(() => {
                  this.snackBar.open(message, 'Schließen', {
                    duration: 10000,
                    panelClass: ['highlighted-snackbar'],
                  });
                });
              });
            }

            return; // Kein Routing bei Rate-Limit
          }

          // Alle anderen Fehler → Snackbar anzeigen
          const message =
            error.error?.message ||
            error.message ||
            'Ein Fehler ist aufgetreten.';
          this.zone.run(() => {
            setTimeout(() => {
              this.snackBar.open(message, 'Schließen', {
                duration: 10000,
                panelClass: ['highlighted-snackbar'],
              });
            }, 0);
          });
        },
      }),
    );
  }
}
