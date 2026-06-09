import { Technology } from 'src/app/models/technology';

export const technologiesMock: Technology[] = [
  {
    id: 1,
    name: 'React',
    description: 'Lorem ipsum dolor amet.',
    shortDescription: 'Lorem short Description.',
    pictureId: null,
    categoryId: 1,
    lifecycleId: 1,
    tags: [''],
    projects: [
      {
        id: 1,
        name: 'project1',
        customers: [
          {
            id: 1,
            name: 'customerA',
          },
        ],
      },
      {
        id: 2,
        name: 'project2',
        customers: [
          {
            id: 1,
            name: 'customerB',
          },
        ],
      },
    ],
    status: 1,
    jumpDate: Date().toString(),
    viewCount: 0,
    priority: false,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  },
  {
    id: 2,
    name: 'TypeScript',
    description: 'Lorem ipsum dolor amet.',
    shortDescription: 'Lorem short Description.',
    pictureId: null,
    categoryId: 2,
    lifecycleId: 2,
    tags: [''],
    projects: [
      {
        id: 3,
        name: 'project3',
        customers: [
          {
            id: 1,
            name: 'customerC',
          },
        ],
      },
      {
        id: 4,
        name: 'project4',
        customers: [
          {
            id: 1,
            name: 'customerD',
          },
        ],
      },
    ],
    status: 1,
    jumpDate: Date().toString(),
    viewCount: 0,
    priority: false,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  },
  {
    id: 3,
    name: 'JavaScript',
    description: 'Lorem ipsum dolor amet.',
    shortDescription: 'Lorem short Description.',
    pictureId: null,
    categoryId: 3,
    lifecycleId: 3,
    tags: [''],
    priority: false,
    projects: [],
    status: 1,
    jumpDate: Date().toString(),
    viewCount: 0,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  },
  {
    id: 4,
    name: 'Angular',
    description: 'Lorem ipsum dolor amet.',
    shortDescription: 'Lorem short Description.',
    pictureId: null,
    categoryId: 4,
    lifecycleId: 4,
    tags: [''],
    priority: false,
    projects: [
      {
        id: 5,
        name: 'project5',
        customers: [
          {
            id: 1,
            name: 'customerE',
          },
        ],
      },
    ],
    status: 1,
    jumpDate: Date().toString(),
    viewCount: 0,
    connectedTechnologyIds: [],
    connectedTechnologyNames: [],
    certificates: [],
  },
];
