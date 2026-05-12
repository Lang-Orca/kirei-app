export type ServiceType = 'kilo' | 'piece' | 'house' | 'special';

export interface LaundryService {
  id: string;
  name: string;
  description: string;
  price?: string;
  delay?: string;
  type: ServiceType;
}

export interface OrderState {
  address: string;
  collectionDate: string;
  deliveryDate: string;
  services: string[];
}
