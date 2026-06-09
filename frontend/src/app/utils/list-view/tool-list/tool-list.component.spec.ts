import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToolListComponent } from './tool-list.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { TechnologyService } from 'src/app/services/technology.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Technology } from 'src/app/models/technology';
import { PictureService } from 'src/app/services/picture.service';
import { of } from 'rxjs';
import { Project } from 'src/app/models/project';

describe('ToolListComponent', () => {
  let component: ToolListComponent;
  let fixture: ComponentFixture<ToolListComponent>;
  let technologyServiceSpy: jasmine.SpyObj<TechnologyService>;
  let pictureServiceSpy: jasmine.SpyObj<PictureService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockTechnology: Technology = {
    id: 1,
    name: 'Tech1',
    categoryId: 1,
    lifecycleId: 1,
    description: '',
    shortDescription: '',
    pictureId: 1,
    tags: ['Tag'],
    projects: [
      {
        name: 'testProject',
        id: 1,
        customers: [{ name: 'testCustomer', id: 1 }],
      } as Project,
    ],
    status: 1,
    priority: false,
    jumpDate: '2023-08-20',
    viewCount: 0,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  };

  const mockCategory = { id: 1, name: 'MockCategory', description: '' };
  const mockLifecycle = { id: 1, name: 'MockLifecycle', description: '' };

  beforeEach(() => {
    technologyServiceSpy = jasmine.createSpyObj('TechnologyService', [
      'getCategoryById',
      'getLifecycleById',
    ]);
    pictureServiceSpy = jasmine.createSpyObj('PictureService', ['loadPicture']);

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    pictureServiceSpy.loadPicture.and.returnValue(of(null));

    TestBed.configureTestingModule({
      declarations: [ToolListComponent],
      imports: [
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        RouterTestingModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: TechnologyService, useValue: technologyServiceSpy },
        { provide: PictureService, useValue: pictureServiceSpy },
        { provide: Router, useValue: mockRouter },
      ],
    });

    fixture = TestBed.createComponent(ToolListComponent);
    component = fixture.componentInstance;
    component.technologies = [mockTechnology];
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should populate dataSource.data when ngOnInit is called', () => {
    technologyServiceSpy.getCategoryById.and.returnValue(mockCategory);
    technologyServiceSpy.getLifecycleById.and.returnValue(mockLifecycle);
    pictureServiceSpy.loadPicture.and.returnValue(of('some-url'));

    component.ngOnInit();

    expect(component.dataSource.data).toEqual(
      component.mapValues([mockTechnology]),
    );
  });

  it('should populate dataSource.data when ngOnChanges is called', () => {
    technologyServiceSpy.getCategoryById.and.returnValue(mockCategory);
    technologyServiceSpy.getLifecycleById.and.returnValue(mockLifecycle);
    pictureServiceSpy.loadPicture.and.returnValue(of('some-url'));

    component.ngOnChanges();

    expect(component.dataSource.data).toEqual(
      component.mapValues([mockTechnology]),
    );
  });

  it('should navigate correctly when navigate() is called', () => {
    component.navigate(mockTechnology);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/detail/1']);
  });
});
