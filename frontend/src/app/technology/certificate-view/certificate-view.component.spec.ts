import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertificateViewComponent } from './certificate-view.component';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { TechnologyService } from 'src/app/services/technology.service';
import { Technology } from 'src/app/models/technology';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';

describe('CertificateViewComponent', () => {
  let component: CertificateViewComponent;
  let fixture: ComponentFixture<CertificateViewComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let technologyServiceSpy: jasmine.SpyObj<TechnologyService>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    technologyServiceSpy = jasmine.createSpyObj('TechnologyService', [
      'getTechnologies',
    ]);

    await TestBed.configureTestingModule({
      declarations: [CertificateViewComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,
        MatTableModule,
        MatSortModule,
        MatPaginatorModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: TechnologyService, useValue: technologyServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CertificateViewComponent);
    component = fixture.componentInstance;

    const mockTechnology: Technology[] = [
      {
        id: 1,
        name: 'Example Technology',
        description: 'This is an example technology.',
        shortDescription: 'A short description',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 2,
        priority: false,
        tags: ['Example', 'Technology'],
        projects: [
          {
            id: 1,
            name: 'project1',
            customers: [
              {
                id: 1,
                name: 'customer1',
              },
            ],
          },
        ],
        status: 1,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [
          {
            id: 1,
            name: 'test',
            description: 'test',
            prerequisites: [],
            followUps: [],
          },
        ],
      },
    ];

    technologyServiceSpy.getTechnologies.and.returnValue(of(mockTechnology));
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test if inOnInit works', () => {
    component.ngOnInit();
    expect(component.dataSource.data.length).toBe(1);
  });

  it('should test if getCertificateNames works correctly', () => {
    const testTechnology: Technology = {
      name: 'test',
      certificates: [
        {
          id: 1,
          name: 'test',
          description: 'test',
        },
      ],
    } as Technology;
    const certificateName = component.getCertificateNames(testTechnology);
    expect(certificateName).toBe('test');
    const testTechnology2 = {
      name: 'test2',
      certificates: [],
    } as unknown as Technology;
    const certificateName2 = component.getCertificateNames(testTechnology2);
    expect(certificateName2).toBe('Keine Zertifikate');
  });

  it('should navigate to correct route', () => {
    const testTechnology: Technology = { id: 1, name: 'test' } as Technology;
    component.navigate(testTechnology);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/detail/1']);
  });
});
