export enum SubscriptionItemType {
  CATEGORY = 'CATEGORY',
  LIFECYCLE = 'LIFECYCLE',
  TECHNOLOGY = 'TECHNOLOGY',
  RADAR = 'RADAR',
}

export interface Subscription {
  id: number;
  userId: number;
  name: string;
  subscriptionItems: SubscriptionItem[];
  timespan: number;
  email: string;
}

export interface SubscriptionItem {
  itemType: SubscriptionItemType;
  itemId: number;
}

export interface SubscriptionRequest {
  name: string;
  selectedItems: SubscriptionItem[];
  timespan: number;
  email: string;
}
