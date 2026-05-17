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
  matiere: string;
  poidsKg: number;
  photos: string[];
  description: string;
  qualite: string;
  couleur: string;
  laverSeul: boolean;
}

export interface Commande {
  id: string;
  clientName: string;
  clientId: string;
  vetements: Vetement[];
  status: OrderStatus;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  clientId: string; // The client this conversation belongs to
}

export interface OrderState {
  address: string;
  collectionDate: string;
  deliveryDate: string;
  services: string[];
}
