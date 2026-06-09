import { ProjectReference } from './project';

/**
 * @interface Category
 * Model representing a technology category.
 */
export interface Category {
  id: number;
  name: string;
  description: string;
}

/**
 * @interface Lifecycle
 * Model representing the lifecycle stage of a technology.
 */
export interface Lifecycle {
  id: number;
  name: string;
  description: string;
}

/**
 * @interface Tag
 * Model representing a technology tag.
 */
export interface Tag {
  name: string;
}

export interface Industry {
  id: number;
  name: string;
}

/**
 * @interface CertificateForm
 * Represents the structure of a certificate for a technology
 */
export interface CertificateForm {
  name: string;
  description: string;
  prerequisites: number[];
  followUps: number[];
  readonly?: boolean;
}

export interface Certificate {
  id: number;
  name: string;
  description: string;
  prerequisites: number[];
  followUps: number[];
}

/**
 * @interface Technology
 * Model representing a technology entity.
 */
export interface Technology {
  id: number;
  name: string;
  description: string;
  shortDescription: string;
  pictureId: number | null;
  categoryId: number;
  lifecycleId: number;
  status: number;
  jumpDate: string;
  tags: string[];
  certificates: Certificate[];
  projects: ProjectReference[];
  viewCount: number;
  connectedTechnologyIds: number[];
  connectedTechnologyNames: string[];
  priority: boolean;
}

/**
 * @interface TechnologyRequest
 * Model for creating or updating a technology.
 */
export interface TechnologyRequest {
  name: string;
  description: string;
  shortDescription: string;
  pictureData: string | null;
  isNewPic: boolean;
  categoryId: number;
  lifecycleId: number;
  tags: string[];
  certificates: CertificateForm[];
  projectIds: number[];
  connectedTechnologyIds: number[];
  priority: boolean;
}

export interface TechnologyReference {
  name: string;
  id: number;
}

/**
 * @interface THistory
 * Model representing the history of changes for a technology.
 */
export interface THistory {
  date: Date;
  username: string;
  name: string;
  categoryName: string;
  lifecycleName: string;
  description: string;
  shortDescription: string;
  pictureId: number;
  tags: string[];
  priority: boolean;
  isChanged: {
    name: boolean;
    category: boolean;
    lifecycle: boolean;
    description: boolean;
    shortDescription: boolean;
    picture: boolean;
    priority: boolean;
  };
}

export interface TecSwapElement {
  id: number;
  technologyId: number;
  tecSwap: string;
  isCompleted: boolean;
  editDate: string | null;
  technologyName: string;
  technologyLifecycleId: number;
  technologyCategoryId: number;
  technologyIsPriority: boolean;
}

/**
 * @interface Picture
 * Model representing a picture entity.
 */
export interface Picture {
  id: number;
  data: string;
}
