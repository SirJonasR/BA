import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
/**
 * Error Page component
 *
 * Component that displays error page / message
 */
export class ErrorPageComponent {
  error: string | undefined;

  constructor(private router: Router) {
    this.error = this.router.getCurrentNavigation()?.extras.state?.['error'];
  }
}
