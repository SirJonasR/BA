import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import {
  HttpErrorResponse,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http';
import { throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoggingInterceptor } from '../logging-interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let mockHttpHandler: jasmine.SpyObj<HttpHandler>;
  let mockSnackBar: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    // Mock HttpHandler und MatSnackBar als Spy-Objekte erstellen
    mockHttpHandler = jasmine.createSpyObj('HttpHandler', ['handle']);
    mockSnackBar = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        LoggingInterceptor,
        { provide: HttpHandler, useValue: mockHttpHandler }, // Mock HttpHandler bereitstellen
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    });

    // Injector verwenden, um die Instanz des Interceptors zu erhalten
    interceptor = TestBed.inject(LoggingInterceptor);
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });

  it('should show a snackbar when an error occurs', fakeAsync(() => {
    // Konfiguration des Mock-Verhaltens für HttpHandler
    mockHttpHandler.handle.and.returnValue(
      throwError(
        new HttpErrorResponse({
          status: 404,
          statusText: 'Not Found',
          url: 'unknown url',
        }),
      ),
    );

    // Interceptor aufrufen
    interceptor
      .intercept(new HttpRequest('GET', 'http://example.com'), mockHttpHandler)
      .subscribe(
        () => {
          // Erfolgsfall (sollte hier nicht aufgerufen werden)
        },
        () => {
          // Fehlerfall absichtlich leer
        },
      );

    tick(0);

    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Http failure response for unknown url: 404 Not Found',
      'Schließen',
      {
        duration: 10000,
        panelClass: ['highlighted-snackbar'],
      },
    );
  }));
});

//
// describe('LoggingInterceptor', () => {
//   let interceptor: LoggingInterceptor;
//   let httpMock: HttpTestingController;
//   let httpClient: HttpClient;
//   let routerSpy: jasmine.SpyObj<Router>;
//
//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       providers: [
//         LoggingInterceptor,
//         { provide: MatSnackBar, useClass: MockSnackBar },
//         { provide: Router, useClass: MockRouter },
//         { provide: HttpHandler, useClass: MockHttpHandler },
//       ],
//     });
//
//     interceptor = TestBed.inject(LoggingInterceptor);
//     mockRouter = TestBed.inject(Router) as unknown as MockRouter;
//     mockHttpHandler = TestBed.inject(HttpHandler) as unknown as MockHttpHandler;
//   });
//
//   it('should be created', () => {
//     expect(interceptor).toBeTruthy();
//   });
//
//   it('should navigate to /error with state when an error occurs', () => {
//     spyOn(mockRouter, 'navigate');
//     spyOn(mockHttpHandler, 'handle').and.returnValue(
//       throwError(
//         new HttpErrorResponse({
//           status: 404,
//           statusText: 'Not Found',
//           url: 'unknown url',
//         }),
//       ),
//     );
//
//     interceptor
//       .intercept(new HttpRequest('GET', 'http://example.com'), mockHttpHandler)
//       .subscribe(
//         () => {
//           return;
//         },
//         () => {
//           expect(mockRouter.navigate).toHaveBeenCalledWith(['/error'], {
//             state: {
//               error: 'Http failure response for unknown url: 404 Not Found',
//             },
//           });
//         },
//       );
//   });
// });
