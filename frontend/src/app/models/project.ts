import { Customer } from './customer';
import { Contact } from './contact';

/**
 * @interface Project
 */
export interface Project {
  id: number;
  name: string;
  industry?: string;
  customers: Customer[];
  technologyIds: number[];
  technologyNames: string[];
  description: string;
  contact: Contact[];
  salesServiceLink: string;
  info: string;
  industrySpecificInformation: string;
  startDate: string;
  endDate: string;
}

export interface ProjectReference {
  id: number;
  name: string;
  customers: Customer[];
}

export interface ProjectHistory {
  changeDate: Date;
  username: string;
  name: string;
  industry?: string;
  contact: Contact[];
  salesServiceLink: string;
  description: string;
  info: string;
  industrySpecificInformation?: string;
  startDate: string;
  endDate: string;
  customerNames: string[];
  technologyIds: number[];
  technologyNames: string[];
  isChanged: {
    name: boolean;
    contact: boolean;
    salesServiceLink: boolean;
    description: boolean;
    info: boolean;
    industrySpecificInformation: boolean;
    startDate: boolean;
    endDate: boolean;
    customerNames: boolean;
    technologyIds: boolean;
  };
}

export interface ProjectForm {
  id: number;
  name: string;
  industry?: string;
  description: string;
  contact: Contact[];
  salesServiceLink: string;
  info: string;
  industrySpecificInformation: string;
  startDate: string;
  endDate: string;
  customers: Customer[];
}
