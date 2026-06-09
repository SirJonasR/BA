import { Component, Input } from '@angular/core';
import { DeepExpertListItem } from 'src/app/services/deep-expert.service';

@Component({
  selector: 'app-deep-expert-table',
  templateUrl: './deep-expert-table.component.html',
  styleUrls: ['./deep-expert-table.component.css'],
})
export class DeepExpertTableComponent {
  @Input() deepExpertList: DeepExpertListItem[] = [];
  displayedColumns: string[] = [
    'expertInformation',
    'technologyName',
    'comment',
    'scope',
    'description',
  ];

  /**
   * DeepExpertTableComponent
   *
   * Component that displays a table of deep expert information.
   * It takes a list of deep experts as input and displays their details in a table format.
   */
}
