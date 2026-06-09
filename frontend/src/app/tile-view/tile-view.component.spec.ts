import { TileViewComponent } from './tile-view.component';
import { Technology } from 'src/app/models/technology';

describe('TileViewComponent', () => {
  let component: TileViewComponent;

  beforeEach(() => {
    const mockTechnology: Technology[] = [
      {
        id: 5,
        name: 'yyy',
        description: 'string',
        shortDescription: 'string',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 1,
        name: 'bbb',
        description: 'string',
        shortDescription: 'string',
        pictureId: null,
        categoryId: 1,
        lifecycleId: 1,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 2,
        name: 'aaa',
        description: 'string1',
        shortDescription: 'string1',
        pictureId: null,
        categoryId: 2,
        lifecycleId: 2,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 3,
        name: 'ccc',
        description: 'string1',
        shortDescription: 'string1',
        pictureId: null,
        categoryId: 2,
        lifecycleId: 2,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
      {
        id: 4,
        name: 'zzz',
        description: 'string1',
        shortDescription: 'string1',
        pictureId: null,
        categoryId: 2,
        lifecycleId: 2,
        tags: [],
        projects: [],
        status: 1,
        priority: false,
        jumpDate: '2023-08-20',
        viewCount: 0,
        connectedTechnologyIds: [],
        connectedTechnologyNames: [],
        certificates: [],
      },
    ];
    component = new TileViewComponent();
    component.technologies = mockTechnology;
    component.ngOnChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should sort technologies by name ascending', () => {
    component.selectedSort = 1;
    component.sortTechnologies();

    component.sortedTechnologies.forEach((technology, index) => {
      if (index < component.sortedTechnologies.length - 1) {
        expect(
          technology.name.localeCompare(
            component.sortedTechnologies[index + 1].name,
          ),
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  it('should sort technologies by name descending', () => {
    component.selectedSort = 2;
    component.sortTechnologies();

    component.sortedTechnologies.forEach((technology, index) => {
      if (index < component.sortedTechnologies.length - 1) {
        expect(
          technology.name.localeCompare(
            component.sortedTechnologies[index + 1].name,
          ),
        ).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
