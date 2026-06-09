import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { TechnologyService } from 'src/app/services/technology.service';
import { HistoryComponent } from './history.component';
import { THistory } from 'src/app/models/technology';
import {
  UserHandlingService,
  UserRole,
} from 'src/app/services/user-handling.service';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let mockTechnologyService: jasmine.SpyObj<TechnologyService>;
  let mockUserHandlingService: jasmine.SpyObj<UserHandlingService>;

  beforeEach(() => {
    mockTechnologyService = jasmine.createSpyObj('TechnologyService', [
      'getTechnologyHistory',
    ]);
    mockUserHandlingService = jasmine.createSpyObj(
      'UserHandlingService',
      ['hasRole'],
      {
        user: {
          userName: '',
          showIconsInColor: false,
          showIcons: false,
          roles: [UserRole.ADMIN],
        },
      },
    );
    TestBed.configureTestingModule({
      declarations: [HistoryComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (): string => '1',
              },
            },
          },
        },
        {
          provide: TechnologyService,
          useValue: mockTechnologyService,
        },
        { provide: UserHandlingService, useValue: mockUserHandlingService },
      ],
    });

    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;

    // Mock-Daten für Ihren Service
    const mockHistoryData: THistory[] = [
      {
        date: new Date(),
        username: 'JohnDoe',
        name: 'Technology A',
        categoryName: 'Category 1',
        lifecycleName: 'Lifecycle A',
        description: 'This is Technology A.',
        shortDescription: 'Tech A',
        pictureId: 1,
        priority: false,
        tags: ['Tag1', 'Tag2'],
        isChanged: {
          name: true,
          category: false,
          lifecycle: true,
          description: true,
          shortDescription: false,
          picture: false,
          priority: false,
        },
      },
      {
        date: new Date(),
        username: 'JaneSmith',
        name: 'Technology B',
        categoryName: 'Category 2',
        lifecycleName: 'Lifecycle B',
        description: 'This is Technology B.',
        shortDescription: 'Tech B',
        pictureId: 2,
        priority: false,
        tags: ['Tag3', 'Tag4'],
        isChanged: {
          name: false,
          category: true,
          lifecycle: false,
          description: false,
          shortDescription: true,
          picture: true,
          priority: false,
        },
      },
    ];

    mockTechnologyService.getTechnologyHistory.and.returnValue(
      of(mockHistoryData),
    );

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
