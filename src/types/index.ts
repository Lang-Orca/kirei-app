export type ServiceType = 'kilo' | 'piece' | 'house' | 'special';
export type OrderStatus = 'En attente' | 'Lavage' | 'Prêt' | 'Livré';

export interface LaundryService {
  id: string;
  name: string;
  description: string;
  price?: string;
  delay?: string;
  type: ServiceType;
}

export interface Vetement {
  id: string;
  pieces: number;
  matiere: 'coton' | 'soie' | 'synthétique' | string;
  poidsKg: number;
  photoDataUrl: string;
}

export interface Commande {
  id: string;
  clientName: string;
  clientId: string;
  vetement: Vetement;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderState {
  address: string;
  collectionDate: string;
  deliveryDate: string;
  services: string[];
}
