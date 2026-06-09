/**
 * @interface CustomerProjectTechnology
 * Represents the relationship between a technology and the projects of its customers.
 * Each entry links a customer project to a technology.
 */
export interface CustomerProjectTechnology {
  customerProject: CustomerProject;
}

export interface CustomerProject {
  name: string;
  customer: Customer;
}

export interface Customer {
  id: number;
  name: string;
}
