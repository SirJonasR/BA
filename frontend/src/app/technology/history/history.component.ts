import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { THistory } from 'src/app/models/technology';
import { TechnologyService } from 'src/app/services/technology.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';

@Component({
  selector: 'app-history-view',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.css'],
})
export class HistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'date',
    'username',
    'name',
    'categoryName',
    'lifecycleName',
    'description',
    'shortDescription',
    'picture',
    'priority',
  ];
  dataSource: THistory[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly technologyService: TechnologyService,
    private userHandlingService: UserHandlingService,
  ) {
    //Nur Admins sollen in der Änderungshistorie den Benutzer sehen können.
    if (!this.getIsAdmin()) {
      this.displayedColumns.splice(
        this.displayedColumns.indexOf('username'),
        1,
      );
    }
  }

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const response = await firstValueFrom(
      this.technologyService.getTechnologyHistory(id),
    );

    response.reverse();
    const dataSource = [];

    for (let index = 0; index < response.length; index++) {
      const currentElement = response[index];
      const nextElement = response[index + 1] ?? currentElement;

      const isChanged = {
        name: currentElement.name !== nextElement?.name,
        category: currentElement.categoryName !== nextElement?.categoryName,
        lifecycle: currentElement.lifecycleName !== nextElement?.lifecycleName,
        description: currentElement.description !== nextElement?.description,
        shortDescription:
          currentElement.shortDescription !== nextElement?.shortDescription,
        picture: currentElement.pictureId !== nextElement?.pictureId,
        priority: currentElement.priority !== nextElement?.priority,
      };
      dataSource.push({ ...currentElement, isChanged });
    }
    this.dataSource = dataSource;
  }

  getIsAdmin(): boolean {
    return this.userHandlingService.hasRole(UserRole.ADMIN);
  }
}
