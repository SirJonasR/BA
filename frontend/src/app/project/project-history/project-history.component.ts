import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';
import { firstValueFrom } from 'rxjs';
import { ProjectHistory } from 'src/app/models/project';

@Component({
  selector: 'app-project-history',
  templateUrl: './project-history.component.html',
  styleUrls: ['./project-history.component.css'],
})
export class ProjectHistoryComponent implements OnInit {
  displayedColumns: string[] = [
    'changeDate',
    'username',
    'name',
    'description',
    'contact',
    'salesServiceLink',
    'info',
    'industrySpecificInformation',
    'startDate',
    'endDate',
    'customerNames',
    'technologyNames',
  ];

  dataSource: ProjectHistory[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly projectService: ProjectService,
    private readonly userHandlingService: UserHandlingService,
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const projectHistories = await firstValueFrom(
      this.projectService.getProjectHistories(id),
    );
    if (!this.userHandlingService.hasRole(UserRole.ADMIN)) {
      this.displayedColumns.splice(
        this.displayedColumns.indexOf('username'),
        1,
      );
    }
    projectHistories.reverse();
    const dataSource = [];
    for (let index = 0; index < projectHistories.length; index++) {
      const currentProjectHistory = projectHistories[index];
      const nextProjectHistory =
        projectHistories[index + 1] ?? currentProjectHistory;
      const isChanged = {
        name: currentProjectHistory.name !== nextProjectHistory?.name,
        description:
          currentProjectHistory.description !== nextProjectHistory?.description,
        contact: currentProjectHistory.contact !== nextProjectHistory?.contact,
        salesServiceLink:
          currentProjectHistory.salesServiceLink !==
          nextProjectHistory?.salesServiceLink,
        info: currentProjectHistory.info !== nextProjectHistory.info,
        industrySpecificInformation:
          currentProjectHistory.industrySpecificInformation !==
          nextProjectHistory?.industrySpecificInformation,
        startDate:
          currentProjectHistory.startDate !== nextProjectHistory.startDate,
        endDate: currentProjectHistory.endDate !== nextProjectHistory.endDate,
        customerNames:
          currentProjectHistory.customerNames.join() !==
          nextProjectHistory.customerNames.join(),
        technologyIds:
          currentProjectHistory.technologyIds.join() !==
          nextProjectHistory.technologyIds.join(),
      };

      dataSource.push({ ...currentProjectHistory, isChanged });
    }
    this.dataSource = dataSource;
  }

  protected readonly Date = Date;
}
