export interface Profile {
  id: string;
  userId: string;
  bio?: string;
  photoUrl?: string;
  phone?: string;
  address?: string;
  birthday?: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  events: boolean;
  sermons: boolean;
  announcements: boolean;
}
