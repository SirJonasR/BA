import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddViewComponent } from './add-view/add-view.component';
import { EditViewComponent } from './edit-view/edit-view.component';
import { AddProjectComponent } from '../project/add-project/add-project.component';

/**
 * CanDeactive Guard for Add and Edit view component.
 */
@Injectable()
export class CanDeactivateGuard {
  /**
   * if the user trys to leave the page, with unsaved changes, confirm pop appears.
   * @param component
   */
  canDeactivate(
    component: AddViewComponent | EditViewComponent | AddProjectComponent,
  ): Observable<boolean> | boolean {
    if (component.changes()) {
      return confirm('Du hast noch ungespeicherte Änderungen!');
    }
    return true;
  }
}
