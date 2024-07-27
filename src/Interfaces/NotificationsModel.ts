export interface NotificationInput {
  id: number;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  read: boolean;
  userId: number;

}